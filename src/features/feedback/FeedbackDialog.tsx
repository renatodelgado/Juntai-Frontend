import { useEffect, useId, useState } from 'react';
import styled from 'styled-components';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import { feedbackApi, type FeedbackContext, type FeedbackState } from './api';
const Fields = styled.div`
  display: grid;
  gap: 1rem;
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }
  .ratings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  label {
    display: grid;
    gap: 0.5rem;
  }
  .ratings label {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid currentColor;
    border-radius: 0.5rem;
  }
  textarea {
    width: 100%;
    min-height: 7rem;
    padding: 0.75rem;
    font: inherit;
    border-radius: 0.5rem;
  }
`;
export function FeedbackDialog({
  context,
  onClose,
  reminder = false,
}: {
  context: FeedbackContext;
  onClose: () => void;
  reminder?: boolean;
}) {
  const [data, setData] = useState<FeedbackState | null>(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const name = useId();
  const { tipo, id } = context;
  useEffect(() => {
    const controller = new AbortController();
    feedbackApi
      .get({ tipo, id }, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setData(value);
        setNota(value.avaliacao?.nota ?? 0);
        setComentario(value.avaliacao?.comentario ?? '');
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar a avaliação.',
          );
      });
    return () => controller.abort();
  }, [tipo, id, attempt]);
  async function close() {
    if (busy) return;
    if (!reminder || !data?.elegivel || data.avaliacao) {
      onClose();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await feedbackApi.defer(context);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível adiar. Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!nota || busy) return;
    setBusy(true);
    setError('');
    try {
      await feedbackApi.save(context, nota, comentario);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível enviar. Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <ContentDialog
      open
      title={data?.avaliacao ? 'Minha avaliação' : 'Avaliar interação'}
      onClose={() => void close()}
      busy={busy}
      closeLabel={reminder ? 'Agora não' : 'Fechar'}
      actions={
        data?.elegivel && (
          <Button disabled={!nota || busy} onClick={() => void save()}>
            {busy ? 'Enviando…' : 'Salvar avaliação'}
          </Button>
        )
      }
    >
      <Fields>
        {!data && !error && <p role="status">Carregando avaliação…</p>}
        {data && (
          <>
            <p>
              Como{' '}
              {context.tipo === 'conversa'
                ? 'está sendo sua interação'
                : 'foi sua reunião'}{' '}
              com <strong>{data.nome}</strong>
              {context.tipo === 'conversa' ? ' até agora' : ''}?
            </p>
            <p>
              Sua avaliação é privada. Nota de 1 (muito ruim) a 5 (muito boa).
            </p>
            {data.elegivel ? (
              <>
                <fieldset disabled={busy}>
                  <legend>Nota da interação</legend>
                  <div className="ratings">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name={name}
                          value={value}
                          checked={nota === value}
                          onChange={() => setNota(value)}
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label>
                  Comentário (opcional)
                  <textarea
                    maxLength={2000}
                    value={comentario}
                    disabled={busy}
                    onChange={(e) => setComentario(e.target.value)}
                  />
                </label>
                <small>{comentario.length}/2000 caracteres</small>
              </>
            ) : (
              <p>
                A avaliação estará disponível após a troca de mensagens entre
                vocês ou a conclusão da reunião.
              </p>
            )}
          </>
        )}
        {error && <p role="alert">{error}</p>}
        {!data && error && (
          <Button
            onClick={() => {
              setError('');
              setAttempt((v) => v + 1);
            }}
          >
            Tentar novamente
          </Button>
        )}
      </Fields>
    </ContentDialog>
  );
}
