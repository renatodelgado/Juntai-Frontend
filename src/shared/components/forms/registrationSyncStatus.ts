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
  if (scope.role === 'startup') {
    if (field === 'hideCustomers')
      return partial(
        'Esta escolha controla o envio do número de clientes; não é registrada como campo separado.',
      );
    if (/^(member-|role-|bio-|linkedin-|link-)/.test(field)) return local();
    if (
      [
        'startup-logo',
        'description',
        'website',
        'linkedin',
        'instagram',
        'otherLinks',
        'secondarySegments',
        'state',
        'cityId',
        'operatingRegions',
        'targetRegions',
        'growthPeriod',
        'growthMetric',
        'growthPercent',
        'growthNotes',
        'needs',
        'partnerType',
        'expertise',
        'partnerRegions',
        'partnerStages',
        'preferences',
        'attachment',
        'videoUrl',
        'members',
      ].includes(field)
    )
      return local();
    if (field === 'name' && scope.data.publicName?.trim())
      return local(
        'O cadastro envia o nome público como nome fantasia. Este nome fica apenas no rascunho.',
      );
    if (
      field === 'businessModels' &&
      (scope.data.businessModels?.length ?? 0) > 1
    )
      return partial(
        'Somente o modelo principal escolhido em Mercado será enviado.',
      );
    if (field === 'revenue' && scope.data.revenue !== 'none')
      return local(
        scope.data.revenue === 'undisclosed'
          ? 'Nenhum faturamento será enviado, conforme sua escolha.'
          : 'Esta faixa não é enviada. Você pode informar o valor exato em Tração.',
      );
    if (field === 'teamSize' && scope.data.teamSize !== '1')
      return local(
        'Esta faixa não é enviada. Você pode informar a quantidade exata na conclusão.',
      );
    if (field === 'customers' && scope.data.hideCustomers)
      return local(
        'O número de clientes não será enviado, conforme sua escolha.',
      );
    if (field === 'seekingInvestment')
      return partial(
        'A escolha não é enviada como campo separado. Sem busca de investimento ou em avaliação, o capital enviado é zero.',
      );
  } else if (
    [
      'investor-photo',
      'photo',
      'title',
      'state',
      'cityId',
      'linkedin',
      'expertise',
      'history',
      'investmentCount',
      'experience',
      'previousSectors',
      'frequency',
      'interactions',
      'acceptsMentoring',
      'openInvestment',
      'offers',
      'preferences',
      'availability',
    ].includes(field)
  )
    return local();
}
