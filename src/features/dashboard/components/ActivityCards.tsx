import {
  CalendarIcon,
  ChatCircleIcon,
  ClockIcon,
  HandshakeIcon,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { getSession } from '@/features/auth/services/session';
import { Button } from '@/shared/components/ui/Button';
import {
  Card,
  Muted,
  Row,
  Grid,
} from '@/shared/components/profile/Profile.styles';
import { QuietSection } from '../pages/Dashboard.styles';

export function ConnectionSummary() {
  return (
    <QuietSection>
      <Row>
        <HandshakeIcon size={22} aria-hidden="true" />
        <h2>Minhas conexões</h2>
      </Row>
      <Muted>
        Interesses demonstrados, conexões estabelecidas e conversas poderão ser
        acompanhados aqui quando a área de conexões estiver disponível.
      </Muted>
    </QuietSection>
  );
}
export function MessagesCard({ approved }: { approved: boolean }) {
  return (
    <Card>
      <Row>
        <ChatCircleIcon size={24} aria-hidden="true" />
        <h2>Mensagens</h2>
      </Row>
      <p>Converse com suas conexões e avance suas oportunidades.</p>
      {approved ? (
        <Button
          as={Link}
          to={`/${getSession()?.usuario.tipoPerfil === 'investidor' ? 'investidor' : 'startup'}/mensagens`}
          $variant="secondary"
        >
          Abrir mensagens
        </Button>
      ) : (
        <Button
          disabled
          $variant="secondary"
          title="Disponível após aprovação do perfil"
        >
          Abrir mensagens
        </Button>
      )}
    </Card>
  );
}
export function MeetingCard({ approved }: { approved: boolean }) {
  return (
    <Card>
      <Row>
        <CalendarIcon size={24} aria-hidden="true" />
        <h2>Próximas reuniões</h2>
      </Row>
      <p>Acompanhe os próximos encontros.</p>
      {approved ? (
        <Button
          as={Link}
          to={`/${getSession()?.usuario.tipoPerfil === 'investidor' ? 'investidor' : 'startup'}/reunioes`}
          $variant="secondary"
        >
          Abrir reuniões
        </Button>
      ) : (
        <Button
          disabled
          $variant="secondary"
          title="Disponível após aprovação do perfil"
        >
          Abrir reuniões
        </Button>
      )}
    </Card>
  );
}
export function CommunicationCards({ approved }: { approved: boolean }) {
  return (
    <Grid>
      <MessagesCard approved={approved} />
      <MeetingCard approved={approved} />
    </Grid>
  );
}
export function ActivityList({ updatedAt }: { updatedAt: string }) {
  const date = new Date(updatedAt);
  return (
    <QuietSection>
      <h2>Atividade recente</h2>
      {Number.isNaN(date.getTime()) ? (
        <Muted>A data da última atualização não está disponível.</Muted>
      ) : (
        <Row>
          <ClockIcon size={22} aria-hidden="true" />
          <div>
            Última atualização do seu perfil
            <br />
            <Muted as="time" dateTime={updatedAt}>
              {date.toLocaleString('pt-BR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </Muted>
          </div>
        </Row>
      )}
    </QuietSection>
  );
}
