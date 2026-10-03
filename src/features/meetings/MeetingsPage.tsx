import { useState } from 'react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  ListIcon,
  SquaresFourIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { Layout, Card } from '@/shared/components/profile/Profile.styles';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Form } from '@/features/explore-startups/Explore.styles';
import {
  logout,
  profilePath,
  type AuthUser,
} from '@/features/auth/services/session';
import { theme, investorTheme } from '@/shared/styles/theme';
import {
  demoMeetingsRepository,
  meetingAccount,
  meetingConnections,
} from './repository';
import {
  canJoin,
  dayLabel,
  effectiveStatus,
  formatLabels,
  meetingSummary,
  selectMeetings,
  startTime,
  statusLabels,
  roleLabels,
  type MeetingInput,
  type MeetingFilters,
  type MeetingStatus,
  type ScheduledMeeting,
} from './model';
import { useMeetings } from './useMeetings';
import { MeetingEditor } from './components/MeetingEditor';
import { MeetingCalendar } from './components/MeetingCalendar';
import { MeetingList } from './components/MeetingList';
import * as S from './Meetings.styles';

export function MeetingsPage() {
  const startupUser = useRouteLoaderData<AuthUser>('startup-meetings');
  const investorUser = useRouteLoaderData<AuthUser>('investidor-meetings');
  const user = (startupUser ?? investorUser)!;
  return <MeetingsScreen key={user.id} user={user} />;
}
function MeetingsScreen({ user }: { user: AuthUser }) {
  const data = useMeetings(user);
  const navigate = useNavigate();
  const self = meetingAccount(user);
  const connections = meetingConnections(user);
  const [filters, setFilters] = useState<MeetingFilters>({
    tab: 'confirmed',
    q: '',
    period: '',
    from: '',
    to: '',
    format: '',
    sort: 'asc',
  });
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedId, setSelected] = useState<string | null>(null);
  const [editor, setEditor] = useState<ScheduledMeeting | 'new' | null>(null);
  const [confirmation, setConfirmation] = useState<{
    action: 'cancel' | 'decline' | 'reschedule';
    meeting: ScheduledMeeting;
    input?: MeetingInput;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const selected = data.meetings.find((meeting) => meeting.id === selectedId);
  const summary = meetingSummary(data.meetings, data.now);
  const visible = selectMeetings(data.meetings, filters, data.now);
  const types = [...new Set(data.meetings.map((meeting) => meeting.format))];
  const filtered = !!(filters.q || filters.period || filters.format);
  function clear() {
    setFilters({ ...filters, q: '', period: '', from: '', to: '', format: '' });
  }
  function mutate(action: () => void, message: string) {
    try {
      action();
      setError('');
      setNotice(message);
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível atualizar a reunião. Tente novamente.',
      );
      return false;
    }
  }
  function openEditor(value: ScheduledMeeting | 'new') {
    setError('');
    setSelected(null);
    setEditor(value);
  }
  function request(action: 'cancel' | 'decline', meeting: ScheduledMeeting) {
    setError('');
    setReason('');
    setSelected(null);
    setConfirmation({ action, meeting });
  }
  function confirm() {
    if (!confirmation) return;
    const { action, meeting, input } = confirmation;
    const success = mutate(
      () => {
        if (action === 'cancel')
          demoMeetingsRepository.cancel(user, meeting.id, reason);
        else if (action === 'decline')
          demoMeetingsRepository.respond(user, meeting.id, false);
        else demoMeetingsRepository.reschedule(user, meeting.id, input!);
      },
      action === 'reschedule'
        ? 'Reagendamento solicitado. Aguardando confirmação do participante.'
        : action === 'decline'
          ? 'Convite recusado.'
          : 'Reunião cancelada.',
    );
    if (success) {
      setConfirmation(null);
      setEditor(null);
    }
  }
  return (
    <ThemeProvider
      theme={user.tipoPerfil === 'startup' ? theme : investorTheme}
    >
      <Layout>
        <ProfileSidebar
          profilePath={profilePath(user.tipoPerfil)}
          name={user.nome}
          subtitle={roleLabels[self.role]}
          status="Minha agenda"
          onSettings={() => void navigate(profilePath(user.tipoPerfil))}
          onLogout={() => {
            logout();
            void navigate('/login');
          }}
        />
        <S.Main>
          <PageHeader
            title="Reuniões Agendadas"
            subtitle="Acompanhe seus encontros, organize sua agenda e mantenha suas conexões em andamento."
            breadcrumbs={[{ label: 'Reuniões' }]}
            actions={
              <S.ScheduleButton
                aria-label="Agendar reunião"
                onClick={() => openEditor('new')}
              >
                <CalendarIcon size={18} />
                <span>Agendar reunião</span>
              </S.ScheduleButton>
            }
          />
          {notice && (
            <div className="notice" role="status">
              {notice}
            </div>
          )}
          <S.Summary aria-label="Resumo da agenda">
            {[
              { label: 'Próximas reuniões', value: summary.upcoming },
              { label: 'Aguardando confirmação', value: summary.pending },
              { label: 'Reuniões realizadas', value: summary.completed },
              { label: 'Esta semana', value: summary.week },
            ].map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{data.loading ? '—' : item.value}</strong>
              </div>
            ))}
          </S.Summary>
          <S.Toolbar aria-label="Filtros da agenda">
            <div className="tabs">
              {(
                [
                  { value: 'confirmed', label: 'Próximas' },
                  { value: 'pending', label: 'Pendentes' },
                  { value: 'completed', label: 'Concluídas' },
                  { value: 'cancelled', label: 'Canceladas' },
                ] as { value: MeetingStatus; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.value}
                  aria-pressed={filters.tab === tab.value}
                  onClick={() => setFilters({ ...filters, tab: tab.value })}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="filters">
              <label className="search">
                <MagnifyingGlassIcon size={19} />
                <input
                  type="search"
                  aria-label="Buscar participante"
                  placeholder="Buscar startup, investidor ou mentor..."
                  value={filters.q}
                  onChange={(event) =>
                    setFilters({ ...filters, q: event.target.value })
                  }
                />
              </label>
              <select
                aria-label="Período"
                value={filters.period}
                onChange={(event) =>
                  setFilters({ ...filters, period: event.target.value })
                }
              >
                <option value="">Todos os períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
                <option value="custom">Período personalizado</option>
              </select>
              {types.length > 1 && (
                <select
                  aria-label="Formato"
                  value={filters.format}
                  onChange={(event) =>
                    setFilters({ ...filters, format: event.target.value })
                  }
                >
                  <option value="">Todos os formatos</option>
                  {types.map((type) => (
                    <option value={type} key={type}>
                      {formatLabels[type]}
                    </option>
                  ))}
                </select>
              )}
              <select
                aria-label="Ordenar reuniões"
                value={filters.sort}
                onChange={(event) =>
                  setFilters({ ...filters, sort: event.target.value })
                }
              >
                <option value="asc">Mais próximas primeiro</option>
                <option value="desc">Mais distantes primeiro</option>
              </select>
              <div className="switch">
                <button
                  aria-label="Visualização em lista"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <ListIcon size={18} />
                </button>
                <button
                  aria-label="Visualização em calendário"
                  aria-pressed={view === 'calendar'}
                  onClick={() => setView('calendar')}
                >
                  <SquaresFourIcon size={18} />
                </button>
              </div>
              {filtered && (
                <Button $variant="quiet" onClick={clear}>
                  Limpar filtros
                </Button>
              )}
            </div>
            {filters.period === 'custom' && (
              <div className="custom">
                <label>
                  De
                  <input
                    aria-label="Data inicial"
                    type="date"
                    value={filters.from}
                    onChange={(event) =>
                      setFilters({ ...filters, from: event.target.value })
                    }
                  />
                </label>
                <label>
                  Até
                  <input
                    aria-label="Data final"
                    type="date"
                    min={filters.from}
                    value={filters.to}
                    onChange={(event) =>
                      setFilters({ ...filters, to: event.target.value })
                    }
                  />
                </label>
                {filters.from && filters.to && filters.from > filters.to && (
                  <p role="alert">A data final deve ser posterior à inicial.</p>
                )}
              </div>
            )}
          </S.Toolbar>
          {data.loading ? (
            <Card aria-busy="true" role="status">
              Preparando sua agenda…
            </Card>
          ) : data.failed ? (
            <Card role="alert">
              <h2>Não foi possível carregar sua agenda</h2>
              <p>Tente novamente em instantes.</p>
              <Button onClick={data.retry}>Tentar novamente</Button>
            </Card>
          ) : !data.meetings.length ? (
            <div className="empty">
              <CalendarIcon size={38} />
              <h2>Sua agenda está livre por enquanto</h2>
              <p>
                Agende uma conversa com uma conexão existente para dar o próximo
                passo.
              </p>
              <Button onClick={() => openEditor('new')}>Agendar reunião</Button>
            </div>
          ) : !visible.length ? (
            <div className="empty">
              <h2>
                {filtered
                  ? 'Nenhuma reunião encontrada'
                  : 'Nenhuma reunião nesta categoria'}
              </h2>
              <p>
                {filtered
                  ? 'Experimente ajustar o período ou buscar por outro participante.'
                  : 'Seus compromissos aparecerão aqui quando estiverem neste status.'}
              </p>
              {filtered && <Button onClick={clear}>Limpar filtros</Button>}
            </div>
          ) : view === 'calendar' ? (
            <MeetingCalendar
              meetings={visible}
              onSelect={(meeting) => {
                setError('');
                setSelected(meeting.id);
              }}
            />
          ) : (
            <MeetingList
              meetings={visible}
              selfId={self.id}
              now={data.now}
              onSelect={(meeting) => {
                setError('');
                setSelected(meeting.id);
              }}
            />
          )}
        </S.Main>
        <ContentDialog
          open={!!editor && !confirmation}
          title={editor === 'new' ? 'Agendar reunião' : 'Reagendar reunião'}
          onClose={() => {
            setEditor(null);
            setError('');
          }}
        >
          {editor && (
            <MeetingEditor
              key={typeof editor === 'object' ? (editor?.id ?? 'new') : 'new'}
              connections={connections}
              current={
                typeof editor === 'object' ? (editor ?? undefined) : undefined
              }
              selfId={self.id}
              error={error}
              onSubmit={(input) => {
                if (editor && editor !== 'new')
                  setConfirmation({
                    action: 'reschedule',
                    meeting: editor,
                    input,
                  });
                else if (
                  mutate(() => {
                    demoMeetingsRepository.create(user, input);
                  }, 'Convite enviado. Aguardando confirmação do participante.')
                ) {
                  setEditor(null);
                  setFilters({ ...filters, tab: 'pending' });
                }
              }}
            />
          )}
        </ContentDialog>
        <ContentDialog
          open={!!selected}
          title="Detalhes da reunião"
          onClose={() => setSelected(null)}
        >
          {selected && (
            <>
              <h3>{selected.title}</h3>
              <S.Status $status={effectiveStatus(selected, data.now)}>
                {statusLabels[effectiveStatus(selected, data.now)]}
              </S.Status>
              <p>
                {dayLabel(selected.date)} às {selected.time} ·{' '}
                {selected.duration} minutos · Horário de Brasília
              </p>
              <p>{formatLabels[selected.format]}</p>
              <h4>Participantes</h4>
              {selected.participants.map((person) => (
                <p key={person.id}>
                  {person.name} · {roleLabels[person.role]}
                </p>
              ))}
              {selected.description && <p>{selected.description}</p>}
              {selected.format === 'presential' && selected.address && (
                <p>
                  {selected.address}{' '}
                  <Button
                    $variant="quiet"
                    aria-label="Copiar endereço"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(selected.address)
                        .then(() => setNotice('Endereço copiado.'))
                        .catch(() =>
                          setError(
                            'Não foi possível copiar. Selecione o endereço e copie manualmente.',
                          ),
                        );
                    }}
                  >
                    <CopyIcon />
                  </Button>
                </p>
              )}
              {selected.format === 'online' && !selected.link && (
                <p>O link da reunião ainda não foi informado.</p>
              )}
              {canJoin(selected, data.now) && (
                <Button
                  as="a"
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Entrar na reunião
                </Button>
              )}
              {selected.cancellationReason && (
                <p>Motivo: {selected.cancellationReason}</p>
              )}
              <details>
                <summary>Histórico de alterações</summary>
                {selected.history.map((entry, index) => (
                  <p key={index}>
                    {new Date(entry.date).toLocaleString('pt-BR', {
                      timeZone: 'America/Fortaleza',
                    })}{' '}
                    · {entry.text}
                  </p>
                ))}
              </details>
              {error && <p role="alert">{error}</p>}
              <div className="actions">
                {selected.status === 'pending' &&
                  selected.awaitingId === self.id &&
                  startTime(selected) > data.now && (
                    <>
                      <Button
                        onClick={() =>
                          mutate(() => {
                            demoMeetingsRepository.respond(
                              user,
                              selected.id,
                              true,
                            );
                          }, 'Convite confirmado.')
                        }
                      >
                        Aceitar convite
                      </Button>
                      <Button
                        $variant="secondary"
                        onClick={() => request('decline', selected)}
                      >
                        Recusar convite
                      </Button>
                    </>
                  )}
                {['pending', 'confirmed'].includes(
                  effectiveStatus(selected, data.now),
                ) && (
                  <>
                    <Button
                      $variant="secondary"
                      onClick={() => openEditor(selected)}
                    >
                      Reagendar
                    </Button>
                    <Button
                      $variant="danger"
                      onClick={() => request('cancel', selected)}
                    >
                      Cancelar reunião
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </ContentDialog>
        <Modal
          open={!!confirmation}
          title={
            confirmation?.action === 'reschedule'
              ? 'Confirmar reagendamento?'
              : confirmation?.action === 'decline'
                ? 'Recusar convite?'
                : 'Cancelar reunião?'
          }
          cancelLabel="Voltar"
          confirmLabel={
            confirmation?.action === 'reschedule'
              ? 'Confirmar reagendamento'
              : confirmation?.action === 'decline'
                ? 'Confirmar recusa'
                : 'Confirmar cancelamento'
          }
          onClose={() => {
            setConfirmation(null);
            setError('');
          }}
          onConfirm={confirm}
        >
          {confirmation && (
            <>
              <p>{confirmation.meeting.title}</p>
              {confirmation.input ? (
                <>
                  <p>
                    Atual: {dayLabel(confirmation.meeting.date)} às{' '}
                    {confirmation.meeting.time}
                  </p>
                  <p>
                    Novo: {dayLabel(confirmation.input.date)} às{' '}
                    {confirmation.input.time}
                  </p>
                  <p>
                    A mudança ficará aguardando confirmação do outro
                    participante.
                  </p>
                </>
              ) : (
                <p>Este encontro será marcado como cancelado na agenda.</p>
              )}
              {confirmation.action === 'cancel' && (
                <Form as="div">
                  <label>
                    Motivo (opcional)
                    <textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      maxLength={1000}
                      rows={3}
                    />
                  </label>
                </Form>
              )}
              {error && <p role="alert">{error}</p>}
            </>
          )}
        </Modal>
      </Layout>
    </ThemeProvider>
  );
}
