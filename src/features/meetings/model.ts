export type MeetingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export const roleLabels = {
  startup: 'Startup',
  investor: 'Investidor',
  mentor: 'Mentor',
};
export type MeetingFormat = 'online' | 'presential' | 'phone';
export type Participant = {
  id: string;
  name: string;
  role: 'startup' | 'investor' | 'mentor';
  company?: string;
};
export type MeetingInput = {
  participantId: string;
  date: string;
  time: string;
  duration: number;
  format: MeetingFormat;
  title: string;
  description: string;
  link: string;
  address: string;
};
export type ScheduledMeeting = Omit<MeetingInput, 'participantId'> & {
  id: string;
  participants: Participant[];
  organizerId: string;
  awaitingId?: string;
  status: MeetingStatus;
  cancellationReason?: string;
  history: { date: string; text: string }[];
};
export const statusLabels: Record<MeetingStatus, string> = {
  confirmed: 'Confirmada',
  pending: 'Aguardando confirmação',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};
export const formatLabels: Record<MeetingFormat, string> = {
  online: 'Online',
  presential: 'Presencial',
  phone: 'Telefone',
};
export const dayKey = (date = new Date()) =>
  new Date(date.getTime() - 3 * 3600000).toISOString().slice(0, 10);
export const startTime = (meeting: Pick<ScheduledMeeting, 'date' | 'time'>) =>
  new Date(`${meeting.date}T${meeting.time}:00-03:00`).getTime();
export const dayLabel = (day: string) =>
  new Date(`${day}T12:00:00-03:00`).toLocaleDateString('pt-BR', {
    timeZone: 'America/Fortaleza',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
export function addDays(day: string, count: number) {
  const date = new Date(`${day}T12:00:00-03:00`);
  date.setUTCDate(date.getUTCDate() + count);
  return dayKey(date);
}
export function weekStart(day: string) {
  const weekday = new Date(`${day}T12:00:00-03:00`).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}
export function validLink(link: string) {
  try {
    return ['http:', 'https:'].includes(new URL(link).protocol);
  } catch {
    return false;
  }
}
export function canJoin(meeting: ScheduledMeeting, now = Date.now()) {
  const start = startTime(meeting);
  return (
    meeting.status === 'confirmed' &&
    meeting.format === 'online' &&
    validLink(meeting.link) &&
    now >= start - 15 * 60000 &&
    now < start + meeting.duration * 60000
  );
}
export function effectiveStatus(
  meeting: ScheduledMeeting,
  now = Date.now(),
): MeetingStatus {
  return meeting.status === 'confirmed' &&
    startTime(meeting) + meeting.duration * 60000 <= now
    ? 'completed'
    : meeting.status;
}
export function hasConflict(
  items: ScheduledMeeting[],
  date: string,
  time: string,
  duration: number,
  except?: string,
) {
  const start = startTime({ date, time });
  return items.some(
    (meeting) =>
      meeting.id !== except &&
      ['pending', 'confirmed'].includes(effectiveStatus(meeting)) &&
      start < startTime(meeting) + meeting.duration * 60000 &&
      start + duration * 60000 > startTime(meeting),
  );
}
export type MeetingFilters = {
  tab: MeetingStatus;
  q: string;
  period: string;
  from: string;
  to: string;
  format: string;
  sort: string;
};
export function selectMeetings(
  items: ScheduledMeeting[],
  filters: MeetingFilters,
  now = Date.now(),
) {
  const today = dayKey(new Date(now));
  const week = weekStart(today);
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  return items
    .filter((meeting) => {
      const status = effectiveStatus(meeting, now);
      if (
        status !== filters.tab ||
        (status === 'confirmed' &&
          startTime(meeting) + meeting.duration * 60000 <= now)
      )
        return false;
      if (
        !normalize(
          meeting.participants
            .map((person) => `${person.name} ${person.company ?? ''}`)
            .join(' '),
        ).includes(normalize(filters.q.trim()))
      )
        return false;
      if (filters.format && meeting.format !== filters.format) return false;
      if (filters.period === 'today' && meeting.date !== today) return false;
      if (
        filters.period === 'week' &&
        (meeting.date < week || meeting.date > addDays(week, 6))
      )
        return false;
      if (
        filters.period === 'month' &&
        meeting.date.slice(0, 7) !== today.slice(0, 7)
      )
        return false;
      if (
        filters.period === 'custom' &&
        ((filters.from && meeting.date < filters.from) ||
          (filters.to && meeting.date > filters.to))
      )
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        (startTime(a) - startTime(b)) * (filters.sort === 'desc' ? -1 : 1),
    );
}
export function meetingSummary(items: ScheduledMeeting[], now = Date.now()) {
  const week = weekStart(dayKey(new Date(now)));
  return {
    upcoming: items.filter(
      (item) =>
        effectiveStatus(item, now) === 'confirmed' && startTime(item) >= now,
    ).length,
    pending: items.filter((item) => effectiveStatus(item, now) === 'pending')
      .length,
    completed: items.filter(
      (item) => effectiveStatus(item, now) === 'completed',
    ).length,
    week: items.filter(
      (item) =>
        ['pending', 'confirmed'].includes(effectiveStatus(item, now)) &&
        item.date >= week &&
        item.date <= addDays(week, 6),
    ).length,
  };
}
