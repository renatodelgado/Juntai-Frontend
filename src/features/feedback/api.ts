import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
export type FeedbackContext = { tipo: 'conversa' | 'reuniao'; id: string };
const review = z.object({
  id: z.string(),
  nota: z.number().int().min(1).max(5),
  comentario: z.string().nullable(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
});
const state = z.object({
  elegivel: z.boolean(),
  nome: z.string(),
  avaliacao: review.nullable(),
});
export type FeedbackState = z.infer<typeof state>;
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
  async save(context: FeedbackContext, nota: number, comentario: string) {
    return state.parse(
      await (
        await apiRequest(path(context), {
          authenticated: true,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nota, comentario }),
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
