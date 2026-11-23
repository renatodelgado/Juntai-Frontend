import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
export type FeedbackContext = { tipo: 'conversa' | 'reuniao'; id: string };
export const resultadoOptions = {
  em_analise: 'Em análise',
  avancar: 'Vamos avançar',
  nao_seguir: 'Não vamos seguir',
} as const;
export const investimentoOptions = {
  nao_definido: 'Ainda não definido',
  em_negociacao: 'Em negociação',
  intencao: 'Intenção de investir',
  realizado: 'Investimento realizado',
  nao_se_aplica: 'Não se aplica',
} as const;
const review = z.object({
  id: z.string(),
  nota: z.number().int().min(1).max(5),
  comentario: z.string().nullable(),
  resultadoInteracao: z.enum(['em_analise', 'avancar', 'nao_seguir']),
  perspectivaInvestimento: z.enum([
    'nao_definido',
    'em_negociacao',
    'intencao',
    'realizado',
    'nao_se_aplica',
  ]),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
});
const state = z.object({
  elegivel: z.boolean(),
  nome: z.string(),
  avaliacao: review.nullable(),
  avaliacaoRecebida: z
    .object({
      id: z.string(),
      nota: z.number(),
      comentario: z.string().nullable(),
      atualizadoEm: z.string(),
    })
    .nullable()
    .optional(),
  investimentoInformadoPeloOutro: z.boolean(),
  investimentoConfirmado: z.boolean(),
});
export type FeedbackState = z.infer<typeof state>;
export type FeedbackInput = Pick<
  z.infer<typeof review>,
  'nota' | 'comentario' | 'resultadoInteracao' | 'perspectivaInvestimento'
>;
const path = ({ tipo, id }: FeedbackContext) =>
  `avaliacoes/${tipo}/${encodeURIComponent(id)}`;
export const feedbackApi = {
  async get(context: FeedbackContext, signal?: AbortSignal) {
    return state.parse(
      await (
        await apiRequest(path(context), { authenticated: true, signal })
      ).json(),
    );
  },
  async save(context: FeedbackContext, input: FeedbackInput) {
    return state.parse(
      await (
        await apiRequest(path(context), {
          authenticated: true,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
      ).json(),
    );
  },
  async defer(context: FeedbackContext) {
    await apiRequest(`${path(context)}/adiar`, {
      authenticated: true,
      method: 'POST',
    });
  },
  async pending(signal?: AbortSignal) {
    return z
      .array(
        z.object({
          tipo: z.literal('reuniao'),
          id: z.string(),
          nome: z.string(),
        }),
      )
      .parse(
        await (
          await apiRequest('avaliacoes/pendentes', {
            authenticated: true,
            signal,
          })
        ).json(),
      );
  },
};
