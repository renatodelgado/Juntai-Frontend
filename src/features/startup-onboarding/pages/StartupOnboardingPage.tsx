import {
  RegistrationSyncScope,
  SyncLegend,
} from '@/shared/components/forms/RegistrationSync';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useBlocker, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FloppyDiskIcon,
  PlantIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import logo from '@/shared/assets/images/logo-txt.svg';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Input, Select, NumberInput } from '@/shared/components/forms/Fields';
import {
  apiRegions,
  startupPayload,
  registerRemote,
  registrationError,
} from '@/features/auth/services/registration';
import { businessModels } from '../data/catalogs';
import { Stepper } from '@/shared/components/ui/Stepper';
import { useOnboarding } from '../hooks/useOnboarding';
import { steps, type StepId } from '../data/steps';
import {
  AboutStep,
  BusinessStep,
  MarketStep,
} from '../components/BusinessSteps';
import { LocationStep } from '../components/LocationStep';
import {
  TractionStep,
  InvestmentStep,
  MatchingStep,
} from '../components/GrowthSteps';
import { PitchStep, TeamStep } from '../components/PresentationSteps';
import { ReviewStep } from '../components/ReviewStep';
import { ConsentStep } from '../components/ConsentStep';
import {
  Shell,
  JourneyBackground,
  DeleteAction,
  Header,
  JourneyLabel,
  Content,
  Intro,
  Actions,
  SaveMessage,
  ErrorSummary,
  FormBody,
  Notice,
} from './Onboarding.styles';

