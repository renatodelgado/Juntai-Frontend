import { describe, expect, it } from 'vitest';
import {
  demoStartups,
  withCompatibility,
  demoPreferences,
} from '@/features/explore-startups/model';
import { demoMessagesRepository } from '@/features/messages/model';
import type { AuthUser } from '@/features/auth/services/session';
import type { DiscoveryState } from '@/features/explore-startups/useDiscovery';
import {
  defaultMatchFilters,
  demoMatchesRepository,
  matchStatus,
  matchSummary,
  selectMatches,
  type Match,
} from './model';

const user: AuthUser = {
  id: 'camila',
  nome: 'Camila Torres',
  email: 'camila.investidora.2109@example.com',
  tipoPerfil: 'investidor',
};
const state: DiscoveryState = {
  saved: [],
  interests: [],
  meetings: [],
  viewed: [],
  discarded: [],
};
const matches: Match[] = demoStartups.map((startup) => ({
  startup: withCompatibility(startup, demoPreferences(user)),
  canMessage: false,
  mutualInterest: false,
}));
describe('investor matches', () => {
  it('never derives mutual interest or messaging permissions from compatibility', () => {
    expect(matches[0]?.startup.compatibility).toBe(100);
    expect(matchStatus(matches[0]!, state)).toBe('new');
    expect(
      selectMatches(
        matches,
        { ...defaultMatchFilters, quick: 'mutual' },
        state,
      ),
    ).toEqual([]);
  });
  it('distinguishes sent, mutual, connected, conversation and discarded', async () => {
    const sent = {
      ...state,
      interests: [{ startupId: 'solnexo', createdAt: '2026-10-01T10:00:00Z' }],
    };
    expect(matchStatus(matches[0]!, sent)).toBe('sent');
    expect(matchStatus({ ...matches[0]!, mutualInterest: true }, sent)).toBe(
      'mutual',
    );
    expect(matchStatus({ ...matches[0]!, canMessage: true }, sent)).toBe(
      'connected',
    );
    const chats = await demoMessagesRepository.list(user);
    const connected = {
      ...matches[0]!,
      canMessage: true,
      conversation: chats[0],
    };
    expect(matchStatus(connected, sent)).toBe('conversation');
    expect(matchStatus(connected, { ...sent, discarded: ['solnexo'] })).toBe(
      'discarded',
    );
    expect(matchStatus(matches[0]!, { ...state, viewed: ['solnexo'] })).toBe(
      'viewed',
    );
  });
  it('combines search, filters, minimum score and saved selection', () => {
    expect(
      selectMatches(
        matches,
        { ...defaultMatchFilters, q: 'ENERGIA', minimum: '90', location: 'CE' },
        state,
      ).map((item) => item.startup.id),
    ).toEqual(['solnexo']);
    expect(
      selectMatches(
        matches,
        { ...defaultMatchFilters, quick: 'high', segment: 'Agronegócio' },
        state,
      ),
    ).toEqual([]);
    expect(
      selectMatches(
        matches,
        { ...defaultMatchFilters, quick: 'saved' },
        { ...state, saved: ['agroponte'] },
      )[0]?.startup.id,
    ).toBe('agroponte');
  });
  it('keeps unknown scores available until a score threshold is requested', () => {
    const item = {
      ...matches[0]!,
      startup: { ...matches[0]!.startup, compatibility: undefined },
    };
    expect(selectMatches([item], defaultMatchFilters, state)).toHaveLength(1);
    expect(
      selectMatches([item], { ...defaultMatchFilters, minimum: '50' }, state),
    ).toHaveLength(0);
  });
  it('hides discarded recommendations by default while allowing recovery', () => {
    const discarded = { ...state, discarded: ['solnexo'] };
    expect(
      selectMatches(matches, defaultMatchFilters, discarded).map(
        (match) => match.startup.id,
      ),
    ).toEqual(['agroponte']);
    expect(
      selectMatches(
        matches,
        { ...defaultMatchFilters, status: 'discarded' },
        discarded,
      )[0]?.startup.id,
    ).toBe('solnexo');
  });
  it('uses coherent filtered counters and explicit recommendation membership', async () => {
    const data = await demoMatchesRepository.list(
      user,
      matches.map((match) => match.startup),
      await demoMessagesRepository.list(user),
    );
    expect(matchSummary(data, state)).toEqual({
      total: 2,
      high: 1,
      started: 2,
    });
    const high = selectMatches(
      data,
      { ...defaultMatchFilters, quick: 'high' },
      state,
    );
    expect(matchSummary(high, state)).toEqual({
      total: 1,
      high: 1,
      started: 1,
    });
    expect(
      await demoMatchesRepository.list(
        { ...user, email: 'new@example.com' },
        demoStartups,
        [],
      ),
    ).toHaveLength(2);
  });
});
