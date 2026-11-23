import { apiRequest } from '@/shared/services/api';
export type Report = {
  id: string;
  tipoAlvo: string;
  alvoId: string;
  campoAlvo: string | null;
  motivo: string;
  status: string;
  criadaEm: string;
  conteudoDenunciado?: Record<string, unknown> | null;
  descricao?: string;
  justificativaDecisao?: string;
  evidencia?: { snapshot: unknown; arquivo?: { url?: string } };
  sancoes?: Sanction[];
  historico?: {
    id: string;
    acao: string;
    criadoEm: string;
    adminNome: string | null;
    detalhes: unknown;
  }[];
};
export type Sanction = {
  id: string;
  tipo: string;
  inicioEm: string;
  fimEm: string | null;
  motivo?: string;
  revogadaEm?: string | null;
};
export type Page<T> = { items: T[]; page: number; hasMore: boolean };
export async function get<T>(path: string): Promise<T> {
  return (
    await apiRequest(path, { authenticated: true, cache: 'no-store' })
  ).json() as Promise<T>;
}
export async function post(path: string, body: object = {}) {
  const response = await apiRequest(path, {
    authenticated: true,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}
export const label = (value: string) =>
  ({
    pendente: 'Pendente',
    em_analise: 'Em análise',
    resolvida: 'Resolvida',
    rejeitada: 'Rejeitada',
    mensagem: 'Mensagem',
    avaliacao: 'Avaliação',
    startup: 'Startup',
    investidor: 'Investidor',
    advertencia: 'Advertência',
    restricao_chat: 'Restrição de chat',
    suspensao: 'Suspensão',
    banimento: 'Banimento',
  })[value] ?? value;
export const date = (value: string) => new Date(value).toLocaleString('pt-BR');
