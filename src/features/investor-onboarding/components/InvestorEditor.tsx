import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { saveInvestorProfile } from '@/features/auth/services/localAuth';
import { InvestorFields } from './InvestorFields';
import {
  investorSteps,
  type InvestorStep,
  type SavedInvestor,
} from '../model/investor';
import { useInvestor } from '../hooks/useInvestor';
export function InvestorEditor({
  saved,
  step,
  onClose,
  onSaved,
}: {
  saved: SavedInvestor;
  step: InvestorStep;
  onClose: () => void;
  onSaved: (value: SavedInvestor) => void;
}) {
  const form = useInvestor(saved, saveInvestorProfile, false);
  const [cancel, setCancel] = useState(false);
  const [activeStep, setActiveStep] = useState(step);
  const ref = useRef<HTMLFormElement>(null);
  async function save() {
    if (!form.validate(activeStep)) {
      requestAnimationFrame(() =>
        ref.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    if (await form.save()) {
      onSaved(form.snapshot());
      onClose();
    }
  }
  return (
    <ContentDialog
      open
      title={`Editar ${investorSteps.find((item) => item.id === activeStep)?.label}`}
      busy={form.busy}
      closeLabel="Cancelar / fechar"
      onClose={() => {
        if (form.dirty) setCancel(true);
        else onClose();
      }}
    >
      <form
        ref={ref}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset
          disabled={form.busy}
          style={{ border: 0, padding: 0, minWidth: 0 }}
        >
          <InvestorFields
            data={form.data}
            step={activeStep}
            errors={form.errors}
            update={form.update}
            edit={setActiveStep}
          />
          <Button type="submit" style={{ marginTop: '1.5rem' }}>
            Salvar alterações
          </Button>
        </fieldset>
        <p role="status">{form.message}</p>
      </form>
      {cancel && (
        <div role="alert">
          <p>Descartar as alterações desta edição?</p>
          <Button $variant="danger" onClick={onClose}>
            Descartar alterações
          </Button>
          <Button $variant="quiet" onClick={() => setCancel(false)}>
            Continuar editando
          </Button>
        </div>
      )}
    </ContentDialog>
  );
}
