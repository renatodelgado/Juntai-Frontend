import { del, get, set } from 'idb-keyval';
import { z } from 'zod';
import { draftSchema, type StartupDraft } from '../model/types';
import { steps, type StepId } from '../data/steps';
import { LEGAL_VERSION } from '../model/submission';
import { validateAttachment } from '../model/validation';

const STORAGE_KEY = 'juntai:startup-onboarding:v1';
const savedSchema = z.object({
  version: z.literal(1),
  data: draftSchema,
  step: z.string(),
  completed: z.array(z.string()),
  savedAt: z.string(),
  legalVersion: z.string(),
  attachment: z.unknown().nullable(),
  previewCompletedAt: z.string().nullable(),
  regionCatalogVersion: z.number().default(1),
});

export interface SavedDraft {
  version: 1;
  data: StartupDraft;
  step: StepId;
  completed: StepId[];
  savedAt: string;
  legalVersion: string;
  attachment: File | null;
  previewCompletedAt: string | null;
  regionCatalogVersion?: number;
  notice?: string;
}

export async function loadDraft(): Promise<SavedDraft | null> {
  const stored: unknown = await get(STORAGE_KEY);
  if (!stored) return null;
  const parsed = savedSchema.safeParse(stored);
  if (!parsed.success)
    throw new Error(
      'Não foi possível abrir o rascunho salvo. Você pode removê-lo e começar novamente.',
    );
  const saved = parsed.data;
  const validIds: readonly string[] = steps.map((step) => step.id);
  if (
    !validIds.includes(saved.step) ||
    saved.completed.some((id) => !validIds.includes(id))
  )
    throw new Error(
      'Este rascunho usa etapas de outra versão. Remova-o para começar novamente.',
    );
  let attachment: File | null = null;
  if (saved.attachment !== null && saved.attachment !== undefined) {
    if (
      !(saved.attachment instanceof File) ||
      validateAttachment(saved.attachment)
    )
      throw new Error(
        'A apresentação salva não pôde ser recuperada. Remova o rascunho para começar novamente.',
      );
    attachment = saved.attachment;
  }
  const data = saved.data;
  if (saved.legalVersion !== LEGAL_VERSION) {
    data.termsAccepted = false;
    data.privacyAcknowledged = false;
    data.matchingConsent = false;
  }
  return {
    ...saved,
    data,
    step: saved.step as StepId,
    completed: saved.completed.filter((id) => id !== 'consent') as StepId[],
    attachment,
    notice:
      saved.regionCatalogVersion < 2
        ? 'Atualizamos as opções de regiões. Confira as etapas Atuação e Parcerias antes de concluir.'
        : undefined,
  };
}

export async function saveDraft(draft: SavedDraft): Promise<void> {
  await set(STORAGE_KEY, draft);
}
export async function removeDraft(): Promise<void> {
  await del(STORAGE_KEY);
}
