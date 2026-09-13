export const steps = [
  {
    id: 'about',
    label: 'Sobre',
    title: 'Vamos começar pela sua startup',
    description:
      'Conte um pouco sobre quem vocês são. Essas informações ajudam investidores e mentores a entender rapidamente o perfil do negócio.',
  },
  {
    id: 'business',
    label: 'Negócio',
    title: 'Onde sua startup está hoje?',
    description:
      'Cada negócio tem seu tempo. Escolha o segmento e o momento que melhor representam vocês.',
  },
  {
    id: 'market',
    label: 'Mercado',
    title: 'Como o seu negócio funciona?',
    description:
      'Queremos entender quem vocês atendem e o que torna a solução relevante para essas pessoas.',
  },
  {
    id: 'location',
    label: 'Atuação',
    title: 'Onde vocês estão e onde querem chegar?',
    description:
      'Do Recife para o mundo: conte de onde vocês partem e quais mercados querem alcançar.',
  },
  {
    id: 'traction',
    label: 'Tração',
    title: 'Como o negócio está performando?',
    description:
      'Essas informações ajudam a apresentar a maturidade da startup. Tudo bem estar começando ou preferir não compartilhar alguns números.',
  },
  {
    id: 'investment',
    label: 'Investimento',
    title: 'O que vocês estão buscando?',
    description:
      'Capital, conhecimento ou novas portas abertas: vamos entender o que faz diferença agora.',
  },
  {
    id: 'matching',
    label: 'Parcerias',
    title: 'Que tipo de parceiro vocês procuram?',
    description:
      'Suas respostas vão ajudar a encontrar investidores e mentores com experiências e interesses mais próximos dos seus.',
  },
  {
    id: 'pitch',
    label: 'Pitch e Canvas',
    title: 'Agora conte a história da sua startup',
    description:
      'Apresente sua ideia e organize seu modelo de negócio. Você pode começar pelo que já tem e complementar depois.',
  },
  {
    id: 'team',
    label: 'Equipe',
    title: 'Quem está por trás da startup?',
    description:
      'Boas conexões começam com pessoas. Apresente quem está construindo esse negócio com você.',
  },
  {
    id: 'review',
    label: 'Revisão',
    title: 'Confira seu perfil antes de entrar no Juntaí!',
    description:
      'Veja como sua história está tomando forma. Se quiser mudar algo, é só editar a seção.',
  },
  {
    id: 'consent',
    label: 'Consentimento',
    title: 'Uma conexão começa com confiança',
    description:
      'Entenda como suas informações serão utilizadas e escolha seus consentimentos com clareza.',
  },
] as const;

export type StepId = (typeof steps)[number]['id'];
