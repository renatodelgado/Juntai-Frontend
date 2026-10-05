import type { StartupDraft } from '@/features/startup-onboarding/model/types';

export const localizedLabels = {
  pitchText: 'Seu pitch',
  problem: 'O problema',
  solution: 'Nossa solução',
  targetMarket: 'Quem atendemos',
  exactTeamSize: 'Tamanho da equipe',
  capital: 'Capital buscado',
  investmentPurposes: 'Finalidade do capital',
  needs: 'Necessidades da startup',
} as const;
export type LocalizedTarget =
  keyof typeof localizedLabels | `canvas:${keyof StartupDraft['canvas']}`;
