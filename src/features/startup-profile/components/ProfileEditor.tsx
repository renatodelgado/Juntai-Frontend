import { useRef } from 'react';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import { useOnboarding } from '@/features/startup-onboarding/hooks/useOnboarding';
import type { SavedDraft } from '@/features/startup-onboarding/services/draftStorage';
import { steps, type StepId } from '@/features/startup-onboarding/data/steps';
import {
  AboutStep,
  BusinessStep,
  MarketStep,
} from '@/features/startup-onboarding/components/BusinessSteps';
import { LocationStep } from '@/features/startup-onboarding/components/LocationStep';
import {
  TractionStep,
  InvestmentStep,
  MatchingStep,
} from '@/features/startup-onboarding/components/GrowthSteps';
import {
  PitchStep,
  TeamStep,
} from '@/features/startup-onboarding/components/PresentationSteps';
import { ConsentStep } from '@/features/startup-onboarding/components/ConsentStep';
import { saveProfile } from '@/features/auth/services/localAuth';

export function ProfileEditor({
  saved,
  step,
  onClose,
  onSaved,
}: {
  saved: SavedDraft;
  step: StepId;
  onClose: () => void;
  onSaved: (profile: SavedDraft) => void;
}) {
  const snapshot = useRef(saved);
  // Canvas can save inside its own dialog. Other changes remain pending until confirmation.
  async function persist(profile: SavedDraft) {
    const next = { ...profile, previewCompletedAt: saved.previewCompletedAt };
    await saveProfile(next);
    snapshot.current = next;
  }
  const form = useOnboarding(saved, persist);
  const ref = useRef<HTMLFormElement>(null);
  const sections = {
    about: <AboutStep form={form} />,
    business: <BusinessStep form={form} />,
    market: <MarketStep form={form} />,
    location: <LocationStep form={form} />,
    traction: <TractionStep form={form} />,
    investment: <InvestmentStep form={form} />,
    matching: <MatchingStep form={form} />,
    pitch: <PitchStep form={form} />,
    team: <TeamStep form={form} />,
    consent: <ConsentStep form={form} />,
    review: null,
  };
  return (
    <ContentDialog
      open
      title={`Editar ${steps.find((item) => item.id === step)?.label ?? 'perfil'}`}
      busy={form.busy}
      closeLabel="Cancelar / fechar"
      onClose={() => {
        onSaved(snapshot.current);
        onClose();
      }}
    >
      {form.loading ? (
        <p role="status">Preparando edição…</p>
      ) : (
        <form
          ref={ref}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.validate(step)) {
              requestAnimationFrame(() =>
                ref.current
                  ?.querySelector<HTMLElement>('[aria-invalid="true"]')
                  ?.focus(),
              );
              return;
            }
            void form.save(true).then((success) => {
              if (success) {
                onSaved(snapshot.current);
                onClose();
              }
            });
          }}
        >
          <fieldset
            disabled={form.busy}
            style={{ border: 0, padding: 0, minWidth: 0 }}
          >
            {sections[step]}
            <Button type="submit" style={{ marginTop: '1.5rem' }}>
              Salvar alterações
            </Button>
          </fieldset>
          <p role="status">{form.message}</p>
        </form>
      )}
    </ContentDialog>
  );
}
