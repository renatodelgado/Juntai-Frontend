import { get, set } from 'idb-keyval';
import { LEGAL_VERSION } from '@/features/startup-onboarding/model/submission';
import {
  investorSchema,
  investorSteps,
  type SavedInvestor,
} from '../model/investor';
const key = 'juntai:investor-draft:v1';
let writes: Promise<void> = Promise.resolve();
export async function loadInvestorDraft(): Promise<SavedInvestor | null> {
  const value = await get<SavedInvestor>(key);
  if (!value) return null;
  if (
    value.version !== 1 ||
    !investorSteps.some((step) => step.id === value.step) ||
    !Array.isArray(value.completed) ||
    !value.completed.every((id) => investorSteps.some((step) => step.id === id))
  )
    throw new Error('Não conseguimos recuperar esta versão do rascunho.');
  const data = investorSchema.parse(value.data);
  if (value.legalVersion !== LEGAL_VERSION) {
    data.termsAccepted = false;
    data.privacyAcknowledged = false;
    data.matchingConsent = false;
  }
  return { ...value, data };
}
export function saveInvestorDraft(value: SavedInvestor) {
  const write = writes.catch(() => undefined).then(() => set(key, value));
  writes = write;
  return write;
}
