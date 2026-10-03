import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  canJoin,
  dayKey,
  hasConflict,
  meetingSummary,
  selectMeetings,
  weekStart,
  type MeetingInput,
} from './model';
import { demoMeetingsRepository } from './repository';
import type { AuthUser } from '@/features/auth/services/session';

const camila: AuthUser = {
  id: 'user-camila',
  nome: 'Camila Torres',
  email: 'camila.investidora.2109@example.com',
  tipoPerfil: 'investidor',
};
const startup: AuthUser = {
  id: 'user-sol',
  nome: 'SolNexo Energia',
  email: 'solnexo.teste.2109@example.com',
  tipoPerfil: 'startup',
};
const input: MeetingInput = {
  participantId: 'solnexo',
  date: '2026-10-02',
  time: '10:00',
  duration: 30,
  format: 'online',
  title: 'Conversa inicial',
  description: '',
  link: '',
  address: '',
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('meeting agenda', () => {
  it('uses Fortaleza dates, Monday weeks and dynamically calculated counters', async () => {
    expect(dayKey(new Date('2026-10-02T01:00:00Z'))).toBe('2026-10-01');
    expect(weekStart('2026-10-04')).toBe('2026-09-28');
    expect(meetingSummary(await demoMeetingsRepository.list(camila))).toEqual({
      upcoming: 1,
      pending: 1,
      completed: 0,
      week: 2,
    });
  });
  it('shows only participating accounts and requires recipient acceptance', async () => {
    const meeting = demoMeetingsRepository.create(camila, input);
    expect(meeting.status).toBe('pending');
    expect(
      (await demoMeetingsRepository.list(startup)).some(
        (item) => item.id === meeting.id,
      ),
    ).toBe(true);
    expect(
      await demoMeetingsRepository.list({
        ...camila,
        id: 'solnexo',
        email: 'unknown@example.com',
      }),
    ).toEqual([]);
    expect(() =>
      demoMeetingsRepository.respond(camila, meeting.id, true),
    ).toThrow();
    expect(
      demoMeetingsRepository.respond(startup, meeting.id, true).status,
    ).toBe('confirmed');
    expect(() =>
      demoMeetingsRepository.cancel(
        { ...camila, email: 'unknown@example.com' },
        meeting.id,
        '',
      ),
    ).toThrow();
  });
  it('rejects past dates, invalid dates, unauthorized participants and overlapping times', () => {
    expect(() =>
      demoMeetingsRepository.create(camila, { ...input, date: '2026-09-30' }),
    ).toThrow();
    expect(() =>
      demoMeetingsRepository.create(camila, { ...input, date: '2027-02-31' }),
    ).toThrow();
    expect(() =>
      demoMeetingsRepository.create(camila, {
        ...input,
        participantId: 'bruno',
      }),
    ).toThrow();
    demoMeetingsRepository.create(camila, input);
    expect(() =>
      demoMeetingsRepository.create(camila, { ...input, time: '10:15' }),
    ).toThrow(/coincide/);
    expect(() =>
      demoMeetingsRepository.create(camila, { ...input, time: '10:30' }),
    ).not.toThrow();
  });
  it('rescheduling requires another confirmation and keeps cancellation history', () => {
    const meeting = demoMeetingsRepository.create(camila, input);
    demoMeetingsRepository.respond(startup, meeting.id, true);
    const changed = demoMeetingsRepository.reschedule(camila, meeting.id, {
      ...input,
      time: '11:00',
    });
    expect(changed.status).toBe('pending');
    expect(changed.awaitingId).toBe('solnexo');
    const cancelled = demoMeetingsRepository.cancel(
      startup,
      meeting.id,
      'Conflito de agenda',
    );
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancellationReason).toBe('Conflito de agenda');
    expect(cancelled.history).toHaveLength(4);
    expect(() =>
      demoMeetingsRepository.reschedule(camila, meeting.id, input),
    ).toThrow();
  });
  it('only enables joining with a valid supplied link near the confirmed time', async () => {
    const meeting = (await demoMeetingsRepository.list(camila)).find(
      (item) => item.status === 'confirmed',
    )!;
    expect(canJoin(meeting)).toBe(false);
    const start = new Date(
      `${meeting.date}T${meeting.time}:00-03:00`,
    ).getTime();
    expect(
      canJoin(
        { ...meeting, link: 'https://example.com/meeting' },
        start - 10 * 60000,
      ),
    ).toBe(true);
    expect(canJoin({ ...meeting, link: 'javascript:alert(1)' }, start)).toBe(
      false,
    );
    expect(
      canJoin(
        { ...meeting, link: 'https://example.com/meeting', status: 'pending' },
        start,
      ),
    ).toBe(false);
    expect(
      canJoin(
        { ...meeting, link: 'https://example.com/meeting' },
        start + 31 * 60000,
      ),
    ).toBe(false);
  });
  it('combines search, period, format and status without changing source data', async () => {
    const items = await demoMeetingsRepository.list(camila);
    const filters = {
      tab: 'pending' as const,
      q: 'AGROPONTE',
      period: 'custom',
      from: '2026-10-02',
      to: '2026-10-02',
      format: 'online',
      sort: 'asc',
    };
    expect(selectMeetings(items, filters)).toHaveLength(1);
    expect(
      selectMeetings(items, { ...filters, from: '2026-10-03' }),
    ).toHaveLength(0);
    expect(hasConflict(items, '2026-10-02', '14:00', 30)).toBe(true);
    expect(items).toHaveLength(2);
  });
  it('migrates old discovery invitations once', async () => {
    localStorage.setItem(
      'juntai:discovery:user-camila',
      JSON.stringify({
        meetings: [
          {
            id: 'old',
            startupId: 'solnexo',
            startupName: 'SolNexo Energia',
            date: input.date,
            time: input.time,
            duration: '30',
            format: 'Videochamada',
            link: '',
            notes: '',
          },
        ],
      }),
    );
    expect(
      (await demoMeetingsRepository.list(camila)).filter(
        (item) => item.id === 'legacy:user-camila:old',
      ),
    ).toHaveLength(1);
    expect(
      (await demoMeetingsRepository.list(camila)).filter(
        (item) => item.id === 'legacy:user-camila:old',
      ),
    ).toHaveLength(1);
  });
});
