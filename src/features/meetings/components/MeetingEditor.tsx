import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Form } from '@/features/explore-startups/Explore.styles';
import {
  dayKey,
  formatLabels,
  startTime,
  type MeetingFormat,
  type MeetingInput,
  type Participant,
  type ScheduledMeeting,
} from '../model';

export function MeetingEditor({
  connections,
  current,
  selfId,
  onSubmit,
  error,
}: {
  connections: Participant[];
  current?: ScheduledMeeting;
  selfId: string;
  onSubmit: (input: MeetingInput) => void;
  error: string;
}) {
  const [format, setFormat] = useState<MeetingFormat>(
    current?.format ?? 'online',
  );
  const [localError, setError] = useState('');
  const other = current?.participants.find((person) => person.id !== selfId);
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        const values = Object.fromEntries(
          new FormData(event.currentTarget),
        ) as Record<string, string>;
        const input: MeetingInput = {
          participantId: other?.id ?? values.participantId!,
          date: values.date!,
          time: values.time!,
          duration: Number(values.duration),
          format,
          title: values.title!.trim(),
          description: values.description ?? '',
          link: format === 'online' ? (values.link ?? '') : '',
          address: format === 'presential' ? (values.address ?? '') : '',
        };
        if (startTime(input) <= Date.now()) {
          setError('Escolha uma data e um horário futuros.');
          return;
        }
        setError('');
        onSubmit(input);
      }}
    >
      <p>
        Horários de Brasília (UTC−3). O convite precisa da resposta do outro
        participante.
      </p>
      {current && (
        <p>
          Horário atual: {current.date.split('-').reverse().join('/')} às{' '}
          {current.time} · {current.duration} minutos.
        </p>
      )}
      <label>
        Participante
        <select
          aria-label="Participante"
          name="participantId"
          defaultValue={other?.id ?? ''}
          disabled={!!current}
          required
        >
          <option value="">Selecione uma conexão</option>
          {connections.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Assunto
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={current?.title}
          placeholder="O que vocês vão conversar?"
        />
      </label>
      <div className="pair">
        <label>
          Data
          <input
            name="date"
            type="date"
            min={dayKey()}
            required
            defaultValue={current?.date}
          />
        </label>
        <label>
          Horário
          <input
            name="time"
            type="time"
            required
            defaultValue={current?.time}
          />
        </label>
      </div>
      <div className="pair">
        <label>
          Duração
          <select
            aria-label="Duração"
            name="duration"
            defaultValue={current?.duration ?? 30}
          >
            {[15, 30, 45, 60].map((duration) => (
              <option value={duration} key={duration}>
                {duration} minutos
              </option>
            ))}
          </select>
        </label>
        <label>
          Formato
          <select
            aria-label="Formato"
            value={format}
            onChange={(event) => setFormat(event.target.value as MeetingFormat)}
          >
            {Object.entries(formatLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {format === 'online' && (
        <label>
          Link da reunião (opcional)
          <input
            name="link"
            type="url"
            pattern="https?://.*"
            defaultValue={current?.link}
            placeholder="https://"
          />
        </label>
      )}
      {format === 'presential' && (
        <label>
          Endereço (opcional)
          <input
            name="address"
            maxLength={300}
            defaultValue={current?.address}
            placeholder="Informe o local do encontro"
          />
        </label>
      )}
      <label>
        Descrição (opcional)
        <textarea
          name="description"
          maxLength={2000}
          rows={3}
          defaultValue={current?.description}
        />
      </label>
      {(localError || error) && (
        <p className="error" role="alert">
          {localError || error}
        </p>
      )}
      {!connections.length && (
        <p>Você ainda não tem uma conexão habilitada para agendamento.</p>
      )}
      <Button type="submit" disabled={!connections.length}>
        {current ? 'Revisar reagendamento' : 'Enviar convite'}
      </Button>
    </Form>
  );
}
