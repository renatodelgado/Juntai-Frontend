import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import type { Startup } from '../model';
import type { Discovery } from '../useDiscovery';
import * as S from '../Explore.styles';

export function InterestConfirmationModal({
  startup,
  data,
  onClose,
}: {
  startup: Startup | null;
  data: Discovery;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!startup}
      title="Quer iniciar uma conexão?"
      onClose={onClose}
      confirmLabel="Confirmar interesse"
      onConfirm={() => {
        if (startup && data.interest(startup.id)) onClose();
      }}
    >
      <p>
        Você está demonstrando interesse nesta startup. Ela poderá visualizar
        seu perfil e, conforme as regras da plataforma, vocês poderão iniciar
        uma conversa.
      </p>
      <p>
        <strong>{startup?.name}</strong>
      </p>
      <small>
        Demonstração: registro local, sem envio externo ou confirmação de
        investimento.
      </small>
    </Modal>
  );
}
export function MeetingRequestModal({
  startup,
  data,
  onClose,
}: {
  startup: Startup | null;
  data: Discovery;
  onClose: () => void;
}) {
  const [error, setError] = useState('');
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return (
    <ContentDialog
      open={!!startup}
      title="Agendar reunião"
      onClose={() => {
        setError('');
        onClose();
      }}
    >
      <S.Form
        onSubmit={(event) => {
          event.preventDefault();
          const values = Object.fromEntries(
            new FormData(event.currentTarget),
          ) as Record<string, string>;
          if (
            new Date(`${values.date}T${values.time}:00-03:00`).getTime() <=
            Date.now()
          ) {
            setError('Escolha uma data e um horário no futuro.');
            return;
          }
          try {
            if (
              startup &&
              data.meeting({
                startupId: startup.id,
                startupName: startup.name,
                date: values.date!,
                time: values.time!,
                duration: values.duration!,
                format: values.format!,
                link: values.link!,
                notes: values.notes!,
              })
            ) {
              setError('');
              onClose();
            }
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Não foi possível enviar o convite. Tente novamente.',
            );
          }
        }}
      >
        <p>
          Convide {startup?.name} para uma conversa. Horários de Brasília
          (UTC−3). O convite ficará aguardando confirmação.
        </p>
        <div className="pair">
          <label>
            Data
            <input name="date" type="date" min={today} required />
          </label>
          <label>
            Horário
            <input name="time" type="time" required />
          </label>
        </div>
        <div className="pair">
          <label>
            Duração
            <select name="duration">
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </label>
          <label>
            Tipo de reunião
            <select name="format">
              <option>Videochamada</option>
              <option>Presencial</option>
              <option>Telefone</option>
            </select>
          </label>
        </div>
        <label>
          Link da reunião (opcional)
          <input
            name="link"
            type="url"
            pattern="https?://.*"
            placeholder="https://"
          />
        </label>
        <label>
          Observações opcionais
          <textarea name="notes" rows={3} maxLength={1000} />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <small>Mock: o convite será salvo somente neste navegador.</small>
        <Button type="submit">Enviar convite</Button>
      </S.Form>
    </ContentDialog>
  );
}
