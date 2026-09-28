import {
  CalendarIcon,
  ChatCircleIcon,
  ClockIcon,
  HandshakeIcon,
} from '@phosphor-icons/react';
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
export function MessagesCard() {
  return (
    <Card>
      <Row>
        <ChatCircleIcon size={24} aria-hidden="true" />
        <h2>Mensagens</h2>
      </Row>
      <p>Suas conversas terão um lugar aqui.</p>
      <Muted>A área de mensagens ainda não está disponível.</Muted>
    </Card>
  );
}
export function MeetingCard() {
  return (
    <Card>
      <Row>
        <CalendarIcon size={24} aria-hidden="true" />
        <h2>Próximas reuniões</h2>
      </Row>
      <p>Acompanhe os próximos encontros.</p>
      <Muted>O agendamento de reuniões ainda não está disponível.</Muted>
    </Card>
  );
}
export function CommunicationCards() {
  return (
    <Grid>
      <MessagesCard />
      <MeetingCard />
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
