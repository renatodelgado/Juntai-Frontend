import { useState } from 'react';
import styled from 'styled-components';
import {
  CalendarPlusIcon,
  ClockIcon,
  BuildingsIcon,
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import { Form } from '@/features/explore-startups/Explore.styles';
import { dayKey, type MeetingInput } from '../model';

const ScheduleForm = styled(Form)`
  gap: 1.25rem;
  .intro {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1.1rem;
    border-radius: 14px;
    background: ${({ theme }) => theme.colors.accentSoft};
  }
  .intro > svg {
    color: ${({ theme }) => theme.colors.accentStrong};
    flex-shrink: 0;
  }
  .intro strong {
    display: block;
    font-size: 1rem;
  }
  .intro p {
    margin: 0.35rem 0 0;
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .recipient {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 12px;
    padding: 1rem;
  }
  .recipient small {
    display: block;
    color: ${({ theme }) => theme.colors.appMuted};
    margin-bottom: 0.25rem;
  }
  .timezone {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.appMuted};
    margin: 0;
  }
  > button[type='submit'] {
    width: 100%;
    margin-top: 0.25rem;
  }
  @media (max-width: 36rem) {
    .pair {
      grid-template-columns: 1fr;
    }
  }
`;

export function MeetingEditor({
  startups,
  startup,
  busy,
  error,
  onSubmit,
}: {
  startups?: { id: string; name: string }[];
  startup?: { id: string; name: string };
  busy: boolean;
  error: string;
  onSubmit: (input: MeetingInput) => Promise<void>;
}) {
  const [localError, setError] = useState('');
  return (
    <ScheduleForm
      onSubmit={(event) => {
        event.preventDefault();
        if (busy) return;
        const values = Object.fromEntries(
          new FormData(event.currentTarget),
        ) as Record<string, string>;
        const date = new Date(`${values.date}T${values.time}:00-03:00`);
        if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
          setError('Escolha uma data e um horário futuros.');
          return;
        }
        setError('');
        void onSubmit({
          startupId: startup?.id ?? values.startupId!,
          dataHoraAgendada: date.toISOString(),
          linkReuniao: values.link || undefined,
          notas: values.notes || undefined,
        });
      }}
    >
      <div className="intro">
        <CalendarPlusIcon size={32} weight="duotone" />
        <div>
          <strong>Um encontro para avançar a conexão</strong>
          <p>Escolha o melhor horário e compartilhe os detalhes da conversa.</p>
        </div>
      </div>
      {startup ? (
        <div className="recipient">
          <BuildingsIcon size={26} weight="duotone" />
          <div>
            <small>Reunião com</small>
            <strong>{startup.name}</strong>
          </div>
        </div>
      ) : (
        <label>
          Startup
          <select name="startupId" required disabled={busy} defaultValue="">
            <option value="">Selecione uma startup</option>
            {startups?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {!startup && !startups?.length && (
        <p>Nenhuma startup disponível para agendamento no momento.</p>
      )}
      <div className="pair">
        <label>
          Data
          <input
            name="date"
            type="date"
            min={dayKey()}
            required
            disabled={busy}
          />
        </label>
        <label>
          Horário
          <input name="time" type="time" required disabled={busy} />
        </label>
      </div>
      <p className="timezone">
        <ClockIcon size={16} />
        Horários de Brasília (UTC−3)
      </p>
      <label>
        Link da reunião (opcional)
        <input
          name="link"
          type="url"
          pattern="https?://.*"
          maxLength={255}
          placeholder="https://"
          disabled={busy}
        />
      </label>
      <label>
        Observações (opcional)
        <textarea
          name="notes"
          rows={3}
          disabled={busy}
          placeholder="O que vocês gostariam de conversar?"
        />
      </label>
      {(localError || error) && <p role="alert">{localError || error}</p>}
      <Button type="submit" disabled={busy || (!startup && !startups?.length)}>
        <CalendarPlusIcon size={20} />
        {busy ? 'Salvando…' : 'Agendar reunião'}
      </Button>
    </ScheduleForm>
  );
}
