import { useEffect, useRef, useState } from 'react';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import { useProfileApproval } from '@/features/auth/useProfileApproval';
import type { AuthUser } from '@/features/auth/services/session';
import type { Conversation } from '@/features/messages/model';
import { defaultFilters, type Filters, type Startup } from './model';
import type { DiscoverySummary, StartupPage } from './api';
import { getSession } from '@/features/auth/services/session';
import { startupRepository, interestsApi } from './api';

export type DiscoveryState = {
  saved: string[];
  interests: { startupId: string; createdAt: string }[];
  viewed: string[];
  discarded: string[];
};
const empty: DiscoveryState = {
  saved: [],
  interests: [],
  viewed: [],
  discarded: [],
};
export function readDiscovery(userId: string): DiscoveryState {
  const raw = localStorage.getItem(`juntai:discovery:${userId}`);
  if (!raw) return empty;
  const value = JSON.parse(raw) as DiscoveryState;
  if (!Array.isArray(value.saved) || !Array.isArray(value.interests))
    throw new Error('Invalid local state');
  return {
    saved: value.saved,
    interests: value.interests,
    viewed: Array.isArray(value.viewed) ? value.viewed : [],
    discarded: Array.isArray(value.discarded) ? value.discarded : [],
  };
}
export function useDiscovery(filters?: Filters) {
  const approved = useProfileApproval();
  const listUser = useRouteLoaderData<AuthUser>('discovery-list');
  const profileUser = useRouteLoaderData<AuthUser>('discovery-profile');
  const matchesUser = useRouteLoaderData<AuthUser>('investor-matches');
  const user = (listUser ?? profileUser ?? matchesUser)!;
  const userId = user.id;
  const token = getSession()?.token;
  const userRef = useRef(user);
  const discoveryOwner = useRef(userId);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [connections] = useState<Conversation[]>([]);
  const [state, setState] = useState<DiscoveryState>(() =>
    readDiscovery(user.id),
  );
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState('');
  const { id: profileId } = useParams();
  const filterKey = filters ? JSON.stringify({ ...filters, view: '' }) : '';
  const savedKey = filters?.saved ? JSON.stringify(state.saved) : '';
  const summaryKey = JSON.stringify([userId, token, filterKey, savedKey]);
  const [summary, setSummary] = useState<
    (DiscoverySummary & { key: string }) | null
  >(null);
  useEffect(() => {
    if (!filterKey || !approved) return;
    const selected: Filters = JSON.parse(filterKey);
    if (
      selected.sort &&
      !['compatibility', 'recommended'].includes(selected.sort)
    )
      return;
    const controller = new AbortController();
    const stored = readDiscovery(userId);
    const timer = setTimeout(() => {
      void startupRepository
        .summary(selected, stored.saved, controller.signal)
        .then((value) => {
          if (!controller.signal.aborted)
            setSummary({ ...value, key: summaryKey });
        })
        .catch(() => {
          /* A failed summary must not hide successfully loaded recommendations. */
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [userId, token, approved, filterKey, savedKey, summaryKey, attempt]);
  const [pagination, setPagination] = useState<Omit<StartupPage, 'items'>>({
    total: 0,
    hasMore: false,
    facets: { locations: [], segments: 0, regions: 0 },
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const request = useRef<{
    controller: AbortController;
    page: number;
    busy: boolean;
    filters: Filters | null;
    saved: string[];
  } | null>(null);
  useEffect(() => {
    const user = userRef.current;
    const controller = new AbortController();
    const stored = readDiscovery(user.id);
    const selected: Filters | null = filterKey ? JSON.parse(filterKey) : null;
    const current = {
      controller,
      page: 0,
      busy: true,
      filters: selected,
      saved: stored.saved,
    };
    request.current = current;
    const timer = setTimeout(
      () => {
        if (discoveryOwner.current !== user.id) {
          discoveryOwner.current = user.id;
          setState(stored);
          setNotice('');
        }
        setLoading(true);
        setFailed(false);
        setLoadingMore(false);
        setMoreFailed(false);
        const interestsPromise = approved
          ? interestsApi.list(controller.signal)
          : Promise.resolve([]);
        const listing = selected
          ? startupRepository.page(
              user,
              selected,
              stored.saved,
              0,
              controller.signal,
            )
          : profileId && approved
            ? startupRepository.page(
                user,
                { ...defaultFilters, saved: 'yes', sort: 'compatibility' },
                [profileId],
                0,
                controller.signal,
              )
            : profileId
              ? startupRepository
                  .get(user, profileId, controller.signal)
                  .then((item) => ({
                    items: [item],
                    total: 1,
                    hasMore: false,
                    facets: { locations: [], segments: 0, regions: 0 },
                  }))
              : interestsPromise.then(async (interests) => ({
                  items: await Promise.all(
                    interests.map((item) =>
                      startupRepository.get(
                        user,
                        item.startupId,
                        controller.signal,
                      ),
                    ),
                  ),
                  total: interests.length,
                  hasMore: false,
                  facets: { locations: [], segments: 0, regions: 0 },
                }));
        void interestsPromise
          .then((interests) => {
            if (controller.signal.aborted) return;
            setState((current) => ({
              ...current,
              interests: interests.map((item) => ({
                startupId: item.startupId,
                createdAt: item.createdAt,
              })),
            }));
          })
          .catch(() => {
            if (!controller.signal.aborted)
              setNotice(
                'Não foi possível atualizar seus interesses. Tente novamente.',
              );
          });
        listing
          .then((result) => {
            if (controller.signal.aborted) return;
            setStartups(result.items);
            setPagination(result);
          })
          .catch(() => {
            if (!controller.signal.aborted) setFailed(true);
          })
          .finally(() => {
            if (!controller.signal.aborted) {
              current.busy = false;
              setLoading(false);
            }
          });
      },
      filterKey ? 200 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [userId, token, approved, attempt, filterKey, savedKey, profileId]);
  async function loadMore() {
    const current = request.current;
    if (
      !current?.filters ||
      current.busy ||
      current.controller.signal.aborted ||
      !pagination.hasMore ||
      loading ||
      failed
    )
      return;
    current.busy = true;
    setLoadingMore(true);
    setMoreFailed(false);
    try {
      const result = await startupRepository.page(
        user,
        current.filters,
        current.saved,
        current.page + 1,
        current.controller.signal,
      );
      if (current.controller.signal.aborted) return;
      current.page++;
      setStartups((previous) => {
        const seen = new Set(previous.map((item) => item.id));
        return [
          ...previous,
          ...result.items.filter((item) => !seen.has(item.id)),
        ];
      });
      setPagination(result);
    } catch {
      if (!current.controller.signal.aborted) setMoreFailed(true);
    } finally {
      current.busy = false;
      if (!current.controller.signal.aborted) setLoadingMore(false);
    }
  }
  function commit(next: DiscoveryState, message: string) {
    try {
      localStorage.setItem(`juntai:discovery:${user.id}`, JSON.stringify(next));
      setState(next);
      setNotice(message);
      return true;
    } catch {
      setNotice('Não foi possível salvar. Tente novamente.');
      return false;
    }
  }
  function save(id: string) {
    const exists = state.saved.includes(id);
    commit(
      {
        ...state,
        saved: exists
          ? state.saved.filter((item) => item !== id)
          : [...state.saved, id],
      },
      exists
        ? 'Startup removida das salvas.'
        : 'Startup salva na demonstração.',
    );
  }
  async function interest(id: string) {
    if (!approved)
      throw new Error(
        'Aguarde a aprovação do seu perfil para confirmar interesse.',
      );
    const result = await interestsApi.confirm(id);
    setState((current) => ({
      ...current,
      interests: [
        ...current.interests.filter((item) => item.startupId !== id),
        { startupId: id, createdAt: result.createdAt },
      ],
    }));
    setNotice('Interesse confirmado. Você já pode iniciar a conversa.');
    return result;
  }
  function viewed(id: string) {
    if (!state.viewed.includes(id))
      commit({ ...state, viewed: [...state.viewed, id] }, '');
  }
  function discard(id: string) {
    const exists = state.discarded.includes(id);
    commit(
      {
        ...state,
        discarded: exists
          ? state.discarded.filter((item) => item !== id)
          : [...state.discarded, id],
      },
      exists
        ? 'Recomendação restaurada.'
        : 'Recomendação descartada. Você pode restaurá-la pelo filtro de status.',
    );
  }
  return {
    approved,
    user,
    startups,
    origemRecomendacao: pagination.origemRecomendacao,
    fallback: pagination.fallback,
    avisos: pagination.avisos,
    catalogTotal:
      summary?.key === summaryKey
        ? summary.total
        : filters?.sort &&
            !['compatibility', 'recommended'].includes(filters.sort) &&
            !loading
          ? pagination.total
          : undefined,
    total: pagination.total,
    hasMore: pagination.hasMore,
    facets: summary?.key === summaryKey ? summary.facets : pagination.facets,
    loadingMore,
    moreFailed,
    loadMore,
    connections,
    state,
    loading,
    failed,
    notice,
    save,
    interest,
    viewed,
    discard,
    retry: () => {
      setLoading(true);
      setFailed(false);
      setAttempt((n) => n + 1);
    },
  };
}
export type Discovery = ReturnType<typeof useDiscovery>;
