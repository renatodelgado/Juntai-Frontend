import {
  SparkleIcon,
  MagnifyingGlassIcon,
  ChatCircleIcon,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import logo from '@/shared/assets/images/logo-txt.svg';
import symbol from '@/shared/assets/images/logo-symb.svg';
import { Landing } from './HomePage.styles';

const plans = [
  {
    group: 'Startup',
    name: 'Free',
    price: 'R$ 0',
    unit: 'para sempre',
    description: 'Para tirar sua ideia do papel e encontrar conexões.',
    features: [
      '1 usuário',
      'Cadastro, pitch e Canvas',
      'Presença nas buscas',
      'Conexões, mensagens e reuniões',
      'Sem comissão por aporte',
    ],
    status: 'Acesso gratuito',
  },
  {
    group: 'Startup',
    name: 'Pro',
    price: 'R$ 29',
    unit: '/mês',
    description: 'Uma evolução pensada para startups.',
    features: [
      'Tudo do Startup Free',
      'Curadoria independente',
      'Suporte diferenciado',
      'Mentorias especializadas',
    ],
    status: 'Ideia para o futuro',
  },
  {
    group: 'Investidor',
    name: 'Free',
    price: 'R$ 0',
    unit: 'gratuito',
    description: 'Para investidores e mentores conhecerem startups.',
    features: [
      '1 usuário',
      'Busca e filtros básicos',
      'Recomendações e perfil',
      'Conexões, mensagens e reuniões',
    ],
    status: 'Acesso gratuito',
  },
  {
    group: 'Investidor',
    name: 'Pro',
    price: 'R$ 99',
    unit: '/mês',
    description: 'Ferramentas para organizar sua análise.',
    features: [
      'Tudo do Investidor Free',
      'Filtros salvos, listas e comparação',
      'Alertas e exportação',
      'Até 10 análises preliminares/mês',
      'Franquia mensal sem acúmulo',
    ],
    status: 'Assinatura futura',
    featured: true,
  },
  {
    group: 'Para equipes',
    name: 'Institucional',
    price: 'R$ 299',
    unit: '/mês',
    description: 'Uma visão compartilhada para redes e hubs.',
    features: [
      'Até 5 usuários',
      'Espaço e funil compartilhado',
      'Permissões e métricas agregadas',
      '20 análises/mês compartilhadas',
      'Personalização e SLA sob proposta',
    ],
    status: 'Ideia para o futuro',
  },
];

export function HomePage() {
  return (
    <Landing id="inicio">
      <header className="wrap nav">
        <a href="#inicio" aria-label="Juntaí, início">
          <img className="logo" src={logo} alt="Juntaí!" />
        </a>
        <nav className="nav-links" aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#para-quem">Para quem é</a>
          <a href="#planos">Planos</a>
        </nav>
        <div className="nav-actions">
          <Link className="btn btn-outline" to="/login">
            Entrar
          </Link>
        </div>
      </header>
      <main>
        <section className="wrap hero">
          <div className="hero-copy">
            <div className="tag">Feito para conectar possibilidades</div>
            <h1>
              Quem cria encontra <em>quem acredita.</em>
            </h1>
            <p>
              Seu próximo passo pode começar com uma conversa. Mostre sua
              solução, explore oportunidades e encontre pessoas com interesses
              em comum.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/cadastro/startup">
                Tenho uma startup
              </Link>
              <Link className="btn btn-outline" to="/cadastro/investidor">
                Sou investidor ou mentor
              </Link>
            </div>
            <p className="hero-note">
              Uma plataforma para aproximar o ecossistema de inovação do
              Nordeste.
            </p>
          </div>
          <div
            className="visual"
            aria-label="Conexões entre startups, investidores e mentores"
          >
            <svg className="atom" viewBox="0 0 520 460" aria-hidden="true">
              <ellipse
                cx="260"
                cy="230"
                rx="196"
                ry="83"
                fill="none"
                stroke="#b8aad9"
                strokeWidth="1.4"
                transform="rotate(-42 260 230)"
              />
              <ellipse
                cx="260"
                cy="230"
                rx="196"
                ry="83"
                fill="none"
                stroke="#c8bde3"
                strokeWidth="1.4"
                transform="rotate(42 260 230)"
              />
              <ellipse
                cx="260"
                cy="230"
                rx="205"
                ry="98"
                fill="none"
                stroke="#e5a49b"
                strokeWidth="1.4"
              />
              <circle cx="95" cy="172" r="7" fill="#e6655e" />
              <circle cx="430" cy="179" r="7" fill="#3e327f" />
              <circle cx="278" cy="328" r="7" fill="#c17b91" />
              <circle cx="394" cy="320" r="3" fill="#b9a9d9" />
              <circle cx="131" cy="312" r="3" fill="#df9e95" />
            </svg>
            <div className="center">
              <img src={symbol} alt="" />
            </div>
            <div className="bubble one">
              <strong>Startups</strong>
              <span>Ideias que pedem espaço</span>
            </div>
            <div className="bubble two">
              <strong>Investidores</strong>
              <span>Visão para novas jornadas</span>
            </div>
            <div className="bubble three">
              <strong>Mentores</strong>
              <span>Experiência que aproxima</span>
            </div>
          </div>
        </section>
        <section className="section intro" id="como-funciona">
          <div className="wrap">
            <div className="section-heading">
              <div className="heading-copy">
                <span className="tag">Como funciona</span>
                <h2>
                  Do perfil à conversa.
                  <br />
                  <em>Sem perder o essencial.</em>
                </h2>
                <p>
                  Um caminho mais claro entre apresentar uma ideia, descobrir
                  oportunidades e iniciar uma conversa.
                </p>
              </div>
            </div>
            <div className="feature-grid">
              <article className="feature">
                <div className="feature-icon" aria-hidden="true">
                  <SparkleIcon size={24} weight="bold" />
                </div>
                <h3>Conte sua história</h3>
                <p>
                  Crie seu perfil e apresente o que faz seu negócio ou sua
                  experiência ser único.
                </p>
              </article>
              <article className="feature">
                <div className="feature-icon" aria-hidden="true">
                  <MagnifyingGlassIcon size={24} weight="bold" />
                </div>
                <h3>Descubra afinidades</h3>
                <p>
                  Explore perfis e recomendações que consideram as informações e
                  interesses cadastrados.
                </p>
              </article>
              <article className="feature">
                <div className="feature-icon" aria-hidden="true">
                  <ChatCircleIcon size={24} weight="bold" />
                </div>
                <h3>Comece a conversa</h3>
                <p>
                  Demonstre interesse, troque mensagens e agende reuniões para
                  conhecer melhor cada oportunidade.
                </p>
              </article>
            </div>
          </div>
        </section>
        <section className="section" id="para-quem">
          <div className="wrap">
            <div className="section-heading">
              <div className="heading-copy">
                <span className="tag">Para quem é</span>
                <h2>
                  De que lado dessa
                  <br />
                  conexão você está?
                </h2>
                <p>
                  Uma rede para quem quer apresentar uma ideia e para quem busca
                  contribuir com a próxima grande história.
                </p>
              </div>
            </div>
            <div className="audience">
              <article className="audience-card">
                <span className="tag">Para startups</span>
                <h3>
                  Sua ideia tem história.
                  <br />
                  Deixe que ela seja vista.
                </h3>
                <p>
                  Reúna pitch, informações do negócio e Canvas em um perfil para
                  apresentar sua trajetória a investidores e mentores.
                </p>
                <Link to="/cadastro/startup">Cadastrar minha startup</Link>
              </article>
              <article className="audience-card">
                <span className="tag">Para investidores e mentores</span>
                <h3>
                  Conheça quem está
                  <br />
                  construindo o próximo passo.
                </h3>
                <p>
                  Explore startups, encontre perfis alinhados ao seu interesse e
                  inicie conversas com mais contexto.
                </p>
                <Link to="/cadastro/investidor">Criar meu perfil</Link>
              </article>
            </div>
          </div>
        </section>
        <section className="section plans" id="planos">
          <div className="wrap">
            <div className="section-heading">
              <div className="heading-copy">
                <span className="tag">Planos e possibilidades</span>
                <h2>
                  Uma rede para começar.
                  <br />
                  Mais caminhos para crescer.
                </h2>
                <p>
                  Comece com o acesso gratuito e conheça as possibilidades que
                  estamos planejando para o futuro.
                </p>
              </div>
            </div>
            <div className="notice">
              <strong>Assinaturas em breve!</strong>
              <span>
                Planos pagos, benefícios e valores são propostas futuras e podem
                mudar. Ainda não estão disponíveis para contratação.
              </span>
            </div>
            <div
              className="pricing-scroll"
              tabIndex={0}
              role="region"
              aria-label="Planos: deslize horizontalmente para comparar"
            >
              <div className="pricing">
                {plans.map((plan) => (
                  <article
                    className={`plan${plan.featured ? ' featured' : ''}`}
                    key={`${plan.group}-${plan.name}`}
                  >
                    <div className="type">{plan.group}</div>
                    <h3>{plan.name}</h3>
                    <div className="price">
                      {plan.price} <small>{plan.unit}</small>
                    </div>
                    <div className="desc">{plan.description}</div>
                    <ul>
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <div className="plan-end">{plan.status}</div>
                  </article>
                ))}
              </div>
            </div>
            <p className="plans-foot">
              Valores mensais estimados. Startup Pro e Institucional são
              possibilidades para um futuro mais distante. Análises de risco,
              mentorias e curadoria dependem de implementação e validação; não
              representam garantia de resultados ou de posição no ranking.
            </p>
          </div>
        </section>
        <section className="closing">
          <div className="wrap closing-box">
            <div>
              <span className="tag closing-tag">
                O próximo passo começa aqui
              </span>
              <h2>Uma boa conexão pode mudar muita coisa.</h2>
              <p>
                Conte sua história, encontre novas perspectivas e faça parte
                dessa rede.
              </p>
            </div>
            <Link className="btn btn-primary" to="/login">
              Já tenho uma conta
            </Link>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap">
          <div>
            <img className="logo" src={logo} alt="Juntaí!" />
            <p>Conexões que aproximam o ecossistema de inovação.</p>
          </div>
          <div className="footlinks">
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
            <Link to="/termos-de-uso">Termos de uso</Link>
            <Link to="/politica-de-privacidade">Privacidade</Link>
            <Link to="/login">Entrar</Link>
          </div>
        </div>
      </footer>
    </Landing>
  );
}
