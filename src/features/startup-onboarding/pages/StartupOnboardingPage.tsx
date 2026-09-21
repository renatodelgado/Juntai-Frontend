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
import { Input } from '@/shared/components/forms/Fields';
import {
  startupPayload,
  registerRemote,
  registrationError,
} from '@/features/auth/services/registration';
import { Stepper } from '@/shared/components/ui/Stepper';
import { useOnboarding } from '../hooks/useOnboarding';
import { steps, type StepId } from '../data/steps';
import {
  AboutStep,
  BusinessStep,
  MarketStep,
} from '../components/BusinessSteps';
import { LocationStep } from '../components/LocationStep';
import { TractionStep, InvestmentStep } from '../components/GrowthSteps';
import { PitchStep } from '../components/PresentationSteps';
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
  const [modal, setModal] = useState<'reset' | null>(null);
  const [finished, setFinished] = useState(false);
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
    if (accountBusy || form.busy || finished) return;
    if (form.current === 'consent') {
      if (form.validateAll()) void createAccount();
      else focusError();
    } else if (form.next()) {
      if (editing) {
        form.navigate('review');
        setEditing(false);
      }
    } else focusError();
  }
  async function createAccount() {
    setAccountError('');
    if (password !== confirmPassword) {
      setAccountError('As senhas precisam ser iguais.');
      return;
    }
    setAccountBusy(true);
    try {
      const payload = startupPayload(
        { ...form.data, seekingInvestment: 'yes' },
        email,
        password,
        {
          ownerName: form.data.ownerName,
          region: form.data.registrationRegion,
          primaryModel: form.data.primaryModel,
          monthlyRevenue: form.data.monthlyRevenue,
          teamSize: form.data.exactTeamSize,
        },
      );
      await registerRemote('startups', payload);
      setPassword('');
      setConfirmPassword('');
      setFinished(true);
    } catch (cause) {
      setAccountError(registrationError(cause));
    } finally {
      setAccountBusy(false);
    }
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
    pitch: <PitchStep form={form} />,
    review: (
      <ReviewStep data={form.data} attachment={form.attachment} onEdit={edit} />
    ),
    consent: (
      <>
        <ConsentStep form={form} />
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
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
      </>
    ),
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
            </div>
          </Header>
          {finished ? (
            <Content>
              <h1>Startup cadastrada!</h1>
              <p>Seu cadastro foi recebido. Entre para acessar seu perfil.</p>
              <Button as={Link} to="/login">
                Entrar na minha conta
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
                  <FormBody disabled={form.busy || accountBusy}>
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
            open={modal === 'reset'}
            busy={form.busy}
            title="Remover este rascunho?"
            confirmLabel="Remover rascunho"
            onClose={() => setModal(null)}
            onConfirm={() => {
              void form.reset().then((ok) => {
                if (ok) {
                  setModal(null);
                  setEditing(false);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setAccountError('');
                }
              });
            }}
          >
            <p>
              Os dados e a apresentação salvos neste navegador serão removidos.
            </p>
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
