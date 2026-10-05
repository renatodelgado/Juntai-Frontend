import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PencilSimpleIcon,
  MapPinIcon,
  CheckCircleIcon,
  EyeIcon,
  HandshakeIcon,
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import type { SavedDraft } from '@/features/startup-onboarding/services/draftStorage';
import { loadProfile, logout } from '@/features/auth/services/profiles';
import { ProfileEditor } from '../components/ProfileEditor';
import { PresentationLink } from '../components/PresentationLink';
import { steps, type StepId } from '@/features/startup-onboarding/data/steps';
import * as catalogs from '@/features/startup-onboarding/data/catalogs';
import { profileCompleteness, safeLink } from '../model/profile';
import * as S from './Profile.styles';
import { moderation } from '@/features/dashboard/model/dashboard';
import { CanvasBoard } from '@/features/startup-onboarding/components/CanvasBoard';
import { LocalizedEditor } from '../components/LocalizedEditor';
import { localizedLabels, type LocalizedTarget } from '../model/localized';

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
  const [localized, setLocalized] = useState<LocalizedTarget | null>(null);
  const [error, setError] = useState(false);
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<StepId | null>(() => {
    const requested = params.get('editar');
    return steps.some((step) => step.id === requested && step.id !== 'review')
      ? (requested as StepId)
      : null;
  });
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
        setSaved(value);
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
          <S.CompletionActions>
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
          </S.CompletionActions>
        ),
      });
    } else {
      setDialog(null);
      setEditing(step);
    }
  }
  function editLocal(target: LocalizedTarget) {
    setDialog(null);
    setEditing(null);
    setLocalized(target);
  }
  function localLabel(target: keyof typeof localizedLabels) {
    return (
      <S.Row style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
        <h3 style={{ margin: 0 }}>{localizedLabels[target]}</h3>
        <S.EditButton
          aria-label={`Editar ${localizedLabels[target]}`}
          onClick={() => editLocal(target)}
        >
          <PencilSimpleIcon size={16} aria-hidden="true" />
        </S.EditButton>
      </S.Row>
    );
  }
  function editSection(title: string, step: StepId) {
    const groups: Record<string, (keyof typeof localizedLabels)[]> = {
      'Sobre a startup': ['problem', 'solution'],
      'O que estamos buscando': ['capital', 'investmentPurposes', 'needs'],
      'Nosso pitch': ['pitchText'],
    };
    if (title === 'Business Model Canvas' && saved) {
      setDialog({
        title: 'Escolha um bloco do Canvas',
        content: (
          <CanvasBoard
            canvas={saved.data.canvas}
            onEdit={(field) => editLocal(`canvas:${field.value}`)}
          />
        ),
      });
    } else if (groups[title]?.length === 1) editLocal(groups[title][0]!);
    else if (groups[title])
      setDialog({
        title: 'O que você quer editar?',
        content: (
          <S.CompletionActions>
            {groups[title].map((target) => (
              <Button key={target} onClick={() => editLocal(target)}>
                {localizedLabels[target]}
              </Button>
            ))}
          </S.CompletionActions>
        ),
      });
    else edit(step);
  }
  function section(title: string, step: StepId, content: ReactNode) {
    return (
      <S.Card>
        <header>
          <h2>{title}</h2>
          <S.EditButton
            onClick={() => editSection(title, step)}
            aria-label={`Editar ${title}`}
          >
            <PencilSimpleIcon size={18} aria-hidden="true" />
          </S.EditButton>
        </header>
        {content}
      </S.Card>
    );
  }
  const data = saved?.data;
  const completeness = data
    ? profileCompleteness(data, saved.attachment)
    : null;
  const name = data?.name || 'Sua startup';
  const businessModel = data?.primaryModel || data?.businessModels[0] || '';
  const status = moderation(saved?.statusModeracao ?? '');
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  const publicPreview = data && (
    <>
      <h2>{name}</h2>
      {(data.logoUrl || data.logo) && (
        <S.Avatar>
          <img src={data.logoUrl || data.logo} alt={`Logo de ${name}`} />
        </S.Avatar>
      )}
      <p>{data.description}</p>
      <h3>O que fazemos</h3>
      <p>{data.solution || empty}</p>
      <h3>Nosso mercado</h3>
      <p>{data.targetMarket || empty}</p>
      <h3>Pitch</h3>
      <p>{data.pitchText || empty}</p>
      {data.apresentacaoUrl ? (
        <ExternalLink url={data.apresentacaoUrl}>
          Baixar apresentação
        </ExternalLink>
      ) : saved?.attachment ? (
        <PresentationLink file={saved.attachment} />
      ) : null}
      <h3>Equipe</h3>
      <p>
        {data.exactTeamSize !== null ? `${data.exactTeamSize} pessoas` : empty}
      </p>
      <S.Muted>Prévia de apresentação. Este perfil não está publicado.</S.Muted>
    </>
  );
  return (
    <S.Layout>
      <ProfileSidebar
        profilePath="/startup/perfil"
        approved={status.approved}
        name={name}
        subtitle="Startup"
        status={status.badge}
        onLogout={() => {
          logout();
          void navigate('/login', { replace: true });
        }}
        onSettings={() =>
          setDialog({
            title: 'Configurações do perfil',
            content: (
              <>
                <p>
                  Alterações no perfil ficam salvas neste navegador e ainda não
                  são enviadas para sua conta.
                </p>
                <Button onClick={() => edit('consent')}>
                  Revisar consentimentos
                </Button>
              </>
            ),
          })
        }
      />
      <S.Main>
        <PageHeader
          title="Meu perfil"
          subtitle="Apresente sua startup, sua solução e os próximos passos do negócio."
        />
        {loading ? (
          <S.Card role="status">Preparando seu perfil…</S.Card>
        ) : !data || !saved ? (
          <S.Card role="alert">
            <h1>
              {error
                ? 'Não conseguimos abrir seu perfil'
                : 'Preparando seu acesso'}
            </h1>
            <p>Tente recarregar a página. Seus dados não foram removidos.</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </S.Card>
        ) : (
          <>
            <S.ProfileColumns>
              <S.PrimaryColumn>
                <S.IdentityCard>
                  <S.Row>
                    <S.Avatar>
                      {data.logoUrl || data.logo ? (
                        <img
                          src={data.logoUrl || data.logo}
                          alt={`Logo de ${name}`}
                        />
                      ) : (
                        <span aria-hidden="true">{initials}</span>
                      )}
                    </S.Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2>{name}</h2>
                      <S.Row>
                        <S.Badge>
                          {catalogs.optionLabel(
                            catalogs.segments,
                            data.segment,
                          )}
                        </S.Badge>
                        <S.Badge>
                          {catalogs.optionLabel(catalogs.stages, data.stage)}
                        </S.Badge>
                        {businessModel && (
                          <S.Badge>
                            {catalogs.optionLabel(
                              catalogs.businessModels,
                              businessModel,
                            )}
                          </S.Badge>
                        )}
                      </S.Row>
                      <S.Muted>
                        <MapPinIcon size={14} aria-hidden="true" />{' '}
                        {data.cityName && data.state
                          ? `${data.cityName}, ${data.state}`
                          : 'Localização ainda não informada'}
                      </S.Muted>
                    </div>
                    <Button
                      $variant="secondary"
                      onClick={() =>
                        setDialog({
                          title: 'Prévia do perfil público',
                          content: publicPreview,
                        })
                      }
                    >
                      <EyeIcon size={18} aria-hidden="true" />
                      Visualizar perfil público
                    </Button>
                  </S.Row>
                  {data.description && <p>{data.description}</p>}
                </S.IdentityCard>
                <S.Grid>
                  <S.StatusCard $status={saved.statusModeracao}>
                    <S.Badge>{status.badge}</S.Badge>
                    <h2>{status.title}</h2>
                    <p>{status.description}</p>
                    <S.Row>
                      <S.Badge>
                        <CheckCircleIcon size={16} aria-hidden="true" />
                        Cadastro concluído
                      </S.Badge>
                      <Button
                        $variant="secondary"
                        onClick={() => edit('review')}
                      >
                        Editar meu perfil
                      </Button>
                    </S.Row>
                  </S.StatusCard>
                  <S.Card>
                    <header>
                      <h2>Complete seu perfil</h2>
                      <S.Badge>{completeness?.percent}%</S.Badge>
                    </header>
                    <S.Progress
                      value={completeness?.percent}
                      max={100}
                      aria-label="Completude do perfil"
                    />
                    <S.Muted>
                      Seções preenchidas no seu perfil, incluindo o que você
                      salvou neste navegador.
                    </S.Muted>
                    <S.CompletionActions>
                      {completeness?.missing.map((item) => (
                        <Button
                          key={item.label}
                          $variant="quiet"
                          onClick={() => edit(item.step)}
                        >
                          Completar {item.label.toLowerCase()}
                        </Button>
                      ))}
                    </S.CompletionActions>
                    {completeness?.percent === 100 && (
                      <p>As seções do seu perfil estão preenchidas.</p>
                    )}
                  </S.Card>
                </S.Grid>
                {section(
                  'Nosso pitch',
                  'pitch',
                  <>
                    <S.PitchQuote>
                      {data.pitchText ||
                        'Conte em poucas palavras o que torna sua startup relevante.'}
                    </S.PitchQuote>
                    <S.Row>
                      {data.apresentacaoUrl ? (
                        <ExternalLink url={data.apresentacaoUrl}>
                          Baixar apresentação
                        </ExternalLink>
                      ) : saved.attachment ? (
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
                <S.Grid>
                  {section(
                    'Sobre a startup',
                    'market',
                    <>
                      {localLabel('problem')}
                      <p>{data.problem || empty}</p>
                      {localLabel('solution')}
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
                      <p>
                        {catalogs.optionLabel(
                          catalogs.businessModels,
                          businessModel,
                        )}
                      </p>
                      {localLabel('targetMarket')}
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
                <S.Grid>
                  {section(
                    'Tração e momento do negócio',
                    'traction',
                    <>
                      <S.Metrics>
                        {[
                          [
                            'Clientes',
                            data.customers?.toLocaleString('pt-BR') ?? empty,
                          ],
                          [
                            'Faturamento mensal',
                            data.monthlyRevenue === null
                              ? empty
                              : data.monthlyRevenue.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }),
                          ],
                          [
                            'Crescimento',
                            data.growthPercent === null
                              ? empty
                              : `${data.growthPercent.toLocaleString('pt-BR')}% · ${catalogs.growthLabel(data.growthPeriod, data.growthMetric)}`,
                          ],
                          [
                            'Equipe',
                            data.exactTeamSize != null
                              ? `${data.exactTeamSize} pessoas`
                              : empty,
                          ],
                        ].map(([title, value]) => (
                          <div key={title}>
                            {title}
                            <strong>{value}</strong>
                          </div>
                        ))}
                      </S.Metrics>
                      {data.growthNotes && <p>{data.growthNotes}</p>}
                    </>,
                  )}
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
                      {localLabel('capital')}
                      <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {data.capital !== null
                          ? data.capital.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })
                          : empty}
                      </p>
                      <>
                        {localLabel('investmentPurposes')}
                        <p>
                          {labels(
                            catalogs.investmentPurposes,
                            data.investmentPurposes,
                          )}
                        </p>
                      </>
                    </>,
                  )}
                </S.Grid>
                {section(
                  'Business Model Canvas',
                  'pitch',
                  <CanvasBoard
                    canvas={data.canvas}
                    onEdit={(field) => editLocal(`canvas:${field.value}`)}
                  />,
                )}
              </S.PrimaryColumn>
              <S.SupportColumn>
                <S.FeatureCard>
                  <HandshakeIcon size={28} aria-hidden="true" />
                  <h2>Dados para conexões</h2>
                  <p>
                    Segmento, estágio, capital procurado, modelo de negócio e
                    necessidades ajudam a apresentar sua startup aos parceiros
                    certos.
                  </p>
                  <S.Muted>
                    As recomendações estarão disponíveis após aprovação e
                    integração da plataforma.
                  </S.Muted>
                </S.FeatureCard>
                {section(
                  'Links e apresentação',
                  'about',
                  <>
                    <S.Row>
                      <ExternalLink url={data.website}>Site</ExternalLink>
                      <ExternalLink url={data.linkedin}>LinkedIn</ExternalLink>
                      <ExternalLink url={data.instagram}>
                        Instagram
                      </ExternalLink>
                      {data.otherLinks.map((link, index) => (
                        <ExternalLink key={link.id} url={link.url}>
                          Canal {index + 1}
                        </ExternalLink>
                      ))}
                    </S.Row>
                    {!data.website &&
                      !data.linkedin &&
                      !data.instagram &&
                      !data.otherLinks.length && (
                        <S.Muted>
                          Adicione os canais que ajudam a conhecer sua startup.
                        </S.Muted>
                      )}
                  </>,
                )}
                <S.Card>
                  <h2>Seu próximo passo</h2>
                  <S.Muted>
                    {completeness?.missing.length
                      ? 'Complete as informações pendentes para apresentar melhor seu negócio.'
                      : 'Mantenha suas informações atualizadas para refletir o momento da startup.'}
                  </S.Muted>
                  <Button $variant="quiet" onClick={() => edit('review')}>
                    Revisar informações
                  </Button>
                </S.Card>
              </S.SupportColumn>
            </S.ProfileColumns>
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
      {localized && saved && (
        <LocalizedEditor
          key={localized}
          saved={saved}
          target={localized}
          onSaved={setSaved}
          onClose={() => setLocalized(null)}
        />
      )}
      {editing && saved && (
        <ProfileEditor
          saved={saved}
          step={editing}
          onSaved={setSaved}
          onClose={() => {
            setEditing(null);
            if (params.has('editar')) {
              const next = new URLSearchParams(params);
              next.delete('editar');
              setParams(next, { replace: true });
            }
          }}
        />
      )}
    </S.Layout>
  );
}
