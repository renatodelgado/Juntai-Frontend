import type { AuthUser } from '@/features/auth/services/session';
import type { Conversation } from '@/features/messages/model';
import {
  defaultFilters,
  selectStartups,
  type Filters,
  type Startup,
} from '@/features/explore-startups/model';
import type { DiscoveryState } from '@/features/explore-startups/useDiscovery';

export type MatchStatus =
  | 'new'
  | 'viewed'
  | 'sent'
  | 'mutual'
  | 'connected'
  | 'conversation'
  | 'discarded';
export const statusLabels: Record<MatchStatus, string> = {
  new: 'Novo match',
  viewed: 'Match visualizado',
  sent: 'Interesse enviado',
  mutual: 'Interesse mútuo',
  connected: 'Conectado',
  conversation: 'Conversa iniciada',
  discarded: 'Descartado',
};
export const HIGH_COMPATIBILITY = 90;
export type Match = {
  startup: Startup;
  conversation?: Conversation;
  mutualInterest: boolean;
  canMessage: boolean;
};
export interface MatchesRepository {
  list(
    user: AuthUser,
    startups: Startup[],
    connections: Conversation[],
  ): Promise<Match[]>;
}
// Adapter boundary for server-provided recommendations and explicitly authorized connections.
// Compatibility never establishes mutual interest or messaging permission.
export const demoMatchesRepository: MatchesRepository = {
  async list(_user, startups, connections) {
    return startups
      .map((startup) => {
        const conversation = connections.find(
          (chat) =>
            chat.participant.id === startup.id && chat.status === 'active',
        );
        return {
          startup,
          conversation,
          mutualInterest: false,
          canMessage: !!conversation,
        };
      });
  },
};
export function matchStatus(match: Match, state: DiscoveryState): MatchStatus {
  const id = match.startup.id;
  if (state.discarded.includes(id)) return 'discarded';
  if (match.conversation?.messages.length) return 'conversation';
  if (match.canMessage) return 'connected';
  if (match.mutualInterest) return 'mutual';
  if (state.interests.some((interest) => interest.startupId === id))
    return 'sent';
  return state.viewed.includes(id) ? 'viewed' : 'new';
}
export type MatchFilters = Filters & {
  quick: string;
  minimum: string;
  status: string;
};
export const defaultMatchFilters: MatchFilters = {
  ...defaultFilters,
  quick: '',
  minimum: '',
  status: '',
  sort: 'compatibility',
};
export function selectMatches(
  items: Match[],
  filters: MatchFilters,
  state: DiscoveryState,
) {
  const base = selectStartups(
    items.map((match) => match.startup),
    filters,
    state.saved,
  );
  return base
    .map((startup) => items.find((item) => item.startup.id === startup.id)!)
    .filter((match) => {
      const status = matchStatus(match, state);
      if (filters.status ? status !== filters.status : status === 'discarded')
        return false;
      if (
        filters.minimum &&
        (match.startup.compatibility === undefined ||
          match.startup.compatibility < Number(filters.minimum))
      )
        return false;
      if (filters.quick === 'high')
        return (match.startup.compatibility ?? -1) >= HIGH_COMPATIBILITY;
      if (filters.quick === 'new') return status === 'new';
      if (filters.quick === 'mutual') return false;
      if (filters.quick === 'saved')
        return state.saved.includes(match.startup.id);
      return true;
    });
}
export function matchSummary(items: Match[], state: DiscoveryState) {
  return {
    total: items.length,
    high: items.filter(
      (match) => (match.startup.compatibility ?? -1) >= HIGH_COMPATIBILITY,
    ).length,
    started: items.filter(
      (match) =>
        match.canMessage ||
        match.mutualInterest ||
        state.interests.some(
          (interest) => interest.startupId === match.startup.id,
        ),
    ).length,
  };
}
