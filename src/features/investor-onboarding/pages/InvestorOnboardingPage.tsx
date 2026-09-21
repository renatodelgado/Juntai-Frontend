import {
  RegistrationSyncScope,
  SyncLegend,
} from '@/shared/components/forms/RegistrationSync';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useBlocker } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { HandshakeIcon, CheckCircleIcon } from '@phosphor-icons/react';
import logo from '@/shared/assets/images/logo-txt.svg';
import { Stepper } from '@/shared/components/ui/Stepper';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Input, NumberInput } from '@/shared/components/forms/Fields';
import {
  Shell,
  Header,
  JourneyLabel,
  Content,
  Intro,
  Actions,
  SaveMessage,
  Fields,
} from '@/features/startup-onboarding/pages/Onboarding.styles';
import {
  investorPayload,
  registerRemote,
  registrationError,
} from '@/features/auth/services/registration';
import { useInvestor } from '../hooks/useInvestor';
import {
  investorSteps,
  validateInvestor,
  type InvestorStep,
} from '../model/investor';
import { InvestorFields } from '../components/InvestorFields';
import { InvestorBackground, investorTheme } from './Investor.styles';

export function InvestorOnboardingPage() {
  const form = useInvestor();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const ref = useRef<HTMLFormElement>(null);
  const blocker = useBlocker(
    form.dirty && !form.busy && !accountBusy && !finished,
  );
  const index = investorSteps.findIndex((step) => step.id === form.step);
  const current = investorSteps[index]!;
  useEffect(() => {
    if (!form.loading) title.current?.focus({ preventScroll: true });
  }, [form.loading, form.step, finished]);
  function focusError() {
    requestAnimationFrame(() =>
      ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    );
  }
  function edit(step: InvestorStep) {
    setEditing(true);
    form.navigate(step);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (accountBusy || finished) return;
    if (!form.validate()) {
      focusError();
      return;
    }
    if (form.step !== 'consent') {
      form.complete();
      form.navigate(editing ? 'review' : investorSteps[index + 1]!.id);
      setEditing(false);
      return;
    }
    const invalid = investorSteps.find(
      (step) => Object.keys(validateInvestor(step.id, form.data)).length,
    );
    if (invalid) {
      form.navigate(invalid.id);
      form.validate(invalid.id);
      focusError();
      return;
    }
    if (password !== confirmation) {
      setAccountError('As senhas precisam ser iguais.');
      return;
    }
    setAccountBusy(true);
    setAccountError('');
    try {
      const payload = investorPayload(
        form.data,
        email,
        password,
        form.data.experienceYears,
      );
      await registerRemote('investidores', payload);
      setPassword('');
      setConfirmation('');
      setFinished(true);
    } catch (cause) {
      setAccountError(registrationError(cause));
    } finally {
      setAccountBusy(false);
    }
  }
  return (
    <RegistrationSyncScope role="investor" data={form.data}>
      <ThemeProvider theme={investorTheme}>
        <InvestorBackground>
          <Shell>
            <Header>
              <Link to="/" aria-label="Juntaí! — início">
                <img src={logo} alt="Juntaí!" />
              </Link>
              <JourneyLabel>
                <HandshakeIcon size={20} />
                Investidor / Mentor
              </JourneyLabel>
            </Header>
            {form.loading ? (
              <p role="status">Preparando seu cadastro…</p>
            ) : form.loadError ? (
              <p role="alert">{form.loadError}</p>
            ) : finished ? (
              <Content>
                <CheckCircleIcon size={48} />
                <h1 ref={title} tabIndex={-1}>
                  Perfil enviado!
                </h1>
                <p>Seu cadastro foi recebido. Entre para acessar seu perfil.</p>
                <Button as={Link} to="/login">
                  Entrar na minha conta
                </Button>
              </Content>
            ) : (
              <>
                <Stepper
                  steps={investorSteps}
                  current={form.step}
                  completed={form.completedValid}
                  onSelect={(id) => {
                    setEditing(false);
                    form.navigate(id as InvestorStep);
                  }}
                />
                <Content>
                  <Intro>
                    <span>
                      Etapa {index + 1} de {investorSteps.length} ·{' '}
                      {current.label}
                    </span>
                    <h1 ref={title} tabIndex={-1}>
                      {current.title}
                    </h1>
                    <p>{current.description}</p>
                  </Intro>
                  <SyncLegend />
                  <form
                    ref={ref}
                    noValidate
                    onSubmit={(event) => void submit(event)}
                  >
                    <fieldset
                      disabled={accountBusy}
                      style={{ border: 0, padding: 0, minWidth: 0 }}
                    >
                      <InvestorFields
                        data={form.data}
                        step={form.step}
                        errors={form.errors}
                        update={form.update}
                        edit={edit}
                      />
                      {form.step === 'experience' && (
                        <Fields>
                          {' '}
                          <NumberInput
                            id="experience-years"
                            label="Anos de experiência"
                            min={0}
                            step={1}
                            value={form.data.experienceYears}
                            error={form.errors.experienceYears}
                            onValueChange={(value) =>
                              form.update('experienceYears', value)
                            }
                          />
                        </Fields>
                      )}
                      {form.step === 'consent' && (
                        <Fields style={{ marginTop: '2rem' }}>
                          <h2>Crie sua conta</h2>
                          <p>
                            Identificação, atuação, interesses e dados de
                            investimento serão enviados. Foto, links,
                            disponibilidade, contribuições e consentimentos só
                            ficam neste navegador se você clicar em “Salvar e
                            continuar depois”.
                          </p>
                          <Input
                            id="account-email"
                            label="E-mail de acesso"
                            required
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                          />
                          <Input
                            id="account-password"
                            label="Crie uma senha"
                            required
                            type="password"
                            autoComplete="new-password"
                            hint="Pelo menos 6 caracteres."
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                          />
                          <Input
                            id="account-confirm"
                            label="Confirme a senha"
                            required
                            type="password"
                            autoComplete="new-password"
                            value={confirmation}
                            onChange={(event) =>
                              setConfirmation(event.target.value)
                            }
                          />
                          {accountError && <p role="alert">{accountError}</p>}
                        </Fields>
                      )}
                      <Actions>
                        <Button
                          type="button"
                          $variant="quiet"
                          disabled={form.busy}
                          onClick={() => void form.save()}
                        >
                          Salvar e continuar depois
                        </Button>
                        <div>
                          {index > 0 && (
                            <Button
                              type="button"
                              $variant="secondary"
                              onClick={() => {
                                setEditing(false);
                                form.navigate(investorSteps[index - 1]!.id);
                              }}
                            >
                              Voltar
                            </Button>
                          )}
                          <Button type="submit">
                            {accountBusy
                              ? 'Criando conta…'
                              : form.step === 'consent'
                                ? 'Finalizar cadastro'
                                : editing
                                  ? 'Salvar alterações e revisar'
                                  : 'Continuar'}
                          </Button>
                        </div>
                      </Actions>
                    </fieldset>
                  </form>
                  <SaveMessage role="status">
                    {form.busy
                      ? 'Salvando…'
                      : form.message ||
                        'Seus dados só ficam neste navegador ao clicar em “Salvar e continuar depois”.'}
                  </SaveMessage>
                </Content>
              </>
            )}
            {blocker.state === 'blocked' && (
              <Modal
                open
                title="Sair antes de salvar?"
                confirmLabel="Sair sem salvar"
                onClose={() => blocker.reset()}
                onConfirm={() => blocker.proceed()}
              >
                <p>
                  Há alterações que ainda não foram salvas. Volte e escolha
                  salvar para guardá-las.
                </p>
              </Modal>
            )}
          </Shell>
        </InvestorBackground>
      </ThemeProvider>
    </RegistrationSyncScope>
  );
}