export function StartupOnboardingPage() {
  const form = useOnboarding();
  const [params] = useSearchParams();
  const initialStep = useRef(false);
  const [modal, setModal] = useState<'finish' | 'reset' | null>(null);
  const [finished, setFinished] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [region, setRegion] = useState('');
  const [primaryModel, setPrimaryModel] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [teamSize, setTeamSize] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);
  const [editing, setEditing] = useState(() =>
    steps.some(
      (step) =>
        step.id === params.get('etapa') &&
        step.id !== 'review' &&
        step.id !== 'consent',
    ),
  );
  const title = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const blocker = useBlocker(
    form.dirty && !form.busy && !accountBusy && !finished,
  );
  const index = steps.findIndex((step) => step.id === form.current);
  const current = steps[index]!;

  useEffect(() => {
    if (!form.loading) {
      title.current?.focus({ preventScroll: true });
      title.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [current.id, form.loading, finished]);

  useEffect(() => {
    if (form.loading || initialStep.current) return;
    initialStep.current = true;
    const requested = params.get('etapa');
    const step = steps.find((item) => item.id === requested);
    if (step) {
      form.navigate(step.id);
    }
  }, [form, params]);

  function focusError() {
    requestAnimationFrame(() =>
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus(),
    );
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (form.current === 'consent') {
      if (form.validateAll()) setModal('finish');
      else focusError();
    } else if (form.next()) {
      if (editing) {
        form.navigate('review');
        setEditing(false);
      }
    } else focusError();
  }
  function edit(step: StepId) {
    setEditing(true);
    form.navigate(step);
  }
  const components = {
    about: <AboutStep form={form} />,
    business: <BusinessStep form={form} />,
    market: <MarketStep form={form} />,
    location: <LocationStep form={form} />,
    traction: <TractionStep form={form} />,
    investment: <InvestmentStep form={form} />,
    matching: <MatchingStep form={form} />,
    pitch: <PitchStep form={form} />,
    team: <TeamStep form={form} />,
    review: (
      <ReviewStep data={form.data} attachment={form.attachment} onEdit={edit} />
    ),
    consent: <ConsentStep form={form} />,
  };

  return (
    <RegistrationSyncScope role="startup" data={form.data}>
      <JourneyBackground>
        <Shell>
          <Header>
            <Link to="/" aria-label="Juntaí! — início">
              <img src={logo} alt="Juntaí!" />
            </Link>
            <div>
              <JourneyLabel>
                <PlantIcon size={18} aria-hidden="true" />
                Perfil de startup
              </JourneyLabel>
              <span>Rascunho</span>
            </div>
          </Header>
          {finished ? (
            <Content>
              <h1>Startup cadastrada!</h1>
              <p>
                O servidor recebeu seu cadastro. O login e a edição online ainda
                não estão disponíveis. As informações complementares continuam
                no rascunho deste navegador.
              </p>
              <Button as={Link} to="/">
                Voltar ao início
              </Button>
            </Content>
          ) : form.loading ? (
            <Notice role="status">Preparando seu cadastro…</Notice>
          ) : (
            <>
              <Stepper
                steps={steps}
                current={form.current}
                completed={form.completed}
                onSelect={(id) => {
                  if (!form.busy) {
                    setEditing(false);
                    form.navigate(id as StepId);
                  }
                }}
              />
              <Content>
                <Intro>
                  <span>
                    Etapa {index + 1} de {steps.length} · {current.label}
                  </span>
                  <h1 ref={title} tabIndex={-1}>
                    {current.title}
                  </h1>
                  <p>{current.description}</p>
                </Intro>
                <SyncLegend />
                {form.storageError && (
                  <Notice role="alert">
                    {form.storageError}
                    <p>
                      Você ainda pode preencher o formulário. Use “Remover
                      rascunho” para descartar uma versão antiga.
                    </p>
                  </Notice>
                )}
                <form ref={formRef} noValidate onSubmit={submit}>
                  <FormBody disabled={form.busy}>
                    {Object.values(form.errors).some(Boolean) && (
                      <ErrorSummary role="alert">
                        <p>
                          Falta só ajustar algumas informações. Confira os
                          campos destacados abaixo.
                        </p>
                      </ErrorSummary>
                    )}
                    {components[form.current]}
                    <Actions>
                      <Button
                        type="button"
                        $variant="quiet"
                        onClick={() => void form.save()}
                      >
                        <FloppyDiskIcon size={20} aria-hidden="true" />
                        Salvar e continuar depois
                      </Button>
                      <div>
                        {index > 0 && (
                          <Button
                            type="button"
                            $variant="secondary"
                            onClick={() => {
                              const previous = steps[index - 1];
                              if (previous) {
                                setEditing(false);
                                form.navigate(previous.id);
                              }
                            }}
                          >
                            <ArrowLeftIcon size={18} aria-hidden="true" />
                            Voltar
                          </Button>
                        )}
                        <Button type="submit">
                          {form.current === 'consent'
                            ? 'Enviar cadastro'
                            : form.current === 'review'
                              ? 'Finalizar cadastro'
                              : editing
                                ? 'Salvar alterações e revisar'
                                : 'Continuar'}
                          <ArrowRightIcon size={18} aria-hidden="true" />
                        </Button>
                      </div>
                    </Actions>
                  </FormBody>
                </form>
                <SaveMessage role="status" aria-live="polite">
                  {form.busy
                    ? 'Salvando no navegador…'
                    : form.message ||
                      'Salvamento disponível apenas neste navegador.'}
                </SaveMessage>
                <DeleteAction>
                  <Button
                    type="button"
                    $variant="danger"
                    disabled={form.busy}
                    onClick={() => setModal('reset')}
                  >
                    <TrashIcon size={16} aria-hidden="true" />
                    Remover rascunho
                  </Button>
                </DeleteAction>
              </Content>
            </>
          )}
          <Modal
            open={modal !== null}
            busy={form.busy || accountBusy}
            title={
              modal === 'reset'
                ? 'Remover este rascunho?'
                : 'Crie seu acesso ao Juntaí!'
            }
            confirmLabel={
              modal === 'reset' ? 'Remover rascunho' : 'Criar conta'
            }
            onClose={() => setModal(null)}
            onConfirm={() => {
              if (accountBusy || finished) return;
              void (async () => {
                if (modal === 'reset') {
                  if (await form.reset()) {
                    setModal(null);
                    setFinished(false);
                    setEditing(false);
                  }
                } else {
                  setAccountError('');
                  if (password !== confirmPassword) {
                    setAccountError('As senhas precisam ser iguais.');
                    return;
                  }
                  setAccountBusy(true);
                  try {
                    const payload = startupPayload(form.data, email, password, {
                      ownerName,
                      region,
                      primaryModel,
                      monthlyRevenue,
                      teamSize,
                    });
                    if (!(await form.save())) return;
                    await registerRemote('startups', payload);
                    setPassword('');
                    setConfirmPassword('');
                    setModal(null);
                    setFinished(true);
                  } catch (cause) {
                    setAccountError(registrationError(cause));
                  } finally {
                    setAccountBusy(false);
                  }
                }
              })();
            }}
          >
            {modal === 'reset' ? (
              <p>
                Os dados e a apresentação salvos neste navegador serão
                removidos. Essa ação não pode ser desfeita.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <p>
                  Os dados compatíveis serão enviados para criar sua conta.
                  Fotos, links, apresentação, preferências e consentimentos
                  ficam apenas no rascunho deste navegador. O acesso e a edição
                  online ainda não estão disponíveis.
                </p>
                <Input
                  id="owner-name"
                  label="Nome completo do responsável"
                  required
                  value={ownerName}
                  onChange={(event) => setOwnerName(event.target.value)}
                />
                <Select
                  id="registration-region"
                  label="Região do cadastro"
                  required
                  options={apiRegions}
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                />
                {form.data.businessModels.length > 1 && (
                  <Select
                    id="primary-model"
                    label="Modelo de negócio principal"
                    required
                    options={businessModels.filter((item) =>
                      form.data.businessModels.includes(item.value),
                    )}
                    value={primaryModel}
                    onChange={(event) => setPrimaryModel(event.target.value)}
                  />
                )}
                {form.data.revenue !== 'undisclosed' &&
                  form.data.revenue !== 'none' && (
                    <NumberInput
                      id="monthly-revenue"
                      label="Faturamento mensal exato (R$)"
                      min={0}
                      step="0.01"
                      value={monthlyRevenue}
                      onValueChange={setMonthlyRevenue}
                      hint="A faixa escolhida não será convertida em um valor. Deixe vazio para não informar."
                    />
                  )}
                {form.data.teamSize !== '1' && (
                  <NumberInput
                    id="exact-team"
                    label="Número exato de pessoas na equipe"
                    min={1}
                    step={1}
                    value={teamSize}
                    onValueChange={setTeamSize}
                    hint="Deixe vazio para não enviar o tamanho da equipe."
                  />
                )}
                <Input
                  id="account-email"
                  label="E-mail de acesso"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Input
                  id="account-password"
                  label="Crie uma senha"
                  type="password"
                  required
                  minLength={6}
                  hint="Pelo menos 6 caracteres."
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Input
                  id="account-confirm"
                  label="Confirme a senha"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {accountError && <p role="alert">{accountError}</p>}
              </div>
            )}
            {form.message.startsWith('Não conseguimos') && (
              <p role="alert">{form.message}</p>
            )}
          </Modal>
          {blocker.state === 'blocked' && (
            <Modal
              open
              title="Sair sem salvar as alterações?"
              confirmLabel="Sair sem salvar"
              onClose={() => blocker.reset()}
              onConfirm={() => blocker.proceed()}
            >
              <p>
                As alterações desde o último salvamento serão perdidas. Volte ao
                cadastro e escolha “Salvar e continuar depois” para guardá-las.
              </p>
            </Modal>
          )}
        </Shell>
      </JourneyBackground>
    </RegistrationSyncScope>
  );
}
