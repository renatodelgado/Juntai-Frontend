import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';

const summary = z.object({
  conversaId: z.string(),
  usuarioId: z.string(),
  nome: z.string(),
  tipoPerfil: z.enum(['startup', 'investidor']),
  ultimaMensagem: z.string().nullable(),
  ultimaMensagemEm: z.string().nullable(),
  enviadaPorMim: z.boolean().nullable(),
  naoLidas: z.number().int().min(0),
});
const message = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  conversaId: z.string(),
  conteudo: z.string(),
  enviadoEm: z.string(),
  lidoEm: z.string().nullable(),
  remetenteId: z.string(),
});
export type ConversationSummary = z.infer<typeof summary>;
export type ApiMessage = z.infer<typeof message>;
export const messagesApi = {
  async list(signal?: AbortSignal) {
    return z
      .array(summary)
      .parse(
        await (
          await apiRequest('mensagens/conversas', {
            authenticated: true,
            signal,
          })
        ).json(),
      );
  },
  async history(usuarioId: string, signal?: AbortSignal) {
    return z
      .array(message)
      .parse(
        await (
          await apiRequest(`mensagens/${encodeURIComponent(usuarioId)}`, {
            authenticated: true,
            signal,
          })
        ).json(),
      );
  },
  async send(destinatarioId: string, conteudo: string) {
    const text = conteudo.trim();
    if (!text || text.length > 5000)
      throw new Error('Escreva uma mensagem de até 5000 caracteres.');
    return message.parse(
      await (
        await apiRequest('mensagens', {
          authenticated: true,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinatarioId, conteudo: text }),
        })
      ).json(),
    );
  },
};
