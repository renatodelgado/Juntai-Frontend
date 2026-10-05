import { apiRequest } from '@/shared/services/api';
export interface Row {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  tipoInvestidor?: string | null;
  responsavel?: string;
  segmento?: string | null;
  criadoEm: string;
  status: string;
  ativo: boolean;
}
export interface AuditRow {
  id: string;
  acao: string;
  recurso: string;
  entidadeId: string | null;
  detalhes: Record<string, unknown> | null;
  criadoEm: string;
  ator: string | null;
}
export interface PageData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
export interface Metrics {
  usuarios: number;
  startups: number;
  investidores: number;
  mentores: number;
  pendentes: number;
  reunioes: number;
}
export async function adminGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  return (
    await apiRequest('admin/' + path, { authenticated: true, signal })
  ).json() as Promise<T>;
}
export async function adminWrite(
  path: string,
  body: Record<string, unknown>,
  method = 'POST',
) {
  return (
    await apiRequest('admin/' + path, {
      authenticated: true,
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  ).json() as Promise<unknown>;
}
export const actions: Record<string, string> = {
  aprovacao_cadastro: 'Aprovação de cadastro',
  rejeicao_cadastro: 'Rejeição de cadastro',
  edicao_conteudo: 'Edição de dados',
  suspensao_usuario: 'Suspensão de usuário',
  reativacao_usuario: 'Reativação de usuário',
  remocao_conteudo: 'Remoção de conteúdo',
};
export const types: Record<string, string> = {
  startup: 'Startup',
  investidor: 'Investidor',
  mentor: 'Mentor',
  admin: 'Administrador',
  usuarios: 'Usuários',
  startups: 'Startups',
  investidores: 'Investidores',
};
export const statuses: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  suspenso: 'Suspenso',
  ativo: 'Ativo',
  inativo: 'Inativo',
};
export const date = (value: string) =>
  new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
