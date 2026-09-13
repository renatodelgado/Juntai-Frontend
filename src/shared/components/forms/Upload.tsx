import { FieldSync } from './RegistrationSync';
import { FileArrowUpIcon, TrashIcon } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { ErrorBalloon, FieldRoot, Hint, InputControl, Label } from './styles';

export function Upload({
  id,
  file,
  error,
  onChange,
  onRemove,
}: {
  id: string;
  file: File | null;
  error?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <FieldSync field={id}>
      <FieldRoot>
        <Label htmlFor={id}>
          <FileArrowUpIcon size={22} aria-hidden="true" />
          Apresentação <span>Opcional</span>
        </Label>
        <InputControl
          id={id}
          type="file"
          accept=".pdf,.ppt,.pptx"
          aria-invalid={!!error}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) onChange(selected);
            event.target.value = '';
          }}
        />
        <Hint id={`${id}-hint`}>
          PDF, PPT ou PPTX, até 10 MB. Ao salvar o rascunho, o arquivo também
          fica neste navegador.
        </Hint>
        {file && (
          <div>
            <Hint>
              {file.name} ·{' '}
              {(file.size / 1024 / 1024).toLocaleString('pt-BR', {
                maximumFractionDigits: 2,
              })}{' '}
              MB
            </Hint>
            <Button type="button" $variant="quiet" onClick={onRemove}>
              <TrashIcon size={18} aria-hidden="true" />
              Remover apresentação
            </Button>
          </div>
        )}
        {error && <ErrorBalloon id={`${id}-error`}>{error}</ErrorBalloon>}
      </FieldRoot>
    </FieldSync>
  );
}
