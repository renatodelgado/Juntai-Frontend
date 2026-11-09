import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import type { Startup } from '../model';
import type { Discovery } from '../useDiscovery';
import { ScheduleMeetingDialog } from '@/features/meetings/components/ScheduleMeetingDialog';

export function InterestConfirmationModal(props: {
  startup: Startup | null;
  data: Discovery;
  onClose: () => void;
}) {
  return props.startup ? (
    <InterestDialog
      key={props.startup.id}
      startup={props.startup}
      data={props.data}
      onClose={props.onClose}
    />
  ) : null;
}
function InterestDialog({
  startup,
  data,
  onClose,
}: {
  startup: Startup;
  data: Discovery;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(
    data.state.interests.some((item) => item.startupId === startup.id),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function confirm() {
    if (confirmed) {
      void navigate(
        '/investidor/mensagens?startup=' + encodeURIComponent(startup.id),
      );
      onClose();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await data.interest(startup.id);
      setConfirmed(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível confirmar o interesse.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      title={confirmed ? 'Interesse confirmado' : 'Confirmar interesse'}
      onClose={onClose}
      busy={busy}
      confirmLabel={confirmed ? 'Iniciar conversa' : 'Confirmar interesse'}
      cancelLabel={confirmed ? 'Fechar' : 'Cancelar'}
      onConfirm={() => void confirm()}
    >
      <p>
        <strong>{startup.name}</strong>
      </p>
      <p>
        {confirmed
          ? 'Seu interesse foi registrado. Envie a primeira mensagem para começar a conversa.'
          : 'Confirme seu interesse em explorar esta oportunidade. Depois, você poderá iniciar uma conversa com a startup.'}
      </p>
      {error && <p role="alert">{error}</p>}
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
  return startup ? (
    <ScheduleMeetingDialog
      key={startup.id}
      user={data.user}
      startup={startup}
      onClose={onClose}
    />
  ) : null;
}
