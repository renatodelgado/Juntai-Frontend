import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { BellIcon, UserCircleIcon } from '@phosphor-icons/react';
import { theme, investorTheme } from '@/shared/styles/theme';
import {
  getSession,
  logout,
  sessionEvent,
} from '@/features/auth/services/session';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { Main, Card, Row } from '@/shared/components/profile/Profile.styles';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import {
  ProfileStatusCard,
  ProfileCompletionCard,
  ProfileSummaryCard,
  SeekingCard,
  ProfileTips,
} from '../components/ProfileCards';
import { RecommendationSection } from '../components/RecommendationSection';
import {
  ActivityList,
  CommunicationCards,
  ConnectionSummary,
} from '../components/ActivityCards';
import {
  loadDashboard,
  dashboardName,
  label,
  moderation,
  type Dashboard,
} from '../model/dashboard';
import { DashboardLayout, Columns, Overview } from './Dashboard.styles';

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState<'settings' | 'notifications' | null>(
    null,
  );
  const navigate = useNavigate();
  const session = getSession();
  const role =
    session?.usuario.tipoPerfil === 'investidor' ? 'investidor' : 'startup';
  useEffect(() => {
    let active = true;
    let sequence = 0;
    const refresh = () => {
      const request = ++sequence;
      void loadDashboard()
        .then((value) => {
          if (active && request === sequence) {
            setData(value);
            setError(false);
          }
        })
        .catch(() => {
          if (active && request === sequence) setError(true);
        });
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    window.addEventListener(sessionEvent, refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener(sessionEvent, refresh);
    };
  }, [attempt, role]);
  const profile = `/${role}/perfil`;
  const name = data
    ? dashboardName(data)
    : role === 'startup'
      ? 'Sua startup'
      : session?.usuario.nome || 'Seu perfil';
  return (
    <ThemeProvider theme={role === 'investidor' ? investorTheme : theme}>
      <DashboardLayout>
        <ProfileSidebar
          profilePath={profile}
          approved={
            data ? moderation(data.profile.statusModeracao).approved : false
          }
          status={
            data
              ? moderation(data.profile.statusModeracao).badge
              : 'Carregando perfil'
          }
          name={name}
          subtitle={
            data?.role === 'investidor'
              ? label(data.profile.tipoInvestidor)
              : 'Startup'
          }
          onSettings={() => setDialog('settings')}
          onLogout={() => {
            logout();
            void navigate('/login', { replace: true });
          }}
        />
        <Main>
          <PageHeader
            title={role === 'startup' && !data ? 'Olá!' : `Olá, ${name}!`}
            breadcrumbs={[{ label: 'Início' }]}
            subtitle={
              role === 'startup'
                ? 'Veja o que está acontecendo com seu perfil e suas conexões.'
                : 'Encontre startups alinhadas aos seus interesses e experiência.'
            }
            actions={
              <Row>
                <Button
                  $variant="secondary"
                  aria-label="Notificações"
                  onClick={() => setDialog('notifications')}
                >
                  <BellIcon size={22} aria-hidden="true" />
                </Button>
                <Button
                  as={Link}
                  to={profile}
                  $variant="secondary"
                  aria-label="Acessar meu perfil"
                >
                  <UserCircleIcon size={24} aria-hidden="true" />
                </Button>
              </Row>
            }
          />
          {error ? (
            <Card role="alert">
              <h2>Não conseguimos atualizar seu painel</h2>
              <p>Confira sua conexão e tente novamente.</p>
              <Button
                onClick={() => {
                  setError(false);
                  setAttempt((value) => value + 1);
                }}
              >
                Tentar novamente
              </Button>
            </Card>
          ) : !data ? (
            <Card role="status">Preparando seu início…</Card>
          ) : (
            <>
              <Columns>
                <div>
                  <Overview>
                    <ProfileStatusCard data={data} />
                    <ProfileCompletionCard data={data} />
                  </Overview>
                  <RecommendationSection data={data} />
                  <CommunicationCards
                    approved={moderation(data.profile.statusModeracao).approved}
                  />
                  <ActivityList updatedAt={data.profile.atualizadoEm} />
                </div>
                <div>
                  <ProfileSummaryCard data={data} />
                  {data.role === 'startup' ? (
                    <SeekingCard data={data} />
                  ) : (
                    <ConnectionSummary />
                  )}
                  <ProfileTips data={data} />
                </div>
              </Columns>
            </>
          )}
        </Main>
        <ContentDialog
          open={dialog !== null}
          title={dialog === 'settings' ? 'Sua conta' : 'Notificações'}
          onClose={() => setDialog(null)}
        >
          {dialog === 'settings' ? (
            <>
              <p>{session?.usuario.email}</p>
              <p>
                Sua sessão permanece ativa até você sair da conta ou o token
                expirar.
              </p>
              <Button as={Link} to={profile}>
                Ver meu perfil
              </Button>
            </>
          ) : (
            <p>
              A central de notificações ainda não está disponível. Acompanhe o
              status do seu perfil nesta página.
            </p>
          )}
        </ContentDialog>
      </DashboardLayout>
    </ThemeProvider>
  );
}
