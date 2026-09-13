import type { StartupDraft, RegistrationStatus } from './types';
import { normalizeUrl } from './validation';

export const LEGAL_VERSION = 'preview-2026-09-13';
export const LEGAL_DOCUMENTS_APPROVED = false;

export function buildSubmission(
  data: StartupDraft,
  userId: string | null,
  acceptedAt: string,
  attachment: File | null,
) {
  return {
    schemaVersion: 1,
    status: 'draft' as RegistrationStatus,
    startup: {
      name: data.name.trim(),
      publicName: data.publicName.trim() || null,
      description: data.description.trim(),
      website: normalizeUrl(data.website) || null,
      channels: [
        { platform: 'linkedin', url: normalizeUrl(data.linkedin) },
        { platform: 'instagram', url: normalizeUrl(data.instagram) },
        ...data.otherLinks.map((link) => ({
          platform: 'other',
          url: normalizeUrl(link.url),
        })),
      ].filter((link) => link.url),
      segment: data.segment,
      secondarySegments: data.secondarySegments,
      stage: data.stage,
      businessModels: data.businessModels,
      targetMarket: data.targetMarket.trim(),
      problem: data.problem.trim(),
      solution: data.solution.trim(),
      location: {
        state: data.state,
        cityId: data.cityId,
        cityName: data.cityName,
      },
      operatingRegions: data.operatingRegions,
      targetRegions: data.targetRegions,
      traction: {
        customers: data.hideCustomers ? null : data.customers,
        customersDisclosure: data.hideCustomers ? 'undisclosed' : 'provided',
        revenueRange: data.revenue,
        teamSize: data.teamSize,
        growth:
          data.growthPercent === null
            ? null
            : {
                percent: data.growthPercent,
                period: data.growthPeriod,
                metric: data.growthMetric,
              },
        growthNotes: data.growthNotes.trim(),
      },
      investment: {
        seeking: data.seekingInvestment,
        capitalBRL: data.seekingInvestment === 'yes' ? data.capital : null,
        purposes:
          data.seekingInvestment === 'yes' ? data.investmentPurposes : [],
        needs: data.needs,
      },
      partnerPreferences: {
        type: data.partnerType,
        expertise: data.expertise,
        regions: data.partnerRegions,
        stages: data.partnerType === 'mentor' ? [] : data.partnerStages,
        additional: data.preferences.trim(),
      },
    },
    pitch: {
      text: data.pitchText.trim(),
      videoUrl: normalizeUrl(data.videoUrl) || null,
      presentation: attachment
        ? {
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
          }
        : null,
    },
    canvas: { ...data.canvas },
    members: data.members.map((member) => ({
      ...member,
      name: member.name.trim(),
      role: member.role.trim(),
      bio: member.bio.trim(),
      linkedin: normalizeUrl(member.linkedin) || null,
    })),
    consents: [
      { purpose: 'terms', accepted: data.termsAccepted },
      {
        purpose: 'privacy_acknowledgement',
        accepted: data.privacyAcknowledged,
      },
      { purpose: 'matchmaking', accepted: data.matchingConsent },
    ].map((consent) => ({
      ...consent,
      version: LEGAL_VERSION,
      recordedAt: acceptedAt,
      userId,
    })),
  };
}

export type StartupSubmission = ReturnType<typeof buildSubmission>;

// Implementar esse contrato quando existirem autenticação e endpoints reais.
// O backend atribui status, IDs, usuário autenticado e horário oficial de aceite.
export interface StartupRegistrationGateway {
  submit(
    profile: StartupSubmission,
    attachment: File | null,
    signal?: AbortSignal,
  ): Promise<{ startupId: string; status: RegistrationStatus }>;
}
