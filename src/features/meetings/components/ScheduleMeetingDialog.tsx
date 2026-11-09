import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@phosphor-icons/react';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import type { AuthUser } from '@/features/auth/services/session';
import {
  interestsApi,
  startupRepository,
} from '@/features/explore-startups/api';
import { meetingsRepository } from '../repository';
import { MeetingEditor } from './MeetingEditor';

type StartupOption = { id: string; name: string };
type Props = {
  user: AuthUser;
  startup?: StartupOption;
  recipientUserId?: string;
  onClose: () => void;
  onCreated?: () => void;
};

export function ScheduleMeetingDialog(props: Props) {
  return props.user.tipoPerfil === 'investidor' ? (
    <ScheduleForm {...props} />
  ) : null;
}

function ScheduleForm({
  user,
  startup,
  recipientUserId,
  onClose,
  onCreated,
}: Props) {
  const [options, setOptions] = useState<StartupOption[]>([]);
  const [recipient, setRecipient] = useState<StartupOption>();
  const [loading, setLoading] = useState(!startup);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (startup) return;
    const controller = new AbortController();
    async function load() {
      try {
        if (recipientUserId) {
          const interests = await interestsApi.list(controller.signal);
          const match = interests.find(
            (item) => item.usuarioId === recipientUserId,
          );
          if (!match)
            throw new Error(
              'Esta startup não está disponível para agendamento.',
            );
          if (!controller.signal.aborted)
            setRecipient({ id: match.startupId, name: match.startupName });
        } else {
          const items = await startupRepository.list(user, controller.signal);
          if (!controller.signal.aborted) setOptions(items);
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setLoadError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar as startups.',
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [startup, recipientUserId, user, attempt]);
  return (
    <ContentDialog
      open
      title={created ? 'Reunião agendada' : 'Agendar reunião'}
      busy={busy}
      onClose={onClose}
    >
      {created ? (
        <div role="status" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <CheckCircleIcon size={48} weight="duotone" />
          <h3>Seu próximo encontro está na agenda</h3>
          <p>
            Os detalhes foram salvos e já estão disponíveis para os
            participantes.
          </p>
          <Button as={Link} to="/investidor/reunioes" onClick={onClose}>
            Ver na agenda
          </Button>
        </div>
      ) : loading ? (
        <p role="status">Carregando startups…</p>
      ) : loadError ? (
        <div role="alert">
          <p>{loadError}</p>
          <Button
            onClick={() => {
              setLoadError('');
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <MeetingEditor
          startups={options}
          startup={startup ?? recipient}
          busy={busy}
          error={error}
          onSubmit={async (input) => {
            setBusy(true);
            setError('');
            try {
              await meetingsRepository.create(input);
              setCreated(true);
              onCreated?.();
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : 'Não foi possível agendar a reunião.',
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
    </ContentDialog>
  );
}
