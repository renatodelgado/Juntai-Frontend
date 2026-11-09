import { useState } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { CalendarPlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { ThemeProvider } from 'styled-components';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { Layout, Card } from '@/shared/components/profile/Profile.styles';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { AuthUser } from '@/features/auth/services/session';
import { theme, investorTheme } from '@/shared/styles/theme';
import { meetingsRepository } from './repository';
import {
  dayLabel,
  statusLabels,
  validLink,
  type MeetingStatus,
  type ScheduledMeeting,
} from './model';
import { useMeetings } from './useMeetings';
import { MeetingCalendar } from './components/MeetingCalendar';
import { MeetingList } from './components/MeetingList';
import { ScheduleMeetingDialog } from './components/ScheduleMeetingDialog';
import * as S from './Meetings.styles';

export function MeetingsPage() {
  const startup = useRouteLoaderData<AuthUser>('startup-meetings');
  const investor = useRouteLoaderData<AuthUser>('investidor-meetings');
  const user = (startup ?? investor)!;
  return <MeetingsScreen key={user.id} user={user} />;
}
function MeetingsScreen({ user }: { user: AuthUser }) {
  const data = useMeetings(user);
  const [scheduling, setScheduling] = useState(false);
  const [status, setStatus] = useState<MeetingStatus>('agendada');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selection, setSelected] = useState<ScheduledMeeting | null>(null);
  const selected =
    data.meetings.find((item) => item.id === selection?.id) ?? null;
  const [change, setChange] = useState<
    'realizada' | 'cancelada' | 'no_show' | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const visible = data.meetings
    .filter(
      (item) =>
        item.status === status &&
        item.title
          .toLocaleLowerCase('pt-BR')
          .includes(query.trim().toLocaleLowerCase('pt-BR')),
    )
    .sort(
      (a, b) => Date.parse(a.dataHoraAgendada) - Date.parse(b.dataHoraAgendada),
    );
  async function confirm() {
    if (!selected || !change || busy) return;
    setBusy(true);
    setError('');
    try {
      const updated = await meetingsRepository.updateStatus(
        selected.id,
        change,
      );
      setSelected(updated);
      setChange(null);
      setNotice('Status da reunião atualizado.');
      data.retry();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível atualizar a reunião.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <ThemeProvider
      theme={user.tipoPerfil === 'startup' ? theme : investorTheme}
    >
      <Layout>
        <ProfileSidebar />
        <S.Main>
          <PageHeader
            title="Reuniões agendadas"
            subtitle="Consulte seus encontros e atualize o status das reuniões."
            breadcrumbs={[{ label: 'Reuniões' }]}
            actions={
              user.tipoPerfil === 'investidor' ? (
                <Button onClick={() => setScheduling(true)}>
                  <CalendarPlusIcon size={20} />
                  Agendar reunião
                </Button>
              ) : undefined
            }
          />
          {notice && <p role="status">{notice}</p>}
          <S.Summary aria-label="Resumo da agenda">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <strong>
                  {data.loading
                    ? '—'
                    : data.meetings.filter((item) => item.status === key)
                        .length}
                </strong>
              </div>
            ))}
          </S.Summary>
          <S.Toolbar aria-label="Filtros da agenda">
            <div className="tabs">
              {Object.entries(statusLabels).map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={status === key}
                  onClick={() => setStatus(key as MeetingStatus)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="filters">
              <label className="search">
                <MagnifyingGlassIcon size={20} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Buscar participante"
                  placeholder="Buscar startup ou investidor"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <Button
                $variant="secondary"
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                Lista
              </Button>
              <Button
                $variant="secondary"
                aria-pressed={view === 'calendar'}
                onClick={() => setView('calendar')}
              >
                Calendário
              </Button>
              <Button
                $variant="quiet"
                onClick={data.retry}
                disabled={data.loading}
              >
                Atualizar
              </Button>
            </div>
          </S.Toolbar>
          {data.loading ? (
            <Card role="status">Carregando agenda…</Card>
          ) : data.failed ? (
            <Card role="alert">
              Não foi possível carregar sua agenda.{' '}
              <Button onClick={data.retry}>Tentar novamente</Button>
            </Card>
          ) : !visible.length ? (
            <div className="empty">
              <h2>Nenhuma reunião encontrada</h2>
              <p>
                {user.tipoPerfil === 'startup'
                  ? 'As reuniões agendadas pelos investidores aparecerão aqui.'
                  : 'Escolha uma startup e reserve um horário para a próxima conversa.'}
              </p>
              {user.tipoPerfil === 'investidor' &&
                !query &&
                status === 'agendada' && (
                  <Button onClick={() => setScheduling(true)}>
                    <CalendarPlusIcon size={20} />
                    Agendar reunião
                  </Button>
                )}
            </div>
          ) : view === 'calendar' ? (
            <MeetingCalendar
              meetings={visible}
              onSelect={(item) => {
                setSelected(item);
                setError('');
              }}
            />
          ) : (
            <MeetingList
              meetings={visible}
              onSelect={(item) => {
                setSelected(item);
                setError('');
              }}
            />
          )}
        </S.Main>
        {scheduling && (
          <ScheduleMeetingDialog
            user={user}
            onClose={() => setScheduling(false)}
            onCreated={() => {
              setStatus('agendada');
              setQuery('');
              setNotice('Reunião agendada com sucesso.');
              data.retry();
            }}
          />
        )}
        <ContentDialog
          open={!!selected && !change}
          title="Detalhes da reunião"
          onClose={() => setSelected(null)}
        >
          {selected && (
            <>
              <h3>{selected.startupNome}</h3>
              <p>Investidor: {selected.investidorNome}</p>
              <S.Status $status={selected.status}>
                {statusLabels[selected.status]}
              </S.Status>
              <p>
                {dayLabel(selected.date)} às {selected.time} · Horário de
                Brasília
              </p>
              {selected.notas && (
                <p style={{ whiteSpace: 'pre-wrap' }}>{selected.notas}</p>
              )}
              {selected.linkReuniao && validLink(selected.linkReuniao) ? (
                <Button
                  as="a"
                  href={selected.linkReuniao}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir link da reunião
                </Button>
              ) : (
                <p>Link da reunião não informado ou indisponível.</p>
              )}
              {selected.status === 'agendada' && (
                <div className="actions">
                  {(['realizada', 'no_show', 'cancelada'] as const).map(
                    (value) => (
                      <Button
                        key={value}
                        $variant="secondary"
                        onClick={() => {
                          setError('');
                          setChange(value);
                        }}
                      >
                        {value === 'realizada'
                          ? 'Marcar como realizada'
                          : value === 'no_show'
                            ? 'Registrar não comparecimento'
                            : 'Cancelar reunião'}
                      </Button>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </ContentDialog>
        <Modal
          open={!!change}
          title="Atualizar status da reunião?"
          busy={busy}
          confirmLabel="Confirmar"
          onClose={() => {
            if (!busy) {
              setChange(null);
              setError('');
            }
          }}
          onConfirm={() => void confirm()}
        >
          <p>
            {change && statusLabels[change]}. Após a alteração, a reunião ficará
            disponível somente para consulta.
          </p>
          {error && <p role="alert">{error}</p>}
        </Modal>
      </Layout>
    </ThemeProvider>
  );
}
