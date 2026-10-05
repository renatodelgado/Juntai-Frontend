import type { StartupDraft } from '@/features/startup-onboarding/model/types';
import type { InvestorDraft } from '@/features/investor-onboarding/model/investor';
import { investmentPurposes } from '@/features/startup-onboarding/data/catalogs';
import { normalizeUrl } from '@/features/startup-onboarding/model/validation';
import {
  registrationSegments as segments,
  registrationModels as models,
  registrationRegions as regions,
  registrationGrowthPeriods as periods,
  registrationNeeds as needs,
  registrationHelpAreas as help,
} from '@/shared/config/registrationCatalogs';

const stages: Record<string, string> = {
  ideation: 'ideacao',
  validation: 'validacao',
  mvp: 'mvp',
  early_traction: 'tracao',
  growth: 'crescimento',
  scale: 'escala',
};
function mapped(value: string, catalog: Record<string, string>) {
  if (!value) return null;
  if (!Object.hasOwn(catalog, value))
    throw new Error(`A opção “${value}” não é aceita pelo servidor.`);
  return catalog[value]!;
}
const options = (values: string[], catalog: Record<string, string>) => [
  ...new Set(values.map((v) => mapped(v, catalog))),
];
const text = (v: string) => v.trim() || null;
const url = (v: string) => (v.trim() ? normalizeUrl(v) : null);
export function startupUpdatePayload(d: StartupDraft): Record<string, unknown> {
  return {
    nomeFantasia: d.name.trim(),
    logoUrl: text(d.logoUrl),
    descricaoCurta: text(d.description),
    siteUrl: url(d.website),
    linksSociais: {
      linkedin: url(d.linkedin) ?? undefined,
      instagram: url(d.instagram) ?? undefined,
      outros: d.otherLinks.filter((l) => l.url.trim()).map((l) => url(l.url)),
    },
    videoApresentacaoUrl: url(d.videoUrl),
    segmento: mapped(d.segment, segments),
    segmentosSecundarios: options(d.secondarySegments, segments),
    estagio: mapped(d.stage, stages),
    modeloNegocio: mapped(d.primaryModel || d.businessModels[0] || '', models),
    estado: text(d.state),
    cidade: text(d.cityName),
    regioesAtuacao: options(d.operatingRegions, regions),
    regioesCrescimento: options(d.targetRegions, regions),
    mercadoAlvo: text(d.targetMarket),
    metricaCrescimento: mapped(d.growthMetric, {
      revenue: 'receita',
      customers: 'clientes',
      both: 'clientes_e_receita',
    }),
    periodoComparacaoCrescimento: mapped(d.growthPeriod, periods),
    taxaCrescimentoPct: d.growthPercent,
    descricaoEvolucao: text(d.growthNotes),
    numeroClientes: d.customers,
    faturamentoMensal: d.monthlyRevenue,
    tamanhoEquipe: d.exactTeamSize,
    capitalProcurado: d.capital,
    finalidadeInvestimento: d.investmentPurposes
      .map((v) => investmentPurposes.find((o) => o.value === v)?.label ?? v)
      .join('; '),
    necessidadesAdicionais: options(d.needs, needs),
    descricaoPitch: text(d.pitchText),
    canvasJson: {
      ...d.canvas,
      problema: d.problem.trim(),
      solucao: d.solution.trim(),
    },
  };
}
export function investorUpdatePayload(
  d: InvestorDraft,
): Record<string, unknown> {
  return {
    nome: d.name.trim(),
    tituloProfissional: text(d.title),
    linkedinUrl: url(d.linkedin),
    bio: text(d.bio),
    estado: text(d.state),
    cidade: text(d.cityName),
    tipoInvestidor: mapped(d.participation, {
      investor: 'anjo',
      mentor: 'mentor',
      both: 'anjo_mentor',
    }),
    areasAjuda: options(d.expertise, help),
    disponibilidade: text(d.availability),
    jaAtuouComStartups: d.history === 'yes',
    numeroAproximadoInvestimentos: d.exactInvestmentCount,
    descricaoExperiencia: text(d.experience),
    setoresAtuacao: options(d.previousSectors, segments),
    anosExperiencia: d.experienceYears,
    ticketMinimo: d.ticketMin,
    ticketMaximo: d.ticketMax,
    perfilRisco: mapped(d.risk, {
      conservative: 'conservador',
      moderate: 'moderado',
      bold: 'arrojado',
    }),
    segmentosInteresse: options(d.segments, segments),
    estagiosInteresse: options(d.stages, stages),
    regioesInteresse: options(d.regions, regions),
    modelosInteresse: options(d.businessModels, models),
  };
}
export function changedFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  return Object.fromEntries(
    Object.entries(after).filter(
      ([k, v]) => JSON.stringify(v) !== JSON.stringify(before[k]),
    ),
  );
}
