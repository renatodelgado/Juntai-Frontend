import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Form } from '@/features/explore-startups/Explore.styles';
import { dayKey, type MeetingInput } from '../model';

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
    <Form
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
      <p>Horários de Brasília (UTC−3).</p>
      {startup ? (
        <p>{startup.name}</p>
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
        <textarea name="notes" rows={3} disabled={busy} />
      </label>
      {(localError || error) && <p role="alert">{localError || error}</p>}
      <Button type="submit" disabled={busy || (!startup && !startups?.length)}>
        {busy ? 'Salvando…' : 'Agendar reunião'}
      </Button>
    </Form>
  );
}
