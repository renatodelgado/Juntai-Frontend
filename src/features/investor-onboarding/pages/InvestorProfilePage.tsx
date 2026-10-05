import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  CheckCircleIcon,
  HandshakeIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
  ArrowRightIcon,
  EyeIcon,
} from '@phosphor-icons/react';
import { loadInvestorProfile, logout } from '@/features/auth/services/profiles';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import * as S from '@/shared/components/profile/Profile.styles';
import { investorTheme } from '@/shared/styles/theme';
import * as catalogs from '@/features/startup-onboarding/data/catalogs';
import * as model from '../model/investor';
import {
  investorCompleteness,
  statusLabels,
  statusContent,
  money,
} from '../model/profile';
import { InvestorEditor } from '../components/InvestorEditor';
import {
  InvestorIdentity,
  InvestorPublicPreview,
  ProfileTags,
} from '../components/InvestorPublicPreview';
import { InvestorActivity } from '../components/InvestorActivity';

export function InvestorProfilePage() {
  const [saved, setSaved] = useState<model.SavedInvestor | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<model.InvestorStep | null>(null);
  const [dialog, setDialog] = useState<
    'sections' | 'public' | 'settings' | 'moderation' | null
  >(null);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    loadInvestorProfile()
      .then((profile) => {
        if (!active) return;
        if (profile) setSaved(profile);
        else void navigate('/login', { replace: true });
      })
      .catch(() => {
        if (active)
          setError(
            'Não conseguimos abrir seu perfil. Tente recarregar a página.',
          );
      });
    return () => {
      active = false;
    };
  }, [navigate]);
  function edit(step: model.InvestorStep) {
    setDialog(null);
    setEditing(step);
  }
  function section(
    title: string,
    step: model.InvestorStep,
    children: ReactNode,
    label?: string,
  ) {
    return (
      <S.Card>
        <header>
          <h2>{title}</h2>
          <S.EditButton
            aria-label={label ?? `Editar ${title}`}
            onClick={() => edit(step)}
          >
            <PencilSimpleIcon size={18} aria-hidden="true" />
          </S.EditButton>
        </header>
        {children}
      </S.Card>
    );
  }
  const data = saved?.data;
  const mentor = data?.participation === 'mentor';
  const completeness = data ? investorCompleteness(data) : null;
  const status = saved ? statusContent[saved.status] : null;
  const tags = (options: readonly catalogs.Option[], values: string[]) => (
    <ProfileTags options={options} values={values} />
  );
  return (
    <ThemeProvider theme={investorTheme}>
      <S.Layout $audience="investor">
        <ProfileSidebar
          profilePath="/investidor/perfil"
          approved={saved?.status === 'approved'}
          name={data?.name}
          subtitle={mentor ? 'Mentor' : 'Investidor'}
          status={saved ? statusLabels[saved.status] : 'Meu perfil'}
          onSettings={() => setDialog('settings')}
          onLogout={() => {
            logout();
            void navigate('/login', { replace: true });
          }}
        />
        <S.Main>
          <PageHeader
            title="Meu perfil"
            subtitle="Apresente sua experiência, seus interesses e as conexões que você procura."
          />
          {error ? (
            <S.Card role="alert">{error}</S.Card>
          ) : !data || !saved ? (
            <S.Card role="status">Preparando seu perfil…</S.Card>
          ) : (
            <>
              <S.ProfileColumns>
                <S.PrimaryColumn>
                  <S.IdentityCard>
                    <InvestorIdentity data={data} compact />
                    <Button
                      $variant="secondary"
                      onClick={() => setDialog('public')}
                    >
                      <EyeIcon size={18} aria-hidden="true" /> Ver como startup
                    </Button>
                  </S.IdentityCard>
                  <S.Grid>
                    <S.StatusCard $status={saved.status}>
                      <S.Badge>{statusLabels[saved.status]}</S.Badge>
                      <h2>{status?.title}</h2>
                      <p>{status?.description}</p>
                      <S.Row>
                        <S.Badge>
                          <CheckCircleIcon size={18} aria-hidden="true" />{' '}
                          Cadastro concluído
                        </S.Badge>
                        <Button
                          $variant="secondary"
                          onClick={() => setDialog('sections')}
                        >
                          Editar perfil
                        </Button>
                      </S.Row>
                      {(saved.status === 'changes_requested' ||
                        saved.status === 'rejected') && (
                        <S.Row>
                          <Button
                            $variant="secondary"
                            onClick={() => setDialog('moderation')}
                          >
                            Ver solicitações
                          </Button>
                          <Button onClick={() => setDialog('sections')}>
                            Corrigir perfil
                          </Button>
                        </S.Row>
                      )}
                    </S.StatusCard>
                    <S.Card>
                      <header>
                        <h2>
                          {completeness?.percent === 100
                            ? 'Seu perfil está completo'
                            : `Seu perfil está ${completeness?.percent}% completo`}
                        </h2>
                        <S.Badge>{completeness?.percent}%</S.Badge>
                      </header>
                      <S.Progress
                        value={completeness?.percent}
                        max={100}
                        aria-label="Completude do perfil"
                      />
                      <p>
                        Perfis mais completos ajudam a apresentar melhor sua
                        experiência e seus interesses.
                      </p>
                      <S.Muted>
                        Seções preenchidas, sem pontuação de compatibilidade.
                      </S.Muted>
                      {completeness?.missing.slice(0, 4).map((field) => (
                        <Button
                          key={field.label}
                          $variant="quiet"
                          onClick={() => edit(field.step)}
                        >
                          Adicionar {field.label}
                          <ArrowRightIcon size={16} aria-hidden="true" />
                        </Button>
                      ))}
                    </S.Card>
                  </S.Grid>
                  <S.Grid>
                    {section(
                      'Sobre você',
                      'about',
                      <>
                        <h3>Atuação</h3>
                        <p>
                          {catalogs.optionLabel(
                            model.participation,
                            data.participation,
                          )}
                        </p>
                        <Button
                          $variant="quiet"
                          onClick={() => edit('participation')}
                        >
                          Editar forma de participação
                        </Button>
                        <h3>Localização</h3>
                        <p>
                          {data.cityName && data.state
                            ? `${data.cityName}, ${data.state}`
                            : 'Não informado'}
                        </p>
                        <h3>Sobre</h3>
                        <p>{data.bio || 'Não informado'}</p>
                      </>,
                    )}
                    {section(
                      'O que me interessa',
                      'interests',
                      <>
                        <p>
                          Características das startups que você gostaria de
                          conhecer.
                        </p>
                        <h3>Segmentos</h3>
                        {tags(catalogs.segments, data.segments)}
                        <h3>Estágios</h3>
                        {tags(catalogs.stages, data.stages)}
                        <Button $variant="quiet" onClick={() => edit('stages')}>
                          Editar estágios de interesse
                        </Button>
                      </>,
                    )}
                  </S.Grid>
                  {mentor
                    ? section(
                        'Atuação como mentor',
                        'availability',
                        <>
                          <p>
                            Sua experiência e seu tempo podem ajudar
                            empreendedores a dar os próximos passos.
                          </p>
                          {tags(model.expertise, data.expertise)}
                          <S.Metrics>
                            <div>
                              Frequência
                              <strong>
                                {catalogs.optionLabel(
                                  model.frequencies,
                                  data.frequency,
                                ) || 'Não informado'}
                              </strong>
                            </div>
                            <div>
                              Aceita mentorias
                              <strong>
                                {data.acceptsMentoring === null
                                  ? 'Não informado'
                                  : data.acceptsMentoring
                                    ? 'Sim'
                                    : 'Não'}
                              </strong>
                            </div>
                          </S.Metrics>
                        </>,
                      )
                    : section(
                        'Meu perfil de investimento',
                        'investment',
                        <>
                          <S.Metrics>
                            <div>
                              Faixa habitual de investimento
                              <strong>
                                {money(data.ticketMin)} —{' '}
                                {money(data.ticketMax)}
                              </strong>
                            </div>
                            <div>
                              Perfil de risco
                              <strong>
                                {catalogs.optionLabel(model.risks, data.risk) ||
                                  'Não informado'}
                              </strong>
                            </div>
                            <div>
                              Novos investimentos
                              <strong>
                                {data.openInvestment === 'yes'
                                  ? 'Aberto a oportunidades'
                                  : catalogs.optionLabel(
                                      model.openness,
                                      data.openInvestment,
                                    ) || 'Não informado'}
                              </strong>
                            </div>
                          </S.Metrics>
                          <S.Row>
                            <Button
                              $variant="quiet"
                              onClick={() => edit('experience')}
                            >
                              Editar perfil de risco
                            </Button>
                            <Button
                              $variant="quiet"
                              onClick={() => edit('availability')}
                            >
                              Atualizar disponibilidade para investir
                            </Button>
                          </S.Row>
                        </>,
                      )}
                  <S.Grid>
                    {section(
                      'Modelos de negócio de interesse',
                      'market',
                      <>
                        <p>
                          Modelos de negócio que você indicou como
                          interessantes.
                        </p>
                        {tags(catalogs.businessModels, data.businessModels)}
                      </>,
                    )}
                    {section(
                      'Regiões de interesse',
                      'market',
                      <>
                        <p>Onde você gostaria de encontrar oportunidades.</p>
                        {tags(catalogs.regions, data.regions)}
                      </>,
                    )}
                    {section(
                      'O que eu sei fazer',
                      'experience',
                      <>
                        <p>
                          Experiência que você pode compartilhar com uma
                          startup.
                        </p>
                        {tags(model.expertise, data.expertise)}
                      </>,
                    )}
                    {section(
                      'Minha experiência com startups',
                      'history',
                      data.history === 'yes' ? (
                        <>
                          {!mentor && (
                            <>
                              <h3>Investimentos realizados</h3>
                              <p>
                                {catalogs.optionLabel(
                                  model.counts,
                                  data.investmentCount,
                                ) || 'Ainda não informado'}
                              </p>
                            </>
                          )}
                          <p>
                            {data.experience ||
                              'Adicione mais detalhes sobre sua experiência.'}
                          </p>
                          <h3>Setores em que já atuei</h3>
                          {tags(catalogs.segments, data.previousSectors)}
                        </>
                      ) : (
                        <>
                          <p>
                            {data.history === 'no'
                              ? 'Você ainda não investiu ou atuou com startups. Sua próxima experiência pode começar aqui.'
                              : data.history === 'undisclosed'
                                ? 'Você preferiu não informar seu histórico.'
                                : 'Você ainda não adicionou seu histórico.'}
                          </p>
                          <Button
                            $variant="quiet"
                            onClick={() => edit('history')}
                          >
                            Adicionar experiência
                          </Button>
                        </>
                      ),
                    )}
                  </S.Grid>
                  {section(
                    'Como posso ajudar uma startup',
                    'offers',
                    <S.Grid>
                      {model.offers
                        .filter((offer) => data.offers.includes(offer.value))
                        .map((offer) => (
                          <div key={offer.value}>
                            <S.Badge>
                              <CheckCircleIcon size={18} aria-hidden="true" />
                              {offer.label}
                            </S.Badge>
                            <p>{offer.description}</p>
                          </div>
                        ))}
                      {!data.offers.length && (
                        <p>Adicione as contribuições que você pode oferecer.</p>
                      )}
                    </S.Grid>,
                  )}
                  {section(
                    'Minha disponibilidade',
                    'availability',
                    <>
                      <S.Metrics>
                        <div>
                          Tempo disponível
                          <strong>
                            {catalogs.optionLabel(
                              model.availabilityOptions,
                              data.availability,
                            )}
                          </strong>
                        </div>
                        <div>
                          Frequência
                          <strong>
                            {catalogs.optionLabel(
                              model.frequencies,
                              data.frequency,
                            ) || 'Não informado'}
                          </strong>
                        </div>
                        <div>
                          Aceita mentorias
                          <strong>
                            {data.acceptsMentoring === null
                              ? 'Não informado'
                              : data.acceptsMentoring
                                ? 'Sim'
                                : 'Não'}
                          </strong>
                        </div>
                      </S.Metrics>
                      <h3>Formatos</h3>
                      {tags(model.interactions, data.interactions)}
                      {!mentor && (
                        <p>
                          Novos investimentos:{' '}
                          {catalogs.optionLabel(
                            model.openness,
                            data.openInvestment,
                          ) || 'Não informado'}
                        </p>
                      )}
                      <Button
                        $variant="secondary"
                        onClick={() => edit('availability')}
                      >
                        Atualizar disponibilidade
                      </Button>
                    </>,
                    'Editar Disponibilidade',
                  )}
                </S.PrimaryColumn>
                <S.SupportColumn>
                  <S.FeatureCard>
                    <HandshakeIcon size={30} aria-hidden="true" />
                    <h2>Dados para conexões</h2>
                    <p>
                      Seus interesses, sua experiência e sua disponibilidade
                      poderão ajudar a encontrar startups com objetivos em
                      comum.
                    </p>
                    <S.Muted>
                      Nesta prévia, nenhum algoritmo de recomendação é
                      executado.
                    </S.Muted>
                  </S.FeatureCard>
                  <S.Card>
                    <header>
                      <h2>Preferências</h2>
                      <S.EditButton
                        aria-label="Editar preferências"
                        onClick={() => edit('preferences')}
                      >
                        <PencilSimpleIcon size={18} aria-hidden="true" />
                      </S.EditButton>
                    </header>
                    <h3>Regiões de interesse</h3>
                    {tags(catalogs.regions, data.regions)}
                    <h3>Estágios apoiados</h3>
                    {tags(catalogs.stages, data.stages)}
                    <h3>Preferências adicionais</h3>
                    <p>{data.preferences || 'Ainda não informado'}</p>
                    <S.Muted>
                      <LockSimpleIcon size={16} aria-hidden="true" />{' '}
                      {saved.status === 'approved'
                        ? 'Matchmaking em preparação.'
                        : 'O matchmaking será liberado após aprovação e integração.'}
                    </S.Muted>
                  </S.Card>
                  <InvestorActivity events={saved.activity ?? []} />
                  <S.Card>
                    <h2>Seu perfil para startups</h2>
                    <p>
                      Confira como sua trajetória, seus interesses e suas
                      contribuições aparecem na prévia do perfil.
                    </p>
                    <Button
                      $variant="secondary"
                      onClick={() => setDialog('public')}
                    >
                      Visualizar perfil completo
                    </Button>
                  </S.Card>
                </S.SupportColumn>
              </S.ProfileColumns>
            </>
          )}
        </S.Main>
        <ContentDialog
          open={dialog !== null}
          title={
            dialog === 'public'
              ? 'Seu perfil para startups'
              : dialog === 'settings'
                ? 'Configurações do perfil'
                : dialog === 'moderation'
                  ? 'Solicitações da moderação'
                  : 'O que você quer atualizar?'
          }
          onClose={() => setDialog(null)}
        >
          {dialog === 'public' && data && <InvestorPublicPreview data={data} />}
          {dialog === 'sections' && (
            <S.Row>
              {model.investorSteps
                .filter((step) => !['review', 'preferences'].includes(step.id))
                .map((step) => (
                  <Button
                    key={step.id}
                    $variant="secondary"
                    onClick={() => edit(step.id)}
                  >
                    {step.label}
                  </Button>
                ))}
            </S.Row>
          )}
          {dialog === 'settings' && (
            <>
              <p>
                Seu perfil está vinculado à sua conta local neste navegador. As
                alterações são feitas aqui, sem voltar ao cadastro.
              </p>
              <Button $variant="secondary" onClick={() => edit('consent')}>
                Revisar consentimentos
              </Button>
            </>
          )}
          {dialog === 'moderation' &&
            (saved?.moderationNotes?.length ? (
              saved.moderationNotes.map((note, index) => (
                <p key={index}>{note}</p>
              ))
            ) : (
              <p>Nenhuma solicitação foi registrada nesta prévia.</p>
            ))}
        </ContentDialog>
        {saved && editing && (
          <InvestorEditor
            saved={saved}
            step={editing}
            onClose={() => setEditing(null)}
            onSaved={setSaved}
          />
        )}
      </S.Layout>
    </ThemeProvider>
  );
}
