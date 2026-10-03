import type { AuthUser } from '@/features/auth/services/session';
import {
  addDays,
  dayKey,
  effectiveStatus,
  hasConflict,
  startTime,
  validLink,
  type MeetingInput,
  type Participant,
  type ScheduledMeeting,
} from './model';

const accounts: (Participant & { email: string })[] = [
  {
    id: 'solnexo',
    name: 'SolNexo Energia',
    role: 'startup',
    company: 'SolNexo Energia',
    email: 'solnexo.teste.2109@example.com',
  },
  {
    id: 'agroponte',
    name: 'AgroPonte Digital',
    role: 'startup',
    company: 'AgroPonte Digital',
    email: 'agroponte.teste.2109@example.com',
  },
  {
    id: 'camila',
    name: 'Camila Torres',
    role: 'investor',
    email: 'camila.investidora.2109@example.com',
  },
  {
    id: 'bruno',
    name: 'Bruno Almeida',
    role: 'mentor',
    email: 'bruno.investidor.2109@example.com',
  },
];
export function meetingAccount(user: AuthUser): Participant {
  const account = accounts.find(
    (item) =>
      item.email === user.email.toLowerCase() &&
      (item.role === 'startup' ? 'startup' : 'investidor') === user.tipoPerfil,
  );
  return account
    ? {
        id: account.id,
        name: account.name,
        role: account.role,
        company: account.company,
      }
    : {
        id: `user:${user.id}`,
        name: user.nome,
        role: user.tipoPerfil === 'startup' ? 'startup' : 'investor',
      };
}
export function meetingConnections(user: AuthUser): Participant[] {
  const person = meetingAccount(user);
  if (!accounts.some((item) => item.id === person.id)) return [];
  return accounts
    .filter((item) => (item.role === 'startup') !== (person.role === 'startup'))
    .map(({ id, name, role, company }) => ({ id, name, role, company }));
}
const key = 'juntai:meetings:v1';
function seed(): ScheduledMeeting[] {
  const today = dayKey();
  const upcoming = new Date(Date.now() + 20 * 60000);
  const time = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    hour: '2-digit',
    minute: '2-digit',
  }).format(upcoming);
  return [
    {
      first: 0,
      second: 2,
      status: 'confirmed' as const,
      date: dayKey(upcoming),
      time,
      title: 'Conhecer a SolNexo',
      format: 'online' as const,
    },
    {
      first: 1,
      second: 2,
      status: 'pending' as const,
      date: addDays(today, 1),
      time: '14:00',
      title: 'Parcerias para o agronegócio',
      format: 'online' as const,
    },
    {
      first: 0,
      second: 3,
      status: 'completed' as const,
      date: addDays(today, -2),
      time: '10:00',
      title: 'Mentoria de expansão comercial',
      format: 'online' as const,
    },
    {
      first: 1,
      second: 3,
      status: 'cancelled' as const,
      date: addDays(today, 3),
      time: '15:00',
      title: 'Apresentação da AgroPonte',
      format: 'presential' as const,
    },
  ].map((item, index) => ({
    id: `demo-meeting-${index}`,
    participants: [accounts[item.first]!, accounts[item.second]!].map(
      ({ id, name, role, company }) => ({ id, name, role, company }),
    ),
    organizerId: accounts[item.first]!.id,
    awaitingId:
      item.status === 'pending' ? accounts[item.second]!.id : undefined,
    status: item.status,
    date: item.date,
    time: item.time,
    duration: 30,
    format: item.format,
    title: item.title,
    description: '',
    link: '',
    address: '',
    cancellationReason:
      item.status === 'cancelled'
        ? 'Conflito de agenda do participante.'
        : undefined,
    history: [
      {
        date: new Date().toISOString(),
        text: 'Compromisso demonstrativo disponibilizado.',
      },
    ],
  }));
}
function read(): ScheduledMeeting[] {
  const raw = localStorage.getItem(key);
  if (!raw) {
    const items = seed();
    localStorage.setItem(key, JSON.stringify(items));
    return items;
  }
  const items = JSON.parse(raw) as ScheduledMeeting[];
  if (
    !Array.isArray(items) ||
    items.some(
      (item) =>
        !Array.isArray(item.participants) || !Array.isArray(item.history),
    )
  )
    throw new Error('Não foi possível carregar a agenda.');
  return items;
}
function write(items: ScheduledMeeting[]) {
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event('juntai:meetings-change'));
}
function permitted(user: AuthUser, meeting: ScheduledMeeting) {
  return meeting.participants.some(
    (person) => person.id === meetingAccount(user).id,
  );
}
function validate(
  user: AuthUser,
  input: MeetingInput,
  items: ScheduledMeeting[],
  except?: string,
) {
  if (
    !meetingConnections(user).some(
      (person) => person.id === input.participantId,
    )
  )
    throw new Error('Selecione uma conexão autorizada.');
  if (
    !input.title.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time) ||
    !Number.isFinite(startTime(input)) ||
    startTime(input) <= Date.now() ||
    dayKey(new Date(startTime(input))) !== input.date
  )
    throw new Error('Informe o assunto, uma data e um horário futuros.');
  if (![15, 30, 45, 60].includes(input.duration))
    throw new Error('Escolha uma duração válida.');
  if (!['online', 'presential', 'phone'].includes(input.format))
    throw new Error('Escolha um formato válido.');
  if (input.link && !validLink(input.link))
    throw new Error('Informe um link válido com http ou https.');
  const participantIds = [meetingAccount(user).id, input.participantId];
  if (
    hasConflict(
      items.filter((meeting) =>
        meeting.participants.some((person) =>
          participantIds.includes(person.id),
        ),
      ),
      input.date,
      input.time,
      input.duration,
      except,
    )
  )
    throw new Error(
      'Este horário coincide com outro compromisso. Escolha outro horário.',
    );
}
export interface MeetingsRepository {
  list(user: AuthUser): Promise<ScheduledMeeting[]>;
  create(user: AuthUser, input: MeetingInput): ScheduledMeeting;
  reschedule(user: AuthUser, id: string, input: MeetingInput): ScheduledMeeting;
  respond(user: AuthUser, id: string, accept: boolean): ScheduledMeeting;
  cancel(user: AuthUser, id: string, reason: string): ScheduledMeeting;
}
// Isolated local adapter. Real APIs must enforce authorization and availability server-side.
export const demoMeetingsRepository: MeetingsRepository = {
  async list(user) {
    let items = read();
    const legacy = JSON.parse(
      localStorage.getItem(`juntai:discovery:${user.id}`) || 'null',
    ) as {
      meetings?: {
        id: string;
        startupId: string;
        startupName: string;
        date: string;
        time: string;
        duration: string;
        format: string;
        link: string;
        notes: string;
      }[];
    } | null;
    if (Array.isArray(legacy?.meetings)) {
      const self = meetingAccount(user);
      const connections = meetingConnections(user);
      const imported = legacy.meetings
        .filter(
          (invite) =>
            !items.some(
              (item) => item.id === `legacy:${user.id}:${invite.id}`,
            ) && connections.some((person) => person.id === invite.startupId),
        )
        .map((invite): ScheduledMeeting => ({
          id: `legacy:${user.id}:${invite.id}`,
          participants: [
            self,
            connections.find((person) => person.id === invite.startupId)!,
          ],
          organizerId: self.id,
          awaitingId: invite.startupId,
          status: 'pending',
          date: invite.date,
          time: invite.time,
          duration: Number(invite.duration),
          format:
            invite.format === 'Presencial'
              ? 'presential'
              : invite.format === 'Telefone'
                ? 'phone'
                : 'online',
          title: `Conversa com ${invite.startupName}`,
          description: invite.notes,
          link: validLink(invite.link) ? invite.link : '',
          address: '',
          history: [
            {
              date: new Date().toISOString(),
              text: 'Convite existente importado da exploração.',
            },
          ],
        }));
      if (imported.length) {
        items = [...items, ...imported];
        write(items);
      }
    }
    return items
      .filter((meeting) => permitted(user, meeting))
      .map((meeting) => ({ ...meeting, status: effectiveStatus(meeting) }));
  },
  create(user, input) {
    const items = read();
    validate(user, input, items);
    const self = meetingAccount(user);
    const other = meetingConnections(user).find(
      (person) => person.id === input.participantId,
    )!;
    const { participantId: _, ...details } = input;
    void _;
    const meeting: ScheduledMeeting = {
      ...details,
      id: crypto.randomUUID(),
      participants: [self, other],
      organizerId: self.id,
      awaitingId: other.id,
      status: 'pending',
      history: [
        {
          date: new Date().toISOString(),
          text: 'Convite enviado; aguardando confirmação.',
        },
      ],
    };
    write([...items, meeting]);
    return meeting;
  },
  reschedule(user, id, input) {
    const items = read();
    const current = items.find(
      (item) => item.id === id && permitted(user, item),
    );
    if (
      !current ||
      !['pending', 'confirmed'].includes(effectiveStatus(current))
    )
      throw new Error(
        'Este compromisso está disponível somente para consulta.',
      );
    const self = meetingAccount(user);
    const other = current.participants.find((person) => person.id !== self.id)!;
    if (input.participantId !== other.id)
      throw new Error('O participante não pode ser alterado.');
    validate(user, input, items, id);
    const { participantId: _, ...details } = input;
    void _;
    const next = {
      ...current,
      ...details,
      organizerId: self.id,
      awaitingId: other.id,
      status: 'pending' as const,
      history: [
        ...current.history,
        {
          date: new Date().toISOString(),
          text: `Reagendamento solicitado: ${current.date} ${current.time} → ${input.date} ${input.time}.`,
        },
      ],
    };
    write(items.map((item) => (item.id === id ? next : item)));
    return next;
  },
  respond(user, id, accept) {
    const items = read();
    const current = items.find(
      (item) => item.id === id && permitted(user, item),
    );
    if (
      !current ||
      current.status !== 'pending' ||
      current.awaitingId !== meetingAccount(user).id ||
      startTime(current) <= Date.now()
    )
      throw new Error('Não é possível responder a este convite.');
    if (
      accept &&
      hasConflict(
        items.filter((meeting) =>
          meeting.participants.some((person) =>
            current.participants.some((p) => p.id === person.id),
          ),
        ),
        current.date,
        current.time,
        current.duration,
        id,
      )
    )
      throw new Error('Este horário coincide com outro compromisso.');
    const next = {
      ...current,
      awaitingId: undefined,
      status: accept ? ('confirmed' as const) : ('cancelled' as const),
      cancellationReason: accept ? undefined : 'Convite recusado.',
      history: [
        ...current.history,
        {
          date: new Date().toISOString(),
          text: accept ? 'Convite aceito.' : 'Convite recusado.',
        },
      ],
    };
    write(items.map((item) => (item.id === id ? next : item)));
    return next;
  },
  cancel(user, id, reason) {
    const items = read();
    const current = items.find(
      (item) => item.id === id && permitted(user, item),
    );
    if (
      !current ||
      !['pending', 'confirmed'].includes(effectiveStatus(current))
    )
      throw new Error(
        'Este compromisso está disponível somente para consulta.',
      );
    const next = {
      ...current,
      status: 'cancelled' as const,
      awaitingId: undefined,
      cancellationReason: reason.trim() || undefined,
      history: [
        ...current.history,
        { date: new Date().toISOString(), text: 'Reunião cancelada.' },
      ],
    };
    write(items.map((item) => (item.id === id ? next : item)));
    return next;
  },
};
