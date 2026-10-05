import { useEffect, useState } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { useProfileApproval } from '@/features/auth/useProfileApproval';
import type { AuthUser } from '@/features/auth/services/session';
import {
  demoMessagesRepository,
  type Conversation,
} from '@/features/messages/model';
import { demoStartupRepository, type Startup } from './model';
import { demoMeetingsRepository } from '@/features/meetings/repository';

export type MeetingInvitation = {
  id: string;
  startupId: string;
  startupName: string;
  date: string;
  time: string;
  duration: string;
  format: string;
  link: string;
  notes: string;
  status: 'pending';
};
export type DiscoveryState = {
  saved: string[];
  interests: { startupId: string; createdAt: string }[];
  meetings: MeetingInvitation[];
  viewed: string[];
  discarded: string[];
};
const empty: DiscoveryState = {
  saved: [],
  interests: [],
  meetings: [],
  viewed: [],
  discarded: [],
};
export function readDiscovery(userId: string): DiscoveryState {
  const raw = localStorage.getItem(`juntai:discovery:${userId}`);
  if (!raw) return empty;
  const value = JSON.parse(raw) as DiscoveryState;
  if (
    !Array.isArray(value.saved) ||
    !Array.isArray(value.interests) ||
    !Array.isArray(value.meetings)
  )
    throw new Error('Invalid local state');
  return {
    ...value,
    viewed: Array.isArray(value.viewed) ? value.viewed : [],
    discarded: Array.isArray(value.discarded) ? value.discarded : [],
  };
}
export function useDiscovery() {
  const approved = useProfileApproval();
  const listUser = useRouteLoaderData<AuthUser>('discovery-list');
  const profileUser = useRouteLoaderData<AuthUser>('discovery-profile');
  const matchesUser = useRouteLoaderData<AuthUser>('investor-matches');
  const user = (listUser ?? profileUser ?? matchesUser)!;
  const [startups, setStartups] = useState<Startup[]>([]);
  const [connections, setConnections] = useState<Conversation[]>([]);
  const [state, setState] = useState<DiscoveryState>(empty);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      demoStartupRepository.list(user),
      demoMessagesRepository.list(user),
    ])
      .then(([items, chats]) => {
        const stored = readDiscovery(user.id);
        if (active) {
          setStartups(items);
          setConnections(chats.filter((chat) => chat.status === 'active'));
          setState(stored);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, attempt]);
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
  function interest(id: string) {
    if (state.interests.some((item) => item.startupId === id)) return true;
    return commit(
      {
        ...state,
        interests: [
          ...state.interests,
          { startupId: id, createdAt: new Date().toISOString() },
        ],
      },
      'Interesse enviado e registrado no histórico da demonstração.',
    );
  }
  function meeting(value: Omit<MeetingInvitation, 'id' | 'status'>) {
    if (!approved) return false;
    if (!connections.some((chat) => chat.participant.id === value.startupId))
      return false;
    try {
      demoMeetingsRepository.create(user, {
        participantId: value.startupId,
        date: value.date,
        time: value.time,
        duration: Number(value.duration),
        format:
          value.format === 'Presencial'
            ? 'presential'
            : value.format === 'Telefone'
              ? 'phone'
              : 'online',
        title: `Conversa com ${value.startupName}`,
        description: value.notes,
        link: value.link,
        address: '',
      });
      setNotice(
        'Convite enviado. Aguardando confirmação da startup. Acompanhe em Reuniões.',
      );
      return true;
    } catch (cause) {
      setNotice(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar o convite. Tente novamente.',
      );
      throw cause;
    }
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
    connections,
    state,
    loading,
    failed,
    notice,
    save,
    interest,
    meeting,
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
