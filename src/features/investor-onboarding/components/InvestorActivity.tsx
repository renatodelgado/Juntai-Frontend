import { ClockIcon } from '@phosphor-icons/react';
import { Card, Muted } from '@/shared/components/profile/Profile.styles';
import type { InvestorConnectionEvent } from '../model/investor';

const labels: Record<InvestorConnectionEvent['type'], string> = {
  startup_viewed: 'Você visualizou uma startup',
  interest_expressed: 'Você demonstrou interesse em uma startup',
  connection_accepted: 'Uma conexão foi aceita',
  meeting_scheduled: 'Reunião agendada',
  meeting_held: 'Reunião realizada',
  proposal_sent: 'Proposta enviada',
  investment_completed: 'Investimento realizado',
};
export function InvestorActivity({
  events,
}: {
  events: InvestorConnectionEvent[];
}) {
  return (
    <Card>
      <h2>Sua atividade</h2>
      {events.length ? (
        events.map((event, index) => (
          <div key={`${event.type}-${event.occurredAt}-${index}`}>
            <h3>{labels[event.type]}</h3>
            <Muted>{new Date(event.occurredAt).toLocaleString('pt-BR')}</Muted>
          </div>
        ))
      ) : (
        <>
          <ClockIcon size={28} aria-hidden="true" />
          <h3>Você ainda não possui atividades</h3>
          <p>
            Quando começar a explorar startups, suas interações aparecerão aqui.
          </p>
        </>
      )}
    </Card>
  );
}
