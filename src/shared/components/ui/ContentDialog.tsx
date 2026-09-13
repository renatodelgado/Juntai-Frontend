import { useEffect, useId, useRef, type ReactNode } from 'react';
import { XIcon } from '@phosphor-icons/react';
import styled from 'styled-components';
import { Button } from './Button';

const Dialog = styled.dialog`
  width: min(100% - 1.5rem, 48rem);
  max-height: calc(100dvh - 2rem);
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  border-radius: ${({ theme }) => theme.radii.card};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.darkSlateBlue};
  &[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
  }
  &::backdrop {
    background: ${({ theme }) => theme.colors.overlay};
  }
  > header,
  > footer {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  > header {
    justify-content: space-between;
    border-bottom: 1px solid ${({ theme }) => theme.colors.accentBorder};
  }
  > header h2 {
    margin: 0;
    font-size: 1.3rem;
  }
  > footer {
    justify-content: flex-end;
    border-top: 1px solid ${({ theme }) => theme.colors.accentBorder};
  }
  > div {
    padding: 1.5rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  article h2 {
    font-size: 1.1rem;
    margin-top: 1.75rem;
  }
`;

export function ContentDialog({
  open,
  title,
  children,
  onClose,
  closeLabel = 'Fechar',
  busy = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <Dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <Button
          type="button"
          $variant="quiet"
          aria-label={`Fechar ${title}`}
          disabled={busy}
          onClick={onClose}
        >
          <XIcon size={22} aria-hidden="true" />
        </Button>
      </header>
      <div>{children}</div>
      <footer>
        <Button type="button" disabled={busy} onClick={onClose}>
          {closeLabel}
        </Button>
      </footer>
    </Dialog>
  );
}
