import type { StartupDraft } from '@/features/startup-onboarding/model/types';
import type { StepId } from '@/features/startup-onboarding/data/steps';

export function profileCompleteness(
  data: StartupDraft,
  attachment: File | null,
) {
  const sections: { label: string; step: StepId; filled: boolean }[] = [
    { label: 'Apresentação', step: 'about', filled: !!data.description.trim() },
    {
      label: 'Negócio',
      step: 'business',
      filled: !!data.segment && !!data.stage,
    },
    {
      label: 'Mercado',
      step: 'market',
      filled: !!data.targetMarket && !!data.solution,
    },
    {
      label: 'Localização',
      step: 'location',
      filled: !!data.cityId && !!data.registrationRegion,
    },
    {
      label: 'Tração',
      step: 'traction',
      filled: data.customers !== null || data.hideCustomers || !!data.revenue,
    },
    { label: 'Necessidades', step: 'investment', filled: !!data.needs.length },
    { label: 'Parceiros', step: 'investment', filled: !!data.partnerType },
    {
      label: 'Pitch',
      step: 'pitch',
      filled: !!data.pitchText.trim() || !!attachment || !!data.videoUrl,
    },
    {
      label: 'Canvas',
      step: 'pitch',
      filled: Object.values(data.canvas).every((text) => !!text.trim()),
    },
    {
      label: 'Equipe',
      step: 'traction',
      filled: data.exactTeamSize !== null,
    },
  ];
  return {
    percent: Math.round(
      (sections.filter((section) => section.filled).length / sections.length) *
        100,
    ),
    missing: sections.filter((section) => !section.filled),
  };
}

export function safeLink(value: string) {
  if (!value.trim()) return null;
  try {
    const url = new URL(value.includes(':') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
