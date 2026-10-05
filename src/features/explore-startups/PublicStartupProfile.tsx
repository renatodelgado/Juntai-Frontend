import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BookmarkSimpleIcon,
  ChatCircleIcon,
  CalendarIcon,
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { useDiscovery } from './useDiscovery';
import { DiscoveryLayout } from './components/DiscoveryLayout';
import {
  CompatibilityIndicator,
  StartupIdentity,
} from './components/StartupCard';
import {
  InterestConfirmationModal,
  MeetingRequestModal,
} from './components/ConnectionModals';
import * as S from './Explore.styles';

export function PublicStartupProfile() {
  const data = useDiscovery();
  const { id } = useParams();
  const location = useLocation();
  const routeState = location.state as {
    returnSearch?: string;
    returnTo?: string;
  } | null;
  const fromMatches = routeState?.returnTo === '/investidor/matches';
  const back = `${fromMatches ? '/investidor/matches' : '/investidor/startups'}${routeState?.returnSearch ? `?${routeState.returnSearch}` : ''}`;
  const startup = data.startups.find((item) => item.id === id);
  const [interest, setInterest] = useState(false);
  const [meeting, setMeeting] = useState(false);
  const connected = data.connections.some((chat) => chat.participant.id === id);
  const sent = data.state.interests.some((item) => item.startupId === id);
  const saved = !!id && data.state.saved.includes(id);
  return (
    <DiscoveryLayout data={data}>
      <S.Profile>
        <PageHeader
          title={startup?.name ?? 'Perfil da startup'}
          subtitle={startup?.tagline}
          breadcrumbs={[
            { label: fromMatches ? 'Matches' : 'Explorar', to: back },
            { label: startup?.name ?? 'Perfil da startup' },
          ]}
        />
        <Link className="back" to={back}>
          <ArrowLeftIcon size={17} />{' '}
          {fromMatches ? 'Voltar aos matches' : 'Voltar à exploração'}
        </Link>
        {data.loading ? (
          <div className="empty" aria-busy="true">
            Carregando perfil…
          </div>
        ) : data.failed ? (
          <div className="empty" role="alert">
            <h2>Não foi possível carregar o perfil</h2>
            <Button onClick={data.retry}>Tentar novamente</Button>
          </div>
        ) : !startup ? (
          <div className="empty">
            <h1>Startup não encontrada</h1>
            <p>Volte à exploração para encontrar outras empresas.</p>
            <Button as={Link} to={back}>
              Explorar startups
            </Button>
          </div>
        ) : (
          <>
            <header className="profile-header">
              <StartupIdentity startup={startup} />
              <div>
                <small>{startup.segment} · Startup aprovada</small>
                <strong className="startup-name">{startup.name}</strong>
                <p>{startup.tagline}</p>
                <div className="meta">
                  {startup.stage} · {startup.location.city},{' '}
                  {startup.location.state}
                </div>
              </div>
              <S.SaveButton
                aria-label={
                  saved ? 'Remover startup das salvas' : 'Salvar startup'
                }
                aria-pressed={saved}
                onClick={() => data.save(startup.id)}
              >
                <BookmarkSimpleIcon
                  size={24}
                  weight={saved ? 'fill' : 'regular'}
                />
              </S.SaveButton>
              <div className="actions">
                <Button
                  onClick={() => setInterest(true)}
                  disabled={!data.approved}
                >
                  {sent ? 'Iniciar conversa' : 'Tenho interesse'}
                </Button>
                <Button
                  $variant="secondary"
                  disabled={!connected || !data.approved}
                  title={
                    !data.approved
                      ? 'Disponível após aprovação do perfil'
                      : undefined
                  }
                  onClick={() => setMeeting(true)}
                >
                  <CalendarIcon size={18} />
                  Agendar reunião
                </Button>
                {connected &&
                  (data.approved ? (
                    <Button
                      as={Link}
                      to={`/investidor/mensagens?startup=${startup.id}`}
                      $variant="secondary"
                    >
                      <ChatCircleIcon size={18} />
                      Enviar mensagem
                    </Button>
                  ) : (
                    <Button
                      $variant="secondary"
                      disabled
                      title="Disponível após aprovação do perfil"
                    >
                      <ChatCircleIcon size={18} />
                      Enviar mensagem
                    </Button>
                  ))}
              </div>
            </header>
            {!connected && (
              <p>
                Conversa e agendamento ficam disponíveis após uma conexão
                habilitada pela plataforma.
              </p>
            )}
            <div className="profile-layout">
              <div>
                <section>
                  <h2>Uma visão do negócio</h2>
                  <dl>
                    <div>
                      <dt>Segmento</dt>
                      <dd>{startup.segment}</dd>
                    </div>
                    <div>
                      <dt>Estágio atual</dt>
                      <dd>{startup.stage}</dd>
                    </div>
                    <div>
                      <dt>Modelo de negócio</dt>
                      <dd>{startup.businessModel.join(' · ')}</dd>
                    </div>
                    <div>
                      <dt>Localização</dt>
                      <dd>
                        {startup.location.city}/{startup.location.state} ·{' '}
                        {startup.location.region}
                      </dd>
                    </div>
                    <div>
                      <dt>Mercado-alvo</dt>
                      <dd>{startup.targetMarket}</dd>
                    </div>
                    <div>
                      <dt>Investimento</dt>
                      <dd>
                        {startup.seekingInvestment === undefined
                          ? 'Situação não divulgada'
                          : startup.seekingInvestment
                            ? 'Buscando investimento'
                            : 'Não está buscando investimento'}
                      </dd>
                    </div>
                  </dl>
                </section>
                <section>
                  <h2>Sobre a empresa</h2>
                  <p>{startup.description}</p>
                  <h3>O problema</h3>
                  <p>{startup.problem}</p>
                  <h3>A solução</h3>
                  <p>{startup.solution}</p>
                  <h3>Mercado de atuação</h3>
                  <p>{startup.targetMarket}</p>
                </section>
                {(startup.traction ||
                  Object.values(startup.metrics ?? {}).some(
                    (value) => value !== undefined,
                  )) && (
                  <section>
                    <h2>Tração e momento</h2>
                    <p>{startup.traction}</p>
                    <dl>
                      {startup.metrics?.clients !== undefined && (
                        <div>
                          <dt>Número de clientes</dt>
                          <dd>
                            {startup.metrics.clients.toLocaleString('pt-BR')}
                          </dd>
                        </div>
                      )}
                      {startup.metrics?.revenue !== undefined && (
                        <div>
                          <dt>Faturamento mensal</dt>
                          <dd>
                            {startup.metrics.revenue.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </dd>
                        </div>
                      )}
                      {startup.metrics?.growth !== undefined && (
                        <div>
                          <dt>Crescimento</dt>
                          <dd>
                            {startup.metrics.growth.toLocaleString('pt-BR')}%
                          </dd>
                        </div>
                      )}
                    </dl>
                  </section>
                )}
                <section>
                  <h2>Investimento e necessidades</h2>
                  <p>
                    {startup.seekingInvestment === undefined
                      ? 'Situação de investimento não divulgada.'
                      : startup.seekingInvestment
                        ? 'A empresa está buscando investimento.'
                        : 'A empresa não está buscando investimento.'}
                  </p>
                  {startup.investmentAmount !== undefined ? (
                    <p>
                      Capital desejado:{' '}
                      {startup.investmentAmount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  ) : (
                    <small>Valor buscado não divulgado.</small>
                  )}
                  {startup.investmentPurpose && (
                    <>
                      <h3>Objetivo do investimento</h3>
                      <p>{startup.investmentPurpose}</p>
                    </>
                  )}
                  <h3>Além de capital, o que a startup precisa</h3>
                  <div className="needs">
                    {startup.needs.map((need) => (
                      <span key={need}>{need}</span>
                    ))}
                  </div>
                </section>
                {startup.pitch && (
                  <section>
                    <h2>Pitch e modelo de negócio</h2>
                    <details>
                      <summary>Conheça a proposta</summary>
                      <p>{startup.pitch}</p>
                    </details>
                    <details>
                      <summary>Como o negócio funciona</summary>
                      <p>
                        {startup.businessModel.join(' · ')} para{' '}
                        {startup.targetMarket.toLowerCase()}.
                      </p>
                    </details>
                  </section>
                )}
                {(startup.presentationUrl ||
                  startup.siteUrl ||
                  Object.keys(startup.canvas ?? {}).length > 0) && (
                  <section>
                    <h2>Materiais e modelo de negócio</h2>
                    {startup.presentationUrl &&
                      /^https?:\/\//i.test(startup.presentationUrl) && (
                        <p>
                          <a
                            href={startup.presentationUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Abrir apresentação
                          </a>
                        </p>
                      )}
                    {startup.siteUrl &&
                      /^https?:\/\//i.test(startup.siteUrl) && (
                        <p>
                          <a
                            href={startup.siteUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Visitar site
                          </a>
                        </p>
                      )}
                    {Object.keys(startup.canvas ?? {}).length > 0 && (
                      <details>
                        <summary>Canvas</summary>
                        <dl>
                          {Object.entries(startup.canvas ?? {})
                            .filter(
                              ([key]) =>
                                key !== 'problema' && key !== 'solucao',
                            )
                            .map(([key, value]) => (
                              <div key={key}>
                                <dt>
                                  {(
                                    {
                                      value: 'Proposta de valor',
                                      customers: 'Segmentos de clientes',
                                      channels: 'Canais',
                                      relationships:
                                        'Relacionamento com clientes',
                                      revenue: 'Fontes de receita',
                                      resources: 'Recursos principais',
                                      activities: 'Atividades principais',
                                      partners: 'Parcerias principais',
                                      costs: 'Estrutura de custos',
                                    } as Record<string, string>
                                  )[key] || key}
                                </dt>
                                <dd>{String(value)}</dd>
                              </div>
                            ))}
                        </dl>
                      </details>
                    )}
                  </section>
                )}
                {startup.team && (
                  <section>
                    <h2>Quem constrói essa ideia</h2>
                    <p>{startup.team}</p>
                    <small>Membros individuais não divulgados.</small>
                  </section>
                )}
              </div>
              <aside>
                <section className="affinity">
                  <h2>Compatibilidade demonstrativa</h2>
                  <CompatibilityIndicator value={startup.compatibility} />
                  {startup.compatibilityFactors?.length ? (
                    <ul>
                      {startup.compatibilityFactors.map((factor) => (
                        <li key={factor}>{factor}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      Complete suas preferências para personalizar a descoberta.
                    </p>
                  )}
                  <small>
                    Pontuação aleatória de afinidade. Não representa garantia de
                    sucesso, retorno ou investimento.
                  </small>
                </section>
              </aside>
            </div>
            <InterestConfirmationModal
              startup={interest ? startup : null}
              data={data}
              onClose={() => setInterest(false)}
            />
            <MeetingRequestModal
              startup={meeting ? startup : null}
              data={data}
              onClose={() => setMeeting(false)}
            />
          </>
        )}
      </S.Profile>
    </DiscoveryLayout>
  );
}
