import type { InterestedPerson } from './api';
export const typeLabels = {
  anjo: 'Investidor',
  mentor: 'Mentor',
  anjo_mentor: 'Investidor e mentor',
};
export const statusLabels = {
  novo_interesse: 'Novo interesse',
  em_conversa: 'Em conversa',
  reuniao_agendada: 'Reunião agendada',
  em_acompanhamento: 'Reunião realizada',
};
const helpLabels: Record<string, string> = {
  mentoria: 'Mentoria',
  networking: 'Conexões',
  operacoes: 'Operações',
  vendas_marketing: 'Vendas e marketing',
  growth: 'Crescimento',
  financeiro_juridico: 'Finanças e jurídico',
  produto_tecnologia: 'Produto e tecnologia',
  rh_pessoas: 'Pessoas e gestão',
};
const stageLabels: Record<string, string> = {
  ideacao: 'Ideação',
  validacao: 'Validação',
  mvp: 'MVP',
  tracao: 'Tração',
  crescimento: 'Crescimento',
  escala: 'Escala',
};
const segmentLabels: Record<string, string> = {
  fintech: 'Fintech',
  healthtech: 'Healthtech',
  edtech: 'Edtech',
  agtech: 'Agtech',
  saas_b2b: 'SaaS B2B',
  marketplace: 'Marketplace',
  ecommerce: 'E-commerce',
  economia_criativa: 'Economia criativa',
};
export const readable = (value: string) => value.replaceAll('_', ' ');
export const stagesLabel = (value: string) =>
  stageLabels[value] ?? readable(value);
export const segmentLabel = (value: string) =>
  segmentLabels[value] ?? readable(value);
export const contributions = (person: InterestedPerson) => [
  ...new Set([
    ...(person.tipoInvestidor !== 'mentor' ? ['Capital'] : []),
    ...(person.tipoInvestidor !== 'anjo' ? ['Mentoria'] : []),
    ...person.areasAjuda.map((value) => helpLabels[value] ?? readable(value)),
  ]),
];
export const dateLabel = (value: string, withTime = false) =>
  new Date(value).toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza',
    dateStyle: 'short',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  });
export function filterInterested(
  items: InterestedPerson[],
  search: string,
  type: string,
  status: string,
  order: string,
) {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  return items
    .filter(
      (person) =>
        normalize(`${person.nome} ${person.tituloProfissional ?? ''}`).includes(
          normalize(search.trim()),
        ) &&
        (type === 'todos' ||
          (type === 'investidor'
            ? person.tipoInvestidor !== 'mentor'
            : person.tipoInvestidor !== 'anjo')) &&
        (status === 'todos' || person.situacao === status),
    )
    .sort((a, b) =>
      order === 'nome'
        ? a.nome.localeCompare(b.nome, 'pt-BR')
        : order === 'antigos'
          ? a.interessadoEm.localeCompare(b.interessadoEm)
          : b.interessadoEm.localeCompare(a.interessadoEm),
    );
}
