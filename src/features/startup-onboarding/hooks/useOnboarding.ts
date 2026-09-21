import { useEffect, useState } from 'react';
import {
  createDraft,
  type StartupDraft,
  type Errors,
  type FieldName,
} from '../model/types';
import { steps, type StepId } from '../data/steps';
import {
  loadDraft,
  saveDraft,
  removeDraft,
  type SavedDraft,
} from '../services/draftStorage';
import { LEGAL_VERSION } from '../model/submission';
import { validateStep, validateAttachment } from '../model/validation';

export function useOnboarding(initial?: SavedDraft, persist = saveDraft) {
  const [data, setData] = useState(createDraft);
  const [current, setCurrent] = useState<StepId>('about');
  const [completed, setCompleted] = useState<StepId[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [storageError, setStorageError] = useState('');
  const [previewCompletedAt, setPreviewCompletedAt] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    (initial ? Promise.resolve(initial) : loadDraft())
      .then((saved) => {
        if (!active || !saved) return;
        setData(saved.data);
        setCurrent(saved.step);
        setCompleted(saved.completed);
        setAttachment(saved.attachment);
        setPreviewCompletedAt(saved.previewCompletedAt);
        setMessage(
          saved.notice ||
            `Rascunho recuperado. Salvo em ${new Date(saved.savedAt).toLocaleString('pt-BR')}.`,
        );
      })
      .catch((error: unknown) => {
        if (active)
          setStorageError(
            error instanceof Error
              ? error.message
              : 'Não foi possível abrir o armazenamento deste navegador.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initial]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function update<K extends FieldName>(field: K, value: StartupDraft[K]) {
    setData((previous) => {
      const next = { ...previous, [field]: value };
      if (field === 'segment')
        next.secondarySegments = next.secondarySegments.filter(
          (segment) => segment !== value,
        );
      if (
        field === 'businessModels' &&
        !next.businessModels.includes(next.primaryModel)
      )
        next.primaryModel = '';
      if (field === 'state') {
        next.cityId = '';
        next.cityName = '';
      }
      return next;
    });
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setCompleted((previous) =>
      previous.filter((step) => step !== 'review' && step !== 'consent'),
    );
    setDirty(true);
    setMessage('Alterações ainda não salvas.');
    setPreviewCompletedAt(null);
  }

  function navigate(step: StepId) {
    setCurrent(step);
    setErrors({});
    setDirty(true);
  }
  function next() {
    const validation = validateStep(current, data);
    setErrors(validation);
    if (
      Object.keys(validation).length ||
      (current === 'pitch' && attachmentError)
    )
      return false;
    const index = steps.findIndex((step) => step.id === current);
    const following = steps[index + 1];
    if (following) {
      setCompleted((previous) => [...new Set([...previous, current])]);
      navigate(following.id);
    }
    return true;
  }
  function validateAll() {
    for (const step of steps) {
      const validation = validateStep(step.id, data);
      if (
        Object.keys(validation).length ||
        (step.id === 'pitch' && attachmentError)
      ) {
        setCurrent(step.id);
        setErrors(validation);
        return false;
      }
    }
    return true;
  }
  async function save(finish = false, snapshot = data) {
    setBusy(true);
    try {
      const now = new Date().toISOString();
      await persist({
        version: 1,
        regionCatalogVersion: 2,
        data: snapshot,
        step: current,
        completed,
        savedAt: now,
        legalVersion: LEGAL_VERSION,
        attachment,
        previewCompletedAt: finish
          ? now
          : snapshot === data
            ? previewCompletedAt
            : null,
      });
      setDirty(false);
      setStorageError('');
      setMessage(
        `Salvo neste navegador às ${new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Você pode sair e voltar depois.`,
      );
      if (finish) setPreviewCompletedAt(now);
      return true;
    } catch {
      setMessage(
        'Não conseguimos salvar. O navegador pode estar sem espaço ou com armazenamento bloqueado. Seus dados continuam nesta tela; tente novamente antes de sair.',
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    setBusy(true);
    try {
      await removeDraft();
      setData(createDraft());
      setCurrent('about');
      setCompleted([]);
      setErrors({});
      setAttachment(null);
      setAttachmentError(undefined);
      setDirty(false);
      setStorageError('');
      setPreviewCompletedAt(null);
      setMessage('Rascunho removido deste navegador.');
      return true;
    } catch {
      setMessage('Não conseguimos remover o rascunho. Tente novamente.');
      return false;
    } finally {
      setBusy(false);
    }
  }
  function changeAttachment(file: File | null) {
    const error = file ? validateAttachment(file) : null;
    setAttachmentError(error ?? undefined);
    if (error) return;
    setAttachment(file);
    setDirty(true);
    setPreviewCompletedAt(null);
    setMessage('Alterações ainda não salvas.');
  }
  return {
    data,
    current,
    completed: completed.filter(
      (step) => !Object.keys(validateStep(step, data)).length,
    ),
    errors,
    attachment,
    attachmentError,
    loading,
    busy,
    dirty,
    message,
    storageError,
    previewCompletedAt,
    update,
    navigate,
    next,
    validateAll,
    validate(step: StepId) {
      const validation = validateStep(step, data);
      setErrors(validation);
      return (
        !Object.keys(validation).length &&
        !(step === 'pitch' && attachmentError)
      );
    },
    save,
    reset,
    changeAttachment,
  };
}

export type OnboardingController = ReturnType<typeof useOnboarding>;
