import { CheckCircleIcon, PlusIcon } from '@phosphor-icons/react';
import { canvasFields } from '../data/catalogs';
import type { StartupDraft } from '../model/types';
import { CanvasGrid, CanvasTile } from '../pages/Onboarding.styles';

export function CanvasBoard({
  canvas,
  onEdit,
}: {
  canvas: StartupDraft['canvas'];
  onEdit: (field: (typeof canvasFields)[number]) => void;
}) {
  return (
    <CanvasGrid>
      {canvasFields.map((field) => (
        <div key={field.value}>
          <CanvasTile
            type="button"
            aria-label={`${canvas[field.value].trim() ? 'Editar' : 'Preencher'} ${field.label}`}
            onClick={() => onEdit(field)}
          >
            <strong>{field.label}</strong>
            <span>{canvas[field.value].trim() || field.hint}</span>
            <small>
              {canvas[field.value].trim() ? (
                <>
                  <CheckCircleIcon size={18} aria-hidden="true" />
                  Preenchido
                </>
              ) : (
                <>
                  <PlusIcon size={18} aria-hidden="true" />
                  Adicionar
                </>
              )}
            </small>
          </CanvasTile>
        </div>
      ))}
    </CanvasGrid>
  );
}
