import { useEffect, useId, useState } from 'react';
import styled from 'styled-components';
import { StarIcon } from '@phosphor-icons/react';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import {
  feedbackApi,
  resultadoOptions,
  investimentoOptions,
  type FeedbackContext,
  type FeedbackState,
  type FeedbackInput,
} from './api';
const Fields = styled.div`
  display: grid;
  gap: 1rem;
  p {
    margin: 0;
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }
  .ratings {
    display: flex;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }
  label {
    display: grid;
    gap: 0.5rem;
  }
  .ratings label {
    position: relative;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 0.5rem;
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  .ratings input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
  .ratings label:has(input:focus-visible) {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  select,
  textarea {
    width: 100%;
    padding: 0.65rem;
    font: inherit;
    color: inherit;
    background: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0.5rem;
  }
  textarea {
    min-height: 5rem;
  }
  summary {
    cursor: pointer;
  }
  details label {
    margin-top: 0.75rem;
  }
  small {
    line-height: 1.5;
  }
  .investment-status {
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: ${({ theme }) => theme.colors.accentSoft};
    font-size: 0.85rem;
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
  const [resultado, setResultado] =
    useState<FeedbackInput['resultadoInteracao']>('em_analise');
  const [perspectiva, setPerspectiva] =
    useState<FeedbackInput['perspectivaInvestimento']>('nao_definido');
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
        setResultado(value.avaliacao?.resultadoInteracao ?? 'em_analise');
        setPerspectiva(
          value.avaliacao?.perspectivaInvestimento ?? 'nao_definido',
        );
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
      await feedbackApi.save(context, {
        nota,
        comentario,
        resultadoInteracao: resultado,
        perspectivaInvestimento: perspectiva,
      });
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
      compact
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
              <strong>{data.nome}</strong> ·{' '}
              {tipo === 'conversa' ? 'Conversa até agora' : 'Reunião'}
            </p>
            {data.elegivel ? (
              <>
                <fieldset disabled={busy}>
                  <legend>Como foi a interação?</legend>
                  <div className="ratings">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} title={`${value} de 5`}>
                        <input
                          type="radio"
                          name={name}
                          aria-label={`${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
                          value={value}
                          checked={nota === value}
                          onChange={() => setNota(value)}
                        />
                        <StarIcon
                          size={28}
                          weight={nota >= value ? 'fill' : 'regular'}
                          aria-hidden="true"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label>
                  Qual foi o resultado até agora?
                  <select
                    disabled={busy}
                    value={resultado}
                    onChange={(e) =>
                      setResultado(
                        e.target.value as FeedbackInput['resultadoInteracao'],
                      )
                    }
                  >
                    {Object.entries(resultadoOptions).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Há perspectiva de investimento?
                  <select
                    disabled={busy}
                    value={perspectiva}
                    onChange={(e) =>
                      setPerspectiva(
                        e.target
                          .value as FeedbackInput['perspectivaInvestimento'],
                      )
                    }
                  >
                    {Object.entries(investimentoOptions).map(
                      ([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                {perspectiva === 'realizado' ? (
                  <p className="investment-status" role="status">
                    {data.investimentoConfirmado &&
                    data.avaliacao?.perspectivaInvestimento === perspectiva
                      ? 'Investimento confirmado pelos dois participantes nesta interação.'
                      : data.investimentoInformadoPeloOutro
                        ? 'O outro participante já informou o investimento. Salve para confirmar também.'
                        : 'Será registrado como informado por você. A confirmação depende do outro participante.'}
                  </p>
                ) : (
                  data.investimentoInformadoPeloOutro && (
                    <p className="investment-status">
                      O outro participante informou um investimento realizado.
                      Se aconteceu, selecione essa opção para confirmar.
                    </p>
                  )
                )}
                <details>
                  <summary>
                    Adicionar comentário{comentario ? ' (preenchido)' : ''}
                  </summary>
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
                </details>
                <small>
                  Nota e comentário são privados. A informação de investimento
                  realizado é compartilhada para confirmação.
                </small>
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
