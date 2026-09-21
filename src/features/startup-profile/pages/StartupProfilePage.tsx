import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HouseIcon,
  PlantIcon,
  HeartIcon,
  ChatCircleIcon,
  CalendarIcon,
  GearIcon,
  ListIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import logo from '@/shared/assets/images/logo-txt.svg';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import type { SavedDraft } from '@/features/startup-onboarding/services/draftStorage';
import { loadProfile, logout } from '@/features/auth/services/profiles';
import { ProfileEditor } from '../components/ProfileEditor';
import { PresentationLink } from '../components/PresentationLink';
import { steps } from '@/features/startup-onboarding/data/steps';
import type { StepId } from '@/features/startup-onboarding/data/steps';
import * as catalogs from '@/features/startup-onboarding/data/catalogs';
import { profileCompleteness, safeLink } from '../model/profile';
import * as S from './Profile.styles';

const empty = 'Ainda não informado';
const labels = (options: readonly catalogs.Option[], values: string[]) =>
  values.map((value) => catalogs.optionLabel(options, value)).join(' · ') ||
  empty;
function ExternalLink({ url, children }: { url: string; children: ReactNode }) {
  const href = safeLink(url);
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : null;
}

export function StartupProfilePage() {
  const [saved, setSaved] = useState<SavedDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState<StepId | null>(null);
  const [dialog, setDialog] = useState<{
    title: string;
    content: ReactNode;
  } | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    loadProfile()
      .then((value) => {
        if (!active) return;
        if (!value) {
          void navigate('/login', { replace: true });
          return;
        }
        setSaved(value ?? null);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);
  function edit(step: StepId) {
    if (step === 'review') {
      setDialog({
        title: 'O que você quer atualizar?',
        content: (
          <S.Row>
            {steps
              .filter((item) => item.id !== 'review')
              .map((item) => (
                <Button
                  key={item.id}
                  $variant="secondary"
                  onClick={() => edit(item.id)}
                >
                  {item.label}
                </Button>
              ))}
          </S.Row>
        ),
      });
    } else {
      setDialog(null);
      setEditing(step);
    }
  }
  function section(title: string, step: StepId, content: ReactNode) {
    return (
      <S.Card>
        <header>
          <h2>{title}</h2>
          <Button
            $variant="quiet"
            onClick={() => edit(step)}
            aria-label={`Editar ${title}`}
          >
            <PencilSimpleIcon size={18} />
            Editar
          </Button>
        </header>
        {content}
      </S.Card>
    );
  }
  const data = saved?.data;
  const completeness = data
    ? profileCompleteness(data, saved.attachment)
    : null;
  const name = data?.publicName || data?.name || 'Sua startup';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  const publicPreview = data && (
    <>
      <h2>{name}</h2>
      <p>{data.description}</p>
      <h3>O que fazemos</h3>
      <p>{data.solution || empty}</p>
      <h3>Nosso mercado</h3>
      <p>{data.targetMarket || empty}</p>
      <h3>Pitch</h3>
      <p>{data.pitchText || empty}</p>
      <h3>Equipe</h3>
      {data.members.map((member) => (
        <p key={member.id}>
          <strong>
            {member.name} · {member.role}
          </strong>
          <br />
          {member.bio}
        </p>
      ))}
      <S.Muted>Prévia de apresentação. Este perfil não está publicado.</S.Muted>
    </>
  );

  return (
    <S.Layout>
      <S.Sidebar>
        <Link to="/" aria-label="Juntaí! — início">
          <img src={logo} alt="Juntaí!" />
        </Link>
        <Button
          $variant="quiet"
          aria-expanded={menu}
          aria-controls="profile-menu"
          onClick={() => setMenu(!menu)}
        >
          <ListIcon size={22} />
          Menu
        </Button>
        <nav
          id="profile-menu"
          aria-label="Navegação da startup"
          data-open={menu}
        >
          <Link to="/">
            <HouseIcon size={20} />
            Início
          </Link>
          <Link to="/startup/perfil" aria-current="page">
            <PlantIcon size={20} />
            Meu perfil
          </Link>
          <button disabled>
            <HeartIcon size={20} />
            Matches
          </button>
          <button disabled>
            <ChatCircleIcon size={20} />
            Mensagens
          </button>
          <button disabled>
            <CalendarIcon size={20} />
            Reuniões
          </button>
          <button
            onClick={() =>
              setDialog({
                title: 'Configurações do perfil',
                content: (
                  <>
                    <p>
                      Alterações no perfil ficam salvas neste navegador e ainda
                      não são enviadas para sua conta.
                    </p>
                    <Button onClick={() => edit('consent')}>
                      Revisar consentimentos
                    </Button>
                  </>
                ),
              })
            }
          >
            <GearIcon size={20} />
            Configurações
          </button>
          <button
            onClick={() => {
              logout();
              void navigate('/login', { replace: true });
            }}
          >
            Sair da conta
          </button>
        </nav>
        <small>
          Conexões, mensagens e reuniões estarão disponíveis após a integração e
          aprovação.
        </small>
      </S.Sidebar>
      <S.Main>
        {loading ? (
          <S.Card role="status">Preparando seu perfil…</S.Card>
        ) : !data ? (
          <S.Card>
            <h1>
              {error
                ? 'Não conseguimos abrir seu perfil'
                : 'Preparando seu acesso'}
            </h1>
            <p>
              {error
                ? 'Tente recarregar a página. Seus dados não foram removidos.'
                : 'Entre na sua conta para acessar seu perfil.'}
            </p>
            <Button as={Link} to="/login">
              Ir para o login
            </Button>
          </S.Card>
        ) : (
          <>
            <div>
              <S.Badge>
                <PlantIcon size={16} />
                Espaço da startup
              </S.Badge>
              <S.Muted>
                Alterações feitas aqui ficam apenas neste navegador.
              </S.Muted>
            </div>
            <S.Card>
              <S.Row>
                <S.Avatar>
                  {data.logo ? (
                    <img
                      src={data.logo}
                      alt={`Logo de ${name}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 'inherit',
                      }}
                    />
                  ) : (
                    <span aria-hidden="true">{initials}</span>
                  )}
                </S.Avatar>
                <div>
                  <h1>{name}</h1>
                  <p>{data.description}</p>
                </div>
              </S.Row>
              <S.Row>
                <S.Badge>
                  {catalogs.optionLabel(catalogs.segments, data.segment)}
                </S.Badge>
                <S.Badge>
                  {catalogs.optionLabel(catalogs.stages, data.stage)}
                </S.Badge>
                {data.businessModels.map((value) => (
                  <S.Badge key={value}>
                    {catalogs.optionLabel(catalogs.businessModels, value)}
                  </S.Badge>
                ))}
              </S.Row>
              <S.Muted>
                <MapPinIcon size={16} /> {data.cityName} / {data.state}
              </S.Muted>
              <S.Row>
                <ExternalLink url={data.website}>Site</ExternalLink>
                <ExternalLink url={data.linkedin}>LinkedIn</ExternalLink>
                <ExternalLink url={data.instagram}>Instagram</ExternalLink>
                {data.otherLinks.map((link, index) => (
                  <ExternalLink key={link.id} url={link.url}>
                    Canal {index + 1}
                  </ExternalLink>
                ))}
              </S.Row>
            </S.Card>
            <S.Card>
              <S.Badge>Em avaliação · simulação</S.Badge>
              <h2>
                Seu perfil está quase pronto para entrar no ecossistema do
                Juntaí!
              </h2>
              <p>
                Esta é a prévia de como seu perfil aparecerá durante a
                avaliação. O envio para a equipe de moderação será habilitado
                com a integração da plataforma.
              </p>
              <S.Row>
                <S.Badge>
                  <CheckCircleIcon size={18} />
                  Cadastro concluído
                </S.Badge>
                <S.Badge>2. Em avaliação</S.Badge>
                <S.Muted>3. Perfil aprovado</S.Muted>
              </S.Row>
              <Button $variant="secondary" onClick={() => edit('review')}>
                Editar meu perfil
              </Button>
            </S.Card>
            <S.Card>
              <header>
                <h2>Seu perfil está {completeness?.percent}% completo</h2>
              </header>
              <S.Progress
                value={completeness?.percent}
                max={100}
                aria-label="Completude do perfil"
              />
              <p>
                Uma apresentação completa ajuda futuros parceiros a conhecer
                vocês.
              </p>
              <S.Muted>
                Proporção de seções preenchidas; não é uma pontuação de
                compatibilidade.
              </S.Muted>
              <S.Row>
                {completeness?.missing.map((item) => (
                  <Button
                    key={item.label}
                    $variant="quiet"
                    onClick={() => edit(item.step)}
                  >
                    Completar {item.label.toLowerCase()}
                  </Button>
                ))}
              </S.Row>
            </S.Card>
            <S.Grid>
              {section(
                'Sobre a startup',
                'market',
                <>
                  <h3>O problema</h3>
                  <p>{data.problem || empty}</p>
                  <h3>Nossa solução</h3>
                  <p>{data.solution || empty}</p>
                  <h3>Segmentos</h3>
                  <p>
                    {labels(catalogs.segments, [
                      data.segment,
                      ...data.secondarySegments,
                    ])}
                  </p>
                </>,
              )}
              {section(
                'Modelo de negócio e mercado',
                'market',
                <>
                  <h3>Como o negócio funciona</h3>
                  <p>{labels(catalogs.businessModels, data.businessModels)}</p>
                  <h3>Quem atendemos</h3>
                  <p>{data.targetMarket || empty}</p>
                  <h3>Atuação atual</h3>
                  <p>{labels(catalogs.regions, data.operatingRegions)}</p>
                  <h3>Onde queremos crescer</h3>
                  <p>{labels(catalogs.regions, data.targetRegions)}</p>
                  <Button $variant="quiet" onClick={() => edit('location')}>
                    Editar localização e atuação
                  </Button>
                </>,
              )}
            </S.Grid>
            {section(
              'Tração e momento do negócio',
              'traction',
              <>
                <S.Metrics>
                  {[
                    [
                      'Clientes',
                      data.hideCustomers
                        ? 'Não divulgado'
                        : (data.customers?.toLocaleString('pt-BR') ?? empty),
                    ],
                    [
                      'Faturamento mensal',
                      data.revenue === 'undisclosed'
                        ? 'Não divulgado'
                        : catalogs.optionLabel(
                            catalogs.revenueRanges,
                            data.revenue,
                          ) || empty,
                    ],
                    [
                      'Crescimento',
                      data.growthPercent === null
                        ? empty
                        : `${data.growthPercent.toLocaleString('pt-BR')}% ${data.growthPeriod === 'monthly' ? 'ao mês' : 'ao ano'} · ${data.growthMetric === 'revenue' ? 'receita' : 'clientes'}`,
                    ],
                    [
                      'Equipe',
                      catalogs.optionLabel(catalogs.teamSizes, data.teamSize) ||
                        empty,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      {label}
                      <strong>{value}</strong>
                    </div>
                  ))}
                </S.Metrics>
                {data.growthNotes && <p>{data.growthNotes}</p>}
              </>,
            )}
            <S.Grid>
              {section(
                'O que estamos buscando',
                'investment',
                <>
                  <S.Row>
                    {data.needs.map((value) => (
                      <S.Badge key={value}>
                        {catalogs.optionLabel(catalogs.needs, value)}
                      </S.Badge>
                    ))}
                  </S.Row>
                  <h3>Investimento</h3>
                  <p>
                    {data.seekingInvestment === 'yes' && data.capital !== null
                      ? data.capital.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : catalogs.optionLabel(
                          catalogs.seekingInvestment,
                          data.seekingInvestment,
                        ) || empty}
                  </p>
                  {data.seekingInvestment === 'yes' && (
                    <>
                      <h3>Finalidade do capital</h3>
                      <p>
                        {labels(
                          catalogs.investmentPurposes,
                          data.investmentPurposes,
                        )}
                      </p>
                    </>
                  )}
                </>,
              )}
              {section(
                'Parceiros que queremos encontrar',
                'investment',
                <>
                  <h3>
                    {catalogs.optionLabel(
                      catalogs.partnerTypes,
                      data.partnerType,
                    )}
                  </h3>
                  <p>{labels(catalogs.expertise, data.expertise)}</p>
                  <h3>Regiões de interesse</h3>
                  <p>{labels(catalogs.regions, data.partnerRegions)}</p>
                  {data.partnerType !== 'mentor' && (
                    <>
                      <h3>Estágios apoiados</h3>
                      <p>{labels(catalogs.stages, data.partnerStages)}</p>
                    </>
                  )}
                  <p>{data.preferences}</p>
                  <S.Muted>
                    <LockSimpleIcon size={16} /> O matchmaking será liberado
                    após a aprovação do perfil.
                  </S.Muted>
                </>,
              )}
            </S.Grid>
            {section(
              'Nosso pitch',
              'pitch',
              <>
                <p>{data.pitchText || empty}</p>
                <S.Row>
                  {saved.attachment ? (
                    <PresentationLink file={saved.attachment} />
                  ) : (
                    <S.Muted>Apresentação ainda não adicionada.</S.Muted>
                  )}
                  <ExternalLink url={data.videoUrl}>
                    Assistir ao vídeo do pitch
                  </ExternalLink>
                </S.Row>
              </>,
            )}
            {section(
              'Business Model Canvas',
              'pitch',
              <S.CanvasGrid>
                {catalogs.canvasFields.map((field) => (
                  <button
                    key={field.value}
                    onClick={() =>
                      setDialog({
                        title: field.label,
                        content: (
                          <>
                            <p
                              style={{
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {data.canvas[field.value] || empty}
                            </p>
                            <Button
                              $variant="secondary"
                              onClick={() => edit('pitch')}
                            >
                              Editar Canvas
                            </Button>
                          </>
                        ),
                      })
                    }
                  >
                    <strong>{field.label}</strong>
                    <span>
                      {data.canvas[field.value] ||
                        'Preencha para contar mais sobre o negócio.'}
                    </span>
                  </button>
                ))}
              </S.CanvasGrid>,
            )}
            <S.Card>
              <h2>Dados usados para encontrar conexões</h2>
              <p>
                Segmento, estágio, capital procurado, modelo de negócio, regiões
                e necessidades poderão ajudar a encontrar investidores e
                mentores com interesses próximos aos seus, conforme seus
                consentimentos.
              </p>
              <S.Muted>
                Nesta prévia, nenhum algoritmo de recomendação é executado.
              </S.Muted>
            </S.Card>
            <S.Row>
              <Button onClick={() => edit('review')}>Editar perfil</Button>
              <Button
                $variant="secondary"
                onClick={() =>
                  setDialog({
                    title: 'Prévia do perfil público',
                    content: publicPreview,
                  })
                }
              >
                Visualizar perfil público
              </Button>
            </S.Row>
          </>
        )}
      </S.Main>
      <ContentDialog
        open={dialog !== null}
        title={dialog?.title ?? ''}
        onClose={() => setDialog(null)}
      >
        {dialog?.content}
      </ContentDialog>
      {editing && saved && (
        <ProfileEditor
          saved={saved}
          step={editing}
          onSaved={setSaved}
          onClose={() => setEditing(null)}
        />
      )}
    </S.Layout>
  );
}
