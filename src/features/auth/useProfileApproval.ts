import { useCurrentProfile } from './services/currentProfile';

export function useProfileApproval(knownApproval?: boolean) {
  const profile = useCurrentProfile(knownApproval === undefined);
  return knownApproval ?? profile?.statusModeracao === 'aprovado';
}
