import { describe, expect, it } from 'vitest';
import {
  defaultFilters,
  demoPreferences,
  demoStartups,
  selectStartups,
  withCompatibility,
} from './model';
import type { AuthUser } from '@/features/auth/services/session';

const camila: AuthUser = {
  id: 'camila',
  nome: 'Camila Torres',
  email: 'camila.investidora.2109@example.com',
  tipoPerfil: 'investidor',
};
describe('startup discovery', () => {
  it('computes an explained, deterministic demo compatibility', () => {
    const preferences = demoPreferences(camila);
    expect(withCompatibility(demoStartups[0]!, preferences).compatibility).toBe(
      100,
    );
    expect(withCompatibility(demoStartups[1]!, preferences).compatibility).toBe(
      85,
    );
    expect(
      withCompatibility(demoStartups[1]!, preferences).compatibilityFactors,
    ).toHaveLength(3);
    expect(withCompatibility(demoStartups[0]!).compatibility).toBeUndefined();
    expect(
      withCompatibility(demoStartups[0]!, { ...preferences!, regions: [] })
        .compatibility,
    ).toBeUndefined();
  });
  it('combines accent-insensitive search with filters and saved selection', () => {
    expect(
      selectStartups(
        demoStartups,
        { ...defaultFilters, q: 'energia', segment: 'Agronegócio' },
        [],
      ),
    ).toHaveLength(0);
    expect(
      selectStartups(
        demoStartups,
        {
          ...defaultFilters,
          q: 'AGRICULTURA',
          model: 'Marketplace',
          location: 'recife',
        },
        [],
      ).map((s) => s.id),
    ).toEqual(['agroponte']);
    expect(
      selectStartups(demoStartups, { ...defaultFilters, saved: 'yes' }, [
        'solnexo',
      ]).map((s) => s.id),
    ).toEqual(['solnexo']);
  });
  it('keeps undisclosed amounts visible and distinguishes unknown investment status', () => {
    expect(
      selectStartups(
        demoStartups,
        { ...defaultFilters, min: '500000', max: '1000000' },
        [],
      ),
    ).toHaveLength(2);
    expect(
      selectStartups(demoStartups, { ...defaultFilters, investment: 'no' }, []),
    ).toHaveLength(0);
    const records = [
      { ...demoStartups[0]!, investmentAmount: 50000 },
      { ...demoStartups[1]!, investmentAmount: 700000 },
    ];
    expect(
      selectStartups(
        records,
        { ...defaultFilters, min: '500000', max: '1000000' },
        [],
      ).map((s) => s.id),
    ).toEqual(['agroponte']);
  });
  it('sorts by recency, name and investment without mutating source records', () => {
    expect(
      selectStartups(demoStartups, { ...defaultFilters, sort: 'recent' }, [])[0]
        ?.id,
    ).toBe('agroponte');
    expect(
      selectStartups(demoStartups, { ...defaultFilters, sort: 'name' }, [])[0]
        ?.id,
    ).toBe('agroponte');
    expect(
      selectStartups(
        demoStartups,
        { ...defaultFilters, sort: 'investment' },
        [],
      )[0]?.id,
    ).toBe('solnexo');
    expect(demoStartups[0]?.id).toBe('solnexo');
  });
});
