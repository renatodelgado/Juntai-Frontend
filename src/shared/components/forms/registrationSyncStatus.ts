import { createContext } from 'react';

export type SyncNote = { kind: 'local' | 'partial'; text: string };
export type SyncScope = {
  role: 'startup' | 'investor';
  data: {
    publicName?: string;
    revenue?: string;
    teamSize?: string;
    hideCustomers?: boolean;
    businessModels?: string[];
  };
};
export const RegistrationSyncContext = createContext<SyncScope | null>(null);
export function registrationSyncNote(
  scope: SyncScope | null,
  field: string,
): SyncNote | undefined {
  if (!scope) return;
  // Confirmações da interface não são campos do perfil no banco.
  // O cadastro de startup informa a ausência de persistência no texto dos termos.
  if (scope.role === 'startup') return;
  void field;
}
