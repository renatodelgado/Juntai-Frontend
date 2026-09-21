import { z } from 'zod';
import * as catalogs from '../data/catalogs';

const choice = (options: readonly catalogs.Option[]) =>
  z
    .string()
    .refine(
      (value) =>
        value === '' || options.some((option) => option.value === value),
    );
const choices = (options: readonly catalogs.Option[]) =>
  z.array(
    z
      .string()
      .refine((value) => options.some((option) => option.value === value)),
  );
const text = z.string().max(10000);
const number = z.number().finite().nullable();

export const memberSchema = z.object({
  id: z.string(),
  name: text,
  role: text,
  bio: text,
  linkedin: text,
});
export const canvasSchema = z.object({
  value: text,
  customers: text,
  channels: text,
  relationships: text,
  revenue: text,
  resources: text,
  activities: text,
  partners: text,
  costs: text,
});

// O rascunho aceita campos vazios. A validação de avanço fica em validation.ts.
export const draftSchema = z.object({
  logo: z
    .string()
    .max(2800000)
    .refine(
      (value) =>
        !value ||
        /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
    )
    .default(''),
  ownerName: text.default(''),
  registrationRegion: text.default(''),
  primaryModel: text.default(''),
  monthlyRevenue: number.default(null),
  exactTeamSize: number.default(null),
  name: text,
  publicName: text,
  description: text,
  website: text,
  linkedin: text,
  instagram: text,
  otherLinks: z.array(z.object({ id: z.string(), url: text })),
  segment: choice(catalogs.segments),
  secondarySegments: choices(catalogs.segments),
  stage: choice(catalogs.stages),
  businessModels: choices(catalogs.businessModels),
  targetMarket: text,
  problem: text,
  solution: text,
  state: choice(catalogs.states),
  cityId: z.string(),
  cityName: text,
  operatingRegions: z.preprocess(
    catalogs.migrateRegionValues,
    choices(catalogs.regions),
  ),
  targetRegions: z.preprocess(
    catalogs.migrateRegionValues,
    choices(catalogs.regions),
  ),
  customers: number,
  hideCustomers: z.boolean(),
  revenue: choice([
    ...catalogs.revenueRanges,
    { value: 'undisclosed', label: '' },
  ]),
  growthPeriod: choice([
    { value: 'monthly', label: '' },
    { value: 'yearly', label: '' },
  ]),
  growthMetric: choice([
    { value: 'revenue', label: '' },
    { value: 'customers', label: '' },
  ]),
  growthPercent: number,
  growthNotes: text,
  teamSize: choice(catalogs.teamSizes),
  seekingInvestment: choice(catalogs.seekingInvestment),
  capital: number,
  investmentPurposes: choices(catalogs.investmentPurposes),
  needs: choices(catalogs.needs),
  partnerType: choice(catalogs.partnerTypes),
  expertise: choices(catalogs.expertise),
  partnerRegions: z.preprocess(
    catalogs.migrateRegionValues,
    choices(catalogs.regions),
  ),
  partnerStages: choices(catalogs.stages),
  preferences: text,
  pitchText: text,
  videoUrl: text,
  canvas: canvasSchema,
  members: z.array(memberSchema),
  termsAccepted: z.boolean(),
  privacyAcknowledged: z.boolean(),
  matchingConsent: z.boolean(),
});

export type StartupDraft = z.infer<typeof draftSchema>;
export type TeamMember = z.infer<typeof memberSchema>;
export type Canvas = z.infer<typeof canvasSchema>;
export type FieldName = keyof StartupDraft;
export type Errors = Partial<
  Record<FieldName | `member-${string}` | 'attachment', string>
>;
export type RegistrationStatus =
  'draft' | 'in_review' | 'approved' | 'changes_requested' | 'rejected';

export function createDraft(): StartupDraft {
  return {
    ownerName: '',
    registrationRegion: '',
    primaryModel: '',
    monthlyRevenue: null,
    exactTeamSize: null,
    logo: '',
    name: '',
    publicName: '',
    description: '',
    website: '',
    linkedin: '',
    instagram: '',
    otherLinks: [],
    segment: '',
    secondarySegments: [],
    stage: '',
    businessModels: [],
    targetMarket: '',
    problem: '',
    solution: '',
    state: '',
    cityId: '',
    cityName: '',
    operatingRegions: [],
    targetRegions: [],
    customers: null,
    hideCustomers: false,
    revenue: '',
    growthPeriod: '',
    growthMetric: '',
    growthPercent: null,
    growthNotes: '',
    teamSize: '',
    seekingInvestment: 'yes',
    capital: null,
    investmentPurposes: [],
    needs: [],
    partnerType: '',
    expertise: [],
    partnerRegions: [],
    partnerStages: [],
    preferences: '',
    pitchText: '',
    videoUrl: '',
    canvas: {
      value: '',
      customers: '',
      channels: '',
      relationships: '',
      revenue: '',
      resources: '',
      activities: '',
      partners: '',
      costs: '',
    },
    members: [],
    termsAccepted: false,
    privacyAcknowledged: false,
    matchingConsent: false,
  };
}

// Contrato de eventos futuro; não emite eventos nem calcula compatibilidade.
export type ConnectionEventType =
  | 'investor_viewed'
  | 'interest_expressed'
  | 'connection_accepted'
  | 'meeting_scheduled'
  | 'meeting_held'
  | 'proposal_sent'
  | 'investment_completed';
export interface ConnectionEvent {
  id: string;
  startupId: string;
  investorId: string;
  actorUserId: string;
  type: ConnectionEventType;
  occurredAt: string;
}
