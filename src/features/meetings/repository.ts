import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
import { dayKey, type MeetingInput } from './model';

const schema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    startupId: z.string(),
    startupNome: z.string(),
    investidorId: z.string(),
    investidorNome: z.string(),
    dataHoraAgendada: z.string().datetime({ offset: true }),
    status: z.enum(['agendada', 'realizada', 'cancelada', 'no_show']),
    linkReuniao: z.string().nullable(),
    notas: z.string().nullable(),
    criadoEm: z.string(),
  })
  .transform((item) => ({
    ...item,
    date: dayKey(new Date(item.dataHoraAgendada)),
    time: new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Fortaleza',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(item.dataHoraAgendada)),
    title: `${item.startupNome} · ${item.investidorNome}`,
  }));
export const meetingsRepository = {
  async list(signal?: AbortSignal) {
    return z
      .array(schema)
      .parse(
        await (
          await apiRequest('reunioes', { authenticated: true, signal })
        ).json(),
      );
  },
  async create(input: MeetingInput) {
    return schema.parse(
      await (
        await apiRequest('reunioes', {
          authenticated: true,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
      ).json(),
    );
  },
  async updateStatus(
    id: string,
    status: 'realizada' | 'cancelada' | 'no_show',
  ) {
    return schema.parse(
      await (
        await apiRequest(`reunioes/${encodeURIComponent(id)}/status`, {
          authenticated: true,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      ).json(),
    );
  },
};
