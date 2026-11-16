import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { FeedbackDialog } from './FeedbackDialog';
import type { FeedbackContext } from './api';
export function FeedbackButton({
  context,
  disabled = false,
}: {
  context: FeedbackContext;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        $variant="secondary"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Avaliar interação
      </Button>
      {open && (
        <FeedbackDialog context={context} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
