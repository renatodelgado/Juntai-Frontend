import { useState, type FormEvent } from 'react';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import {
  MultiSelect,
  Textarea,
  NumberInput,
  MoneyInput,
} from '@/shared/components/forms/Fields';
import type { SavedDraft } from '@/features/startup-onboarding/services/draftStorage';
import type { StartupDraft } from '@/features/startup-onboarding/model/types';
import * as catalogs from '@/features/startup-onboarding/data/catalogs';
import { saveProfile } from '@/features/auth/services/profiles';

import { localizedLabels, type LocalizedTarget } from '../model/localized';

export function LocalizedEditor({
  saved,
  target,
  onSaved,
  onClose,
}: {
  saved: SavedDraft;
  target: LocalizedTarget;
  onSaved: (value: SavedDraft) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState(() => structuredClone(saved.data));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canvasField = catalogs.canvasFields.find(
    (field) => target === `canvas:${field.value}`,
  );
  const title =
    canvasField?.label ??
    localizedLabels[target as keyof typeof localizedLabels];
  const update = <K extends keyof StartupDraft>(
    key: K,
    value: StartupDraft[K],
  ) => {
    setData((current) => ({ ...current, [key]: value }));
    setError('');
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (
      target === 'exactTeamSize' &&
      (data.exactTeamSize === null ||
        !Number.isInteger(data.exactTeamSize) ||
        data.exactTeamSize < 1 ||
        data.exactTeamSize > 32767)
    ) {
      setError('Informe um número inteiro entre 1 e 32.767.');
      return;
    }
    if (
      target === 'capital' &&
      (data.capital === null ||
        !Number.isFinite(data.capital) ||
        data.capital <= 0 ||
        data.capital > 1e12)
    ) {
      setError('Informe um valor maior que zero e de até R$ 1 trilhão.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      // Only the selected field changes; incomplete neighboring sections do not block saving.
      const nextData = canvasField
        ? {
            ...saved.data,
            canvas: {
              ...saved.data.canvas,
              [canvasField.value]: data.canvas[canvasField.value],
            },
          }
        : {
            ...saved.data,
            [target]: data[target as keyof typeof localizedLabels],
          };
      const next = {
        ...saved,
        data: nextData,
        savedAt: new Date().toISOString(),
        previewCompletedAt: null,
      };
      onSaved(await saveProfile(next));
      onClose();
    } catch {
      setError(
        'Não conseguimos salvar. Suas alterações continuam aqui para tentar novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  const options =
    target === 'investmentPurposes'
      ? catalogs.investmentPurposes
      : target === 'needs'
        ? catalogs.needs
        : null;
  return (
    <ContentDialog
      open
      title={`Editar ${title}`}
      onClose={onClose}
      busy={busy}
      closeLabel="Cancelar / fechar"
    >
      <form onSubmit={(event) => void submit(event)}>
        <fieldset
          disabled={busy}
          style={{ border: 0, padding: 0, minWidth: 0 }}
        >
          {canvasField ? (
            <Textarea
              id="localized-canvas"
              label={title}
              value={data.canvas[canvasField.value]}
              placeholder={canvasField.hint}
              rows={8}
              maxLength={1500}
              onChange={(event) =>
                update('canvas', {
                  ...data.canvas,
                  [canvasField.value]: event.target.value,
                })
              }
            />
          ) : options ? (
            <MultiSelect
              id="localized-options"
              label={title}
              options={options}
              value={data[target as 'investmentPurposes' | 'needs']}
              onChange={(value) =>
                update(target as 'investmentPurposes' | 'needs', value)
              }
            />
          ) : target === 'exactTeamSize' ? (
            <NumberInput
              id="localized-team"
              label={title}
              required
              min={1}
              max={32767}
              step={1}
              value={data.exactTeamSize}
              onValueChange={(value) => update('exactTeamSize', value)}
            />
          ) : target === 'capital' ? (
            <MoneyInput
              id="localized-capital"
              label={title}
              required
              value={data.capital}
              onValueChange={(value) => update('capital', value)}
            />
          ) : (
            <Textarea
              id="localized-text"
              label={title}
              rows={6}
              maxLength={
                target === 'pitchText'
                  ? 5000
                  : target === 'targetMarket'
                    ? 200
                    : 1500
              }
              value={
                data[
                  target as
                    'pitchText' | 'problem' | 'solution' | 'targetMarket'
                ]
              }
              onChange={(event) =>
                update(
                  target as
                    'pitchText' | 'problem' | 'solution' | 'targetMarket',
                  event.target.value,
                )
              }
            />
          )}
          {error && <p role="alert">{error}</p>}
          <p>Esta alteração será salva apenas neste navegador.</p>
          <Button type="submit">
            {busy ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </fieldset>
      </form>
    </ContentDialog>
  );
}
