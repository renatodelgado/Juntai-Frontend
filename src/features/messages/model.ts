import type { AuthUser } from '@/features/auth/services/session';

export type UserSummary = {
  id: string;
  name: string;
  type: 'startup' | 'investor' | 'mentor';
  segment: string;
  location: string;
  bio: string;
  publicDetails: Record<string, string>;
};
export type Meeting = {
  date: string;
  time: string;
  duration: string;
  format: string;
  link: string;
  notes: string;
};
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
  type: 'text' | 'file' | 'meeting';
  file?: File;
  meeting?: Meeting;
};
export type MatchContext = {
  matchId: string;
  compatibility: number;
  factors: string[];
};
export type Conversation = {
  id: string;
  participant: UserSummary;
  messages: Message[];
  unreadCount: number;
  updatedAt: string;
  status: 'active' | 'archived' | 'closed';
  match: MatchContext;
};
export const profileLabels = {
  startup: 'Startup',
  investor: 'Investidor(a) anjo',
  mentor: 'Mentor(a)',
};
export function filterConversations(
  items: Conversation[],
  search: string,
  filter: string,
) {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  return items
    .filter((item) => {
      const person = item.participant;
      return (
        normalize(
          `${person.name} ${person.segment} ${person.location} ${profileLabels[person.type]}`,
        ).includes(normalize(search.trim())) &&
        (filter === 'all' ||
          (filter === 'unread' ? item.unreadCount > 0 : filter === person.type))
      );
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// Demo records contain only explicitly public, fictional information. No credentials.
const people: UserSummary[] = [
  {
    id: 'solnexo',
    name: 'SolNexo Energia',
    type: 'startup',
    segment: 'CleanTech',
    location: 'Fortaleza/CE',
    bio: 'Tecnologia para tornar a energia solar mais acessível aos pequenos negócios.',
    publicDetails: {
      Estágio: 'Growth',
      'Modelo de negócio': 'SaaS · B2B',
      Mercado: 'Pequenas e médias empresas do Nordeste',
      Tração: 'Pilotos com parceiros regionais',
      'Investimento buscado': 'Não divulgado',
      Necessidades: 'Investimento e expansão comercial',
      Pitch:
        'Conectamos empresas à energia solar com gestão simples e dados em tempo real.',
      Equipe: 'Equipe multidisciplinar de energia e tecnologia',
    },
  },
  {
    id: 'agroponte',
    name: 'AgroPonte Digital',
    type: 'startup',
    segment: 'AgTech',
    location: 'Recife/PE',
    bio: 'Uma ponte digital entre produtores rurais e novas oportunidades de mercado.',
    publicDetails: {
      Estágio: 'Seed',
      'Modelo de negócio': 'Marketplace · B2B',
      Mercado: 'Agricultura familiar',
      Tração: 'Validação com cooperativas',
      'Investimento buscado': 'Não divulgado',
      Necessidades: 'Mentoria e acesso ao mercado',
      Pitch:
        'Aproximamos produtores e compradores para uma cadeia mais eficiente.',
      Equipe: 'Especialistas em tecnologia e agronegócio',
    },
  },
  {
    id: 'camila',
    name: 'Camila Torres',
    type: 'investor',
    segment: 'CleanTech · SaaS',
    location: 'Fortaleza/CE',
    bio: 'Apoio negócios que combinam tecnologia, impacto positivo e crescimento sustentável.',
    publicDetails: {
      Cargo: 'Investidora anjo',
      'Segmentos de interesse': 'CleanTech, AgTech e SaaS',
      'Estágios de interesse': 'Seed e Growth',
      'Faixa de investimento': 'Não divulgada',
      Experiência: 'Estratégia e expansão de negócios',
      Regiões: 'Nordeste',
      Disponibilidade: 'Mediante agendamento',
      Contribuições: 'Capital, conexões e estratégia',
    },
  },
  {
    id: 'bruno',
    name: 'Bruno Almeida',
    type: 'investor',
    segment: 'AgTech · Tecnologia',
    location: 'Recife/PE',
    bio: 'Investidor com interesse em soluções digitais para transformar mercados tradicionais.',
    publicDetails: {
      Cargo: 'Investidor e mentor',
      'Segmentos de interesse': 'AgTech e CleanTech',
      'Estágios de interesse': 'Seed e Growth',
      'Faixa de investimento': 'Não divulgada',
      Experiência: 'Operações e desenvolvimento comercial',
      Regiões: 'Nordeste',
      Disponibilidade: 'Mediante agendamento',
      Contribuições: 'Investimento e mentoria comercial',
    },
  },
];
const accounts = [
  'solnexo.teste.2109@example.com',
  'agroponte.teste.2109@example.com',
  'camila.investidora.2109@example.com',
  'bruno.investidor.2109@example.com',
];

export interface MessagesRepository {
  list(user: AuthUser): Promise<Conversation[]>;
}
// Replace this adapter with authenticated API requests when messaging endpoints exist.
export const demoMessagesRepository: MessagesRepository = {
  async list(user) {
    const index = accounts.indexOf(user.email.toLowerCase());
    if (index < 0 || (index < 2 ? 'startup' : 'investidor') !== user.tipoPerfil)
      return [];
    return people
      .filter((person) => person.type !== people[index]!.type)
      .map((person, i) => {
        const id = `${people[index]!.id}-${person.id}`;
        const createdAt = new Date(
          Date.now() - (i + 1) * 3600000,
        ).toISOString();
        return {
          id,
          participant: person,
          unreadCount: i === 0 ? 2 : 0,
          updatedAt: createdAt,
          status: 'active',
          match: {
            matchId: `match-${id}`,
            compatibility: i === 0 ? 87 : 81,
            factors: [
              `Segmento: ${index < 2 ? people[index]!.segment : person.segment}`,
              'Estágio: Seed / Growth',
              'Região: Nordeste',
              'Interesse: Investimento e mentoria',
            ],
          },
          messages: [
            {
              id: `${id}-1`,
              conversationId: id,
              senderId: person.id,
              content:
                'Olá! Nosso match por aqui chamou minha atenção. Acredito que temos boas oportunidades para construir juntos.',
              createdAt,
              type: 'text',
            },
            {
              id: `${id}-2`,
              conversationId: id,
              senderId: user.id,
              content:
                'Olá! Também gostei da conexão. Podemos conversar sobre o modelo de negócio e os próximos passos para a expansão.',
              createdAt,
              type: 'text',
              readAt: createdAt,
            },
            {
              id: `${id}-3`,
              conversationId: id,
              senderId: person.id,
              content:
                'Com certeza! Que tal agendarmos uma conversa nesta semana? Gostaria de conhecer melhor os planos para o Nordeste.',
              createdAt,
              type: 'text',
            },
          ],
        };
      });
  },
};
