import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
const person = z.object({
  investidorId: z.string(),
  usuarioId: z.string(),
  nome: z.string(),
  avatarUrl: z.string().nullable(),
  tipoInvestidor: z.enum(['anjo', 'mentor', 'anjo_mentor']),
  tituloProfissional: z.string().nullable(),
  bio: z.string().nullable(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  descricaoExperiencia: z.string().nullable(),
  anosExperiencia: z.number().nullable(),
  areasAjuda: z.array(z.string()),
  segmentosInteresse: z.array(z.string()),
  estagiosInteresse: z.array(z.string()),
  interessadoEm: z.string(),
  conversaId: z.string().nullable(),
  conversaIniciada: z.boolean(),
  podeAvaliarConversa: z.boolean(),
  reuniaoAgendadaId: z.string().nullable(),
  reuniaoAgendadaEm: z.string().nullable(),
  reunioesAgendadas: z.number().int().min(0),
  reuniaoRealizadaId: z.string().nullable(),
  situacao: z.enum([
    'novo_interesse',
    'em_conversa',
    'reuniao_agendada',
    'em_acompanhamento',
  ]),
});
const response = z.object({
  items: z.array(person),
  resumo: z.object({
    interessados: z.number().int().min(0),
    conversasIniciadas: z.number().int().min(0),
    reunioesAgendadas: z.number().int().min(0),
  }),
});
export type InterestedPerson = z.infer<typeof person>;
export type ReceivedInterests = z.infer<typeof response>;
export const receivedInterestsApi = {
  async list(signal?: AbortSignal) {
    return response.parse(
      await (
        await apiRequest('startups/interessados', {
          authenticated: true,
          signal,
        })
      ).json(),
    );
  },
};
