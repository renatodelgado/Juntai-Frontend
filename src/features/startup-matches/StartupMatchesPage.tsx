import { ReportButton } from '@/features/moderation/ReportButton';
import { useEffect, useState } from 'react';
import { Link, useRouteLoaderData } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  HeartIcon,
  ArrowClockwiseIcon,
  ChatCircleIcon,
  CalendarIcon,
} from '@phosphor-icons/react';
import type { AuthUser } from '@/features/auth/services/session';
import { getSession } from '@/features/auth/services/session';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { ProfilePhoto } from '@/shared/components/profile/ProfilePhoto';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { Layout, Main } from '@/shared/components/profile/Profile.styles';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import { FeedbackButton } from '@/features/feedback/FeedbackButton';
import { theme } from '@/shared/styles/theme';
import {
  receivedInterestsApi,
  type ReceivedInterests,
  type InterestedPerson,
} from './api';
import {
  contributions,
  typeLabels,
  statusLabels,
  dateLabel,
  filterInterested,
  segmentLabel,
  stagesLabel,
} from './model';
import * as S from './styles';
function ConnectionActions({ person }: { person: InterestedPerson }) {
  const feedback = person.reuniaoRealizadaId
    ? { tipo: 'reuniao' as const, id: person.reuniaoRealizadaId }
    : person.podeAvaliarConversa && person.conversaId
      ? { tipo: 'conversa' as const, id: person.conversaId }
      : null;
  return (
    <div className="actions">
      {person.conversaIniciada && (
        <Button
          as={Link}
          to={`/startup/mensagens?usuario=${encodeURIComponent(person.usuarioId)}`}
        >
          <ChatCircleIcon size={17} />
          Abrir conversa
        </Button>
      )}
      {person.reuniaoAgendadaId && (
        <Button
          as={Link}
          $variant="secondary"
          to={`/startup/reunioes?reuniao=${encodeURIComponent(person.reuniaoAgendadaId)}`}
        >
          <CalendarIcon size={17} />
          Ver reunião
        </Button>
      )}
      {feedback && <FeedbackButton context={feedback} />}
    </div>
  );
}
function Identity({ person }: { person: InterestedPerson }) {
  return (
    <div className="identity">
      <div className="avatar">
        <ProfilePhoto src={person.avatarUrl} name={person.nome} />
      </div>
      <div>
        <h2>{person.nome}</h2>
        <span className="meta">
          {typeLabels[person.tipoInvestidor]}
          {person.tituloProfissional ? ` · ${person.tituloProfissional}` : ''}
        </span>
      </div>
    </div>
  );
}
export function StartupMatchesPage() {
  const user = useRouteLoaderData<AuthUser>('startup-matches')!;
  return <Screen key={user.id} userId={user.id} />;
}
function Screen({ userId }: { userId: string }) {
  const [data, setData] = useState<ReceivedInterests | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [order, setOrder] = useState('recentes');
  const [profileId, setProfileId] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const token = getSession()?.token;
    let running = false;
    async function load() {
      if (running) return;
      running = true;
      try {
        const value = await receivedInterestsApi.list(controller.signal);
        if (!controller.signal.aborted && getSession()?.token === token) {
          setData(value);
          setError('');
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar os interessados.',
          );
      } finally {
        running = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    const focus = () => void load();
    window.addEventListener('focus', focus);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', focus);
    };
  }, [userId, attempt]);
  const reload = () => {
    setLoading(true);
    setError('');
    setAttempt((v) => v + 1);
  };
  const clear = () => {
    setSearch('');
    setType('todos');
    setStatus('todos');
    setOrder('recentes');
  };
  const items = data?.items ?? [];
  const visible = filterInterested(items, search, type, status, order);
  const selected = items.find((p) => p.investidorId === profileId);
  const showNumbers = !!data && !error;
  const linkedIn =
    selected?.linkedinUrl && /^https?:\/\//i.test(selected.linkedinUrl)
      ? selected.linkedinUrl
      : null;
  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <ProfileSidebar />
        <Main>
          <PageHeader
            title="Interessados na sua startup"
            subtitle="Conheça quem demonstrou interesse e acompanhe os próximos passos de cada conexão."
            breadcrumbs={[{ label: 'Matches' }]}
            actions={
              <Button $variant="secondary" onClick={reload} disabled={loading}>
                <ArrowClockwiseIcon size={18} />
                Atualizar
              </Button>
            }
          />
          <S.Summary aria-label="Resumo das conexões">
            <div>
              <span>Interessados</span>
              <strong>{showNumbers ? data.resumo.interessados : '—'}</strong>
            </div>
            <div>
              <span>Conversas iniciadas</span>
              <strong>
                {showNumbers ? data.resumo.conversasIniciadas : '—'}
              </strong>
            </div>
            <div>
              <span>Reuniões agendadas</span>
              <strong>
                {showNumbers ? data.resumo.reunioesAgendadas : '—'}
              </strong>
            </div>
          </S.Summary>
          <S.Filters aria-label="Busca e filtros de interessados">
            <label>
              Buscar por nome ou atuação
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Quem você procura?"
              />
            </label>
            <label>
              Atuação
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="investidor">Investidores</option>
                <option value="mentor">Mentores</option>
              </select>
            </label>
            <label>
              Situação
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todos">Todas</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ordenar por
              <select value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="recentes">Mais recentes</option>
                <option value="antigos">Mais antigos</option>
                <option value="nome">Nome</option>
              </select>
            </label>
          </S.Filters>
          {loading ? (
            <S.Empty role="status" aria-busy="true">
              <HeartIcon size={36} />
              <p>Carregando interessados…</p>
            </S.Empty>
          ) : error ? (
            <S.Empty role="alert">
              <h2>Não foi possível carregar os interessados</h2>
              <p>{error}</p>
              <Button onClick={reload}>Tentar novamente</Button>
            </S.Empty>
          ) : !items.length ? (
            <S.Empty>
              <HeartIcon size={42} />
              <h2>Suas próximas conexões começam aqui</h2>
              <p>
                Quando investidores e mentores demonstrarem interesse na sua
                startup, eles aparecerão aqui.
              </p>
              <Button as={Link} to="/startup/perfil">
                Revisar meu perfil
              </Button>
            </S.Empty>
          ) : !visible.length ? (
            <S.Empty>
              <h2>Nenhum interessado encontrado</h2>
              <p>Tente outro nome ou ajuste os filtros.</p>
              <Button $variant="secondary" onClick={clear}>
                Limpar filtros
              </Button>
            </S.Empty>
          ) : (
            <>
              <p role="status">
                {visible.length} de {items.length} interessados
                {search || type !== 'todos' || status !== 'todos' ? (
                  <Button $variant="quiet" onClick={clear}>
                    Limpar filtros
                  </Button>
                ) : null}
              </p>
              <S.Grid aria-label="Pessoas interessadas">
                {visible.map((person) => (
                  <S.Person key={person.investidorId}>
                    <span className="status">
                      {statusLabels[person.situacao]}
                    </span>
                    <Identity person={person} />
                    <p className="bio">
                      {person.bio ||
                        'Veja o perfil para conhecer os interesses e a experiência desta pessoa.'}
                    </p>
                    {!!person.segmentosInteresse.length && (
                      <p className="meta">
                        Interesses:{' '}
                        {person.segmentosInteresse
                          .map(segmentLabel)
                          .join(' · ')}
                      </p>
                    )}
                    {!!person.estagiosInteresse.length && (
                      <p className="meta">
                        Estágios:{' '}
                        {person.estagiosInteresse.map(stagesLabel).join(' · ')}
                      </p>
                    )}
                    <div className="tags" aria-label="Formas de contribuição">
                      {contributions(person).map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                    <p className="meta">
                      Interesse demonstrado em {dateLabel(person.interessadoEm)}
                    </p>
                    {person.reuniaoAgendadaEm && (
                      <p className="meta">
                        Reunião: {dateLabel(person.reuniaoAgendadaEm, true)}{' '}
                        (Brasília)
                      </p>
                    )}
                    {!person.conversaIniciada && (
                      <p className="waiting">
                        Interesse recebido. Aguardando a primeira mensagem.
                      </p>
                    )}
                    <div className="actions">
                      <Button
                        $variant="secondary"
                        onClick={() => setProfileId(person.investidorId)}
                        aria-label={`Ver perfil de ${person.nome}`}
                      >
                        Ver perfil
                      </Button>
                    </div>
                    <ConnectionActions person={person} />
                  </S.Person>
                ))}
              </S.Grid>
            </>
          )}
          <ContentDialog
            open={!!selected}
            title="Perfil do interessado"
            onClose={() => setProfileId(null)}
          >
            {selected && (
              <S.Profile>
                <Identity person={selected} />
                <ReportButton tipo="investidor" id={selected.investidorId} />
                {[selected.cidade, selected.estado].filter(Boolean).length >
                  0 && (
                  <p className="meta">
                    {[selected.cidade, selected.estado]
                      .filter(Boolean)
                      .join(' / ')}
                  </p>
                )}
                <h3>Apresentação</h3>
                <p>{selected.bio || 'Apresentação não informada.'}</p>
                <h3>Como pode contribuir</h3>
                <ul>
                  {contributions(selected).map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
                <h3>Interesses</h3>
                <p>
                  {selected.segmentosInteresse.length
                    ? selected.segmentosInteresse.map(segmentLabel).join(' · ')
                    : 'Segmentos não informados.'}
                </p>
                <p>
                  {selected.estagiosInteresse.length
                    ? selected.estagiosInteresse.map(stagesLabel).join(' · ')
                    : 'Estágios não informados.'}
                </p>
                <h3>Experiência</h3>
                {selected.anosExperiencia !== null && (
                  <p>{selected.anosExperiencia} anos de experiência</p>
                )}
                <p>
                  {selected.descricaoExperiencia ||
                    'Experiência não informada.'}
                </p>
                {linkedIn && (
                  <Button
                    as="a"
                    href={linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    $variant="secondary"
                  >
                    Ver LinkedIn
                  </Button>
                )}
                <p className="meta">
                  Interesse demonstrado em {dateLabel(selected.interessadoEm)}
                </p>
                <ConnectionActions person={selected} />
              </S.Profile>
            )}
          </ContentDialog>
        </Main>
      </Layout>
    </ThemeProvider>
  );
}
