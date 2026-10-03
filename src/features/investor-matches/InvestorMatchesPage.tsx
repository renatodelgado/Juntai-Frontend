import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HeartIcon,
  CompassIcon,
  SlidersHorizontalIcon,
} from '@phosphor-icons/react';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { useDiscovery } from '@/features/explore-startups/useDiscovery';
import { DiscoveryLayout } from '@/features/explore-startups/components/DiscoveryLayout';
import { StartupMasonryGrid } from '@/features/explore-startups/components/StartupMasonryGrid';
import { MeetingRequestModal } from '@/features/explore-startups/components/ConnectionModals';
import type { Startup } from '@/features/explore-startups/model';
import {
  demoMatchesRepository,
  defaultMatchFilters,
  matchSummary,
  selectMatches,
  type Match,
  type MatchFilters as FiltersType,
} from './model';
import { MatchFilters } from './components/MatchFilters';
import { HighlightedMatch, MatchCard } from './components/MatchPresentation';
import * as S from './Matches.styles';
import { Grid, Card } from '@/features/explore-startups/Explore.styles';

export function InvestorMatchesPage() {
  const data = useDiscovery();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [interest, setInterest] = useState<Startup | null>(null);
  const [meeting, setMeeting] = useState<Startup | null>(null);
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (data.loading || data.failed) return;
    let active = true;
    demoMatchesRepository
      .list(data.user, data.startups, data.connections)
      .then((items) => {
        if (active) setMatches(items);
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
  }, [
    data.loading,
    data.failed,
    data.user,
    data.startups,
    data.connections,
    attempt,
  ]);
  const filters = Object.fromEntries(
    Object.entries(defaultMatchFilters).map(([key, value]) => [
      key,
      params.get(key) ?? value,
    ]),
  ) as FiltersType;
  function change(key: keyof FiltersType, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  function clear() {
    setParams(
      (previous) => {
        const next = new URLSearchParams();
        if (previous.has('sort')) next.set('sort', previous.get('sort')!);
        return next;
      },
      { replace: true },
    );
  }
  const confirmed = matches.filter((match) =>
    data.state.interests.some(
      (interest) => interest.startupId === match.startup.id,
    ),
  );
  const visible = selectMatches(confirmed, filters, data.state);
  const summary = matchSummary(visible, data.state);
  const highlight = visible
    .filter(
      (match) =>
        match.startup.compatibility !== undefined &&
        !data.state.discarded.includes(match.startup.id),
    )
    .sort((a, b) => b.startup.compatibility! - a.startup.compatibility!)[0];
  const busy = data.loading || loading;
  const error = data.failed || failed;
  function retry() {
    setLoading(true);
    setFailed(false);
    if (data.failed) data.retry();
    else setAttempt((value) => value + 1);
  }
  return (
    <DiscoveryLayout data={data}>
      <PageHeader
        title="Seus matches"
        subtitle="Startups em que você demonstrou interesse na aba Explorar."
        breadcrumbs={[{ label: 'Matches' }]}
        actions={
          <S.PreferencesButton
            as={Link}
            to="/investidor/perfil"
            $variant="secondary"
            aria-label="Minhas preferências"
          >
            <SlidersHorizontalIcon size={17} />
            <span>Minhas preferências</span>
          </S.PreferencesButton>
        }
      />
      <S.Intro>
        <div className="intro-copy">
          <HeartIcon size={29} aria-hidden="true" />
          <div>
            <h2>Seus interesses. Próximos passos.</h2>
            <p>
              Acompanhe as startups que você escolheu explorar e avance suas
              conexões.
            </p>
          </div>
        </div>
        <dl aria-label="Resumo dos matches">
          <div>
            <dd>{busy ? '—' : summary.total}</dd>
            <dt>matches confirmados</dt>
          </div>
          <div>
            <dd>{busy ? '—' : summary.high}</dd>
            <dt>alta compatibilidade · 90%+</dt>
          </div>
          <div>
            <dd>{busy ? '—' : summary.started}</dd>
            <dt>conexões iniciadas</dt>
          </div>
        </dl>
      </S.Intro>
      <MatchFilters filters={filters} change={change} clear={clear} />
      {error ? (
        <div className="empty" role="alert">
          <h2>Não foi possível carregar seus matches</h2>
          <p>Tente novamente em instantes.</p>
          <Button onClick={retry}>Tentar novamente</Button>
        </div>
      ) : busy ? (
        <Grid $list={false} aria-label="Carregando matches" aria-busy="true">
          {[1, 2].map((item) => (
            <Card key={item} $list={false}>
              <div
                style={{
                  height: item === 1 ? 280 : 350,
                  background: '#f0edf6',
                }}
              />
            </Card>
          ))}
        </Grid>
      ) : !confirmed.length ? (
        <div className="empty">
          <CompassIcon size={38} />
          <h2>Você ainda não tem matches</h2>
          <p>
            Demonstre interesse em uma startup na aba Explorar para que ela
            apareça aqui.
          </p>
          <div className="actions" style={{ justifyContent: 'center' }}>
            <Button as={Link} to="/investidor/startups">
              Explorar startups
            </Button>
            <Button as={Link} to="/investidor/perfil" $variant="secondary">
              Revisar meu perfil
            </Button>
          </div>
        </div>
      ) : !visible.length ? (
        <div className="empty">
          <h2>Nenhum match encontrado</h2>
          <p>Tente ajustar os filtros para visualizar seus matches.</p>
          <Button onClick={clear}>Limpar filtros</Button>
        </div>
      ) : (
        <>
          {highlight && (
            <HighlightedMatch
              match={highlight}
              data={data}
              search={params.toString()}
              onInterest={() => setInterest(highlight.startup)}
            />
          )}
          <div className="results">
            <div>
              <h2>Startups em que você tem interesse</h2>
              <small aria-live="polite">
                {visible.length} matches para acompanhar
              </small>
            </div>
            <select
              aria-label="Ordenar matches"
              value={filters.sort}
              onChange={(event) => change('sort', event.target.value)}
            >
              <option value="compatibility">Maior compatibilidade</option>
              <option value="recent">Mais recentes</option>
              <option value="name">Nome A–Z</option>
            </select>
          </div>
          <StartupMasonryGrid
            items={visible.map((match) => ({ id: match.startup.id }))}
            list={false}
            render={(index) => {
              const match = visible[index]!;
              return (
                <MatchCard
                  match={match}
                  data={data}
                  search={params.toString()}
                  onInterest={() => setInterest(match.startup)}
                  onMeeting={() => setMeeting(match.startup)}
                />
              );
            }}
          />
        </>
      )}
      <Modal
        open={!!interest}
        title="Demonstrar interesse?"
        cancelLabel="Cancelar"
        confirmLabel="Confirmar interesse"
        onClose={() => setInterest(null)}
        onConfirm={() => {
          if (interest && data.interest(interest.id)) setInterest(null);
        }}
      >
        <p>
          Seu interesse será compartilhado com esta startup e registrado nos
          seus matches.
        </p>
        <p>
          <strong>{interest?.name}</strong>
        </p>
      </Modal>
      <MeetingRequestModal
        startup={meeting}
        data={data}
        onClose={() => setMeeting(null)}
      />
    </DiscoveryLayout>
  );
}
