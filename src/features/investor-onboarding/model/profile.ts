import type { InvestorDraft, InvestorStep, SavedInvestor } from './investor';

export function investorCompleteness(data: InvestorDraft) {
  const fields: { label: string; step: InvestorStep; filled: boolean }[] = [
    {
      label: 'apresentação',
      step: 'about',
      filled: !!data.name.trim() && !!data.bio.trim() && !!data.title.trim(),
    },
    { label: 'foto', step: 'about', filled: !!data.photo },
    {
      label: 'localização',
      step: 'about',
      filled: !!data.cityId && !!data.state,
    },
    { label: 'atuação', step: 'participation', filled: !!data.participation },
    { label: 'segmentos', step: 'interests', filled: !!data.segments.length },
    { label: 'estágios', step: 'stages', filled: !!data.stages.length },
    {
      label: 'modelos e regiões',
      step: 'market',
      filled: !!data.businessModels.length && !!data.regions.length,
    },
    {
      label: 'experiência',
      step: 'experience',
      filled: !!data.expertise.length,
    },
    {
      label: 'histórico',
      step: 'history',
      filled:
        data.history === 'no' ||
        data.history === 'undisclosed' ||
        (data.history === 'yes' && !!data.experience.trim()),
    },
    {
      label: 'disponibilidade',
      step: 'availability',
      filled:
        !!data.frequency &&
        !!data.interactions.length &&
        data.acceptsMentoring !== null,
    },
    { label: 'contribuições', step: 'offers', filled: !!data.offers.length },
  ];
  if (data.participation !== 'mentor') {
    fields.push({
      label: 'ticket',
      step: 'investment',
      filled:
        data.ticketMin !== null &&
        data.ticketMax !== null &&
        data.ticketMin >= 0 &&
        data.ticketMax >= data.ticketMin,
    });
    fields.push({
      label: 'perfil de risco',
      step: 'experience',
      filled: !!data.risk,
    });
  }
  return {
    percent: Math.round(
      (fields.filter((field) => field.filled).length / fields.length) * 100,
    ),
    missing: fields.filter((field) => !field.filled),
  };
}

export const statusLabels: Record<SavedInvestor['status'], string> = {
  draft: 'Rascunho',
  in_review: 'Em avaliação',
  approved: 'Aprovado',
  changes_requested: 'Pendente de ajustes',
  rejected: 'Rejeitado',
};
export const statusContent: Record<
  SavedInvestor['status'],
  { title: string; description: string }
> = {
  draft: {
    title: 'Seu perfil está ganhando forma',
    description:
      'Complete suas informações para preparar suas próximas conexões.',
  },
  in_review: {
    title: 'Seu perfil está em avaliação',
    description:
      'Você pode continuar atualizando seu perfil enquanto aguarda a análise.',
  },
  approved: {
    title: 'Perfil aprovado',
    description:
      'Seu perfil está pronto para a próxima etapa de conexões no Juntaí!.',
  },
  changes_requested: {
    title: 'Precisamos de alguns ajustes',
    description:
      'Confira as solicitações e atualize seu perfil antes de uma nova avaliação.',
  },
  rejected: {
    title: 'Seu perfil não foi aprovado',
    description:
      'Confira o retorno da avaliação para entender os próximos passos.',
  },
};
export const money = (value: number | null) =>
  value?.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }) ?? 'Não informado';
