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
                <small>{startup.segment} · Perfil público demonstrativo</small>
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
                <Button onClick={() => setInterest(true)} disabled={sent}>
                  {sent ? 'Interesse enviado' : 'Tenho interesse'}
                </Button>
                <Button
                  $variant="secondary"
                  disabled={!connected}
                  onClick={() => setMeeting(true)}
                >
                  <CalendarIcon size={18} />
                  Agendar reunião
                </Button>
                {connected && (
                  <Button
                    as={Link}
                    to={`/investidor/mensagens?startup=${startup.id}`}
                    $variant="secondary"
                  >
                    <ChatCircleIcon size={18} />
                    Enviar mensagem
                  </Button>
                )}
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
                {startup.traction && (
                  <section>
                    <h2>Tração e momento</h2>
                    <p>{startup.traction}</p>
                    <small>
                      Indicadores quantitativos não disponibilizados.
                    </small>
                  </section>
                )}
                <section>
                  <h2>Investimento e necessidades</h2>
                  <p>
                    {startup.seekingInvestment
                      ? 'A empresa está buscando investimento.'
                      : 'Situação de investimento não divulgada.'}
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
                  <h3>Parcerias e apoio procurados</h3>
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
                      <small>
                        Canvas e materiais externos não disponibilizados.
                      </small>
                    </details>
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
                  <h2>Por que esta startup pode combinar com você?</h2>
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
                    Regra demonstrativa de afinidade. Não representa garantia de
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
