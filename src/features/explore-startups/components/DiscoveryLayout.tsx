import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { SignOutIcon } from '@phosphor-icons/react';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { logout } from '@/features/auth/services/session';
import { investorTheme } from '@/shared/styles/theme';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import type { Discovery } from '../useDiscovery';
import * as S from '../Explore.styles';

export function DiscoveryLayout({
  data,
  children,
}: {
  data: Discovery;
  children: ReactNode;
}) {
  const [dialog, setDialog] = useState<
    'account' | 'history' | 'meetings' | null
  >(null);
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={investorTheme}>
      <S.Shell>
        <ProfileSidebar
          approved={data.approved}
          profilePath="/investidor/perfil"
          name={data.user.nome}
          subtitle="Investidor"
          status="Conta autenticada"
          onSettings={() => setDialog('account')}
          onMatches={() => setDialog('history')}
          onLogout={() => {
            logout();
            void navigate('/login', { replace: true });
          }}
        />
        <S.Main>
          {data.notice && (
            <div className="notice" role="status">
              {data.notice}
            </div>
          )}
          {children}
        </S.Main>
        <ContentDialog
          open={!!dialog}
          title={
            dialog === 'history'
              ? 'Conexões e interesses'
              : dialog === 'meetings'
                ? 'Reuniões'
                : 'Minha conta'
          }
          onClose={() => setDialog(null)}
        >
          {dialog === 'account' && (
            <>
              <p>{data.user.nome}</p>
              <Button as={Link} to="/investidor/perfil">
                Editar perfil e preferências
              </Button>
              <p>
                <Button
                  $variant="secondary"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  <SignOutIcon /> Sair da conta
                </Button>
              </p>
            </>
          )}
          {dialog === 'history' && (
            <>
              <p>
                Interesses registrados na sua conta. Demonstrar interesse não
                confirma um investimento.
              </p>
              {data.state.interests.length === 0 && (
                <p>Nenhum interesse enviado ainda.</p>
              )}
              {data.state.interests.map((item) => (
                <p key={item.startupId}>
                  <Link to={`/startups/${item.startupId}`}>
                    {data.startups.find((s) => s.id === item.startupId)?.name}
                  </Link>{' '}
                  · Interesse enviado ·{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </p>
              ))}
            </>
          )}
          {dialog === 'meetings' && (
            <>
              <p>Convites demonstrativos, salvos neste navegador.</p>
              {!data.state.meetings.length && (
                <p>
                  Nenhum convite enviado. Acesse uma startup conectada para
                  agendar.
                </p>
              )}
              {data.state.meetings.map((meeting) => (
                <article key={meeting.id}>
                  <h3>{meeting.startupName}</h3>
                  <p>
                    {new Date(`${meeting.date}T12:00:00`).toLocaleDateString(
                      'pt-BR',
                    )}{' '}
                    às {meeting.time} · {meeting.duration} minutos ·{' '}
                    {meeting.format}
                  </p>
                  <p>Aguardando confirmação</p>
                  {meeting.notes && <p>{meeting.notes}</p>}
                </article>
              ))}
            </>
          )}
        </ContentDialog>
      </S.Shell>
    </ThemeProvider>
  );
}
