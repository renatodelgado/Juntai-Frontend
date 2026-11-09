export type MeetingStatus = 'agendada' | 'realizada' | 'cancelada' | 'no_show';
export const statusLabels: Record<MeetingStatus, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  no_show: 'Não compareceu',
};
export type MeetingInput = {
  startupId: string;
  dataHoraAgendada: string;
  linkReuniao?: string;
  notas?: string;
};
export type ScheduledMeeting = {
  id: string;
  startupId: string;
  startupNome: string;
  investidorId: string;
  investidorNome: string;
  dataHoraAgendada: string;
  status: MeetingStatus;
  linkReuniao: string | null;
  notas: string | null;
  criadoEm: string;
  date: string;
  time: string;
  title: string;
};
export const dayKey = (date = new Date()) =>
  new Date(date.getTime() - 3 * 3600000).toISOString().slice(0, 10);
export const startTime = (meeting: { date: string; time: string }) =>
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
