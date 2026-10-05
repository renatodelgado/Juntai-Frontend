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
const local = (
  text = 'Não é enviado no cadastro. Para guardar neste navegador, use “Salvar e continuar depois”.',
): SyncNote => ({ kind: 'local', text });
const partial = (text: string): SyncNote => ({ kind: 'partial', text });

export function registrationSyncNote(
  scope: SyncScope | null,
  field: string,
): SyncNote | undefined {
  if (!scope) return;
  // Confirmações da interface não são campos do perfil no banco.
  // O cadastro de startup informa a ausência de persistência no texto dos termos.
  if (scope.role === 'startup') return;
  if (scope.role === 'investor' && field === 'expertise')
    return partial(
      'Somente opções com equivalente no servidor são enviadas; as demais permanecem no rascunho.',
    );
  if (scope.role === 'investor' && field === 'history')
    return partial(
      'Sim ou não é registrado. “Prefiro não informar” é omitido, mas o servidor usa não como padrão.',
    );
  if (field === 'account-confirm')
    return local(
      'Usado apenas para conferir a senha; não é enviado nem salvo.',
    );
  if (
    ['termsAccepted', 'privacyAcknowledged', 'matchingConsent'].includes(field)
  )
    return local(
      'O aceite fica neste navegador; o backend ainda não registra esta escolha.',
    );
  if (
    [
      'investor-photo',
      'photo',
      'investmentCount',
      'frequency',
      'interactions',
      'acceptsMentoring',
      'openInvestment',
      'offers',
      'preferences',
    ].includes(field)
  )
    return local();
}
