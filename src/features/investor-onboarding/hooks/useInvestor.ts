import { useCallback, useEffect, useRef, useState } from 'react';
import { LEGAL_VERSION } from '@/features/startup-onboarding/model/submission';
import {
  createInvestorDraft,
  validateInvestor,
  type InvestorDraft,
  type InvestorErrors,
  type InvestorStep,
  type SavedInvestor,
} from '../model/investor';
import { loadInvestorDraft, saveInvestorDraft } from '../services/storage';

export function useInvestor(
  initial?: SavedInvestor,
  persist = saveInvestorDraft,
  autoSave = true,
) {
  const [data, setData] = useState(initial?.data ?? createInvestorDraft);
  const [step, setStep] = useState<InvestorStep>(initial?.step ?? 'about');
  const [completed, setCompleted] = useState<InvestorStep[]>(
    initial?.completed ?? [],
  );
  const [errors, setErrors] = useState<InvestorErrors>({});
  const [loading, setLoading] = useState(!initial);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const revision = useRef(0);
  useEffect(() => {
    if (initial) return;
    let active = true;
    loadInvestorDraft()
      .then((saved) => {
        if (active && saved) {
          setData(saved.data);
          setStep(saved.step);
          setCompleted(saved.completed);
        }
      })
      .catch(() => {
        if (active)
          setLoadError(
            'Não conseguimos recuperar o rascunho. Tente recarregar a página.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initial]);
  const snapshot = useCallback(
    (): SavedInvestor => ({
      ...initial,
      version: 1,
      data,
      step,
      completed,
      savedAt: new Date().toISOString(),
      status: initial?.status ?? 'draft',
      legalVersion: LEGAL_VERSION,
      ...(initial?.consent
        ? {
            consent: {
              ...initial.consent,
              version: LEGAL_VERSION,
              terms: data.termsAccepted,
              privacy: data.privacyAcknowledged,
              matching: data.matchingConsent,
              acceptedAt:
                initial.consent.terms !== data.termsAccepted ||
                initial.consent.privacy !== data.privacyAcknowledged ||
                initial.consent.matching !== data.matchingConsent
                  ? new Date().toISOString()
                  : initial.consent.acceptedAt,
            },
          }
        : {}),
    }),
    [data, step, completed, initial],
  );
  const save = useCallback(async () => {
    const version = revision.current;
    setBusy(true);
    try {
      await persist(snapshot());
      if (revision.current === version) setDirty(false);
      setMessage('Salvo neste navegador.');
      return true;
    } catch {
      setMessage(
        'Não conseguimos salvar. Seus dados continuam nesta tela. Tente novamente.',
      );
      return false;
    } finally {
      setBusy(false);
    }
  }, [persist, snapshot]);
  useEffect(() => {
    if (!autoSave || loading || loadError || !dirty) return;
    const timer = window.setTimeout(() => {
      void save();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [autoSave, loading, loadError, dirty, save]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function update<K extends keyof InvestorDraft>(
    key: K,
    value: InvestorDraft[K],
  ) {
    revision.current += 1;
    setData((previous) => {
      const next = { ...previous, [key]: value };
      if (key === 'state') {
        next.cityId = '';
        next.cityName = '';
      }
      if (key === 'participation' && value === 'mentor') {
        next.ticketMin = null;
        next.ticketMax = null;
        next.risk = '';
        next.openInvestment = '';
        next.investmentCount = '';
        next.offers = next.offers.filter((offer) => offer !== 'capital');
      }
      return next;
    });
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setDirty(true);
  }
  function navigate(next: InvestorStep) {
    revision.current += 1;
    setStep(next);
    setErrors({});
    setDirty(true);
  }
  function validate(target = step) {
    const next = validateInvestor(target, data);
    setErrors(next);
    return !Object.keys(next).length;
  }
  return {
    data,
    step,
    completed,
    errors,
    loading,
    loadError,
    message,
    busy,
    dirty,
    snapshot,
    save,
    update,
    navigate,
    validate,
    complete() {
      setCompleted((previous) => [...new Set([...previous, step])]);
    },
    completedValid: completed.filter(
      (id) => !Object.keys(validateInvestor(id, data)).length,
    ),
  };
}
