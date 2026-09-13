import { useEffect, useId, useRef, type ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from './Button';

const Dialog = styled.dialog`
  width: min(100% - 2rem, 30rem);
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  color: ${({ theme }) => theme.colors.darkSlateBlue};
  background: ${({ theme }) => theme.colors.white};
  &::backdrop {
    background: ${({ theme }) => theme.colors.overlay};
  }
  h2 {
    margin-top: 0;
  }
  footer {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
`;

export function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
  busy = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <Dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <footer>
        <Button
          type="button"
          $variant="secondary"
          onClick={onClose}
          disabled={busy}
          autoFocus
        >
          Voltar
        </Button>
        <Button type="button" onClick={onConfirm} disabled={busy}>
          {busy ? 'Aguarde…' : confirmLabel}
        </Button>
      </footer>
    </Dialog>
  );
}
