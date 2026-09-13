import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/shared/components/forms/Fields';
import { Button } from '@/shared/components/ui/Button';
import {
  JourneyBackground,
  Shell,
  Content,
  Fields,
} from '@/features/startup-onboarding/pages/Onboarding.styles';
import { loginLocal } from '../services/localAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const destination = await loginLocal(email, password);
      await navigate(destination, { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não conseguimos entrar. Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <JourneyBackground>
      <Shell style={{ maxWidth: '32rem' }}>
        <Content>
          <Link to="/">Juntaí! · Início</Link>
          <h1>Que bom ter você de volta</h1>
          <p>
            Este acesso atende somente às contas antigas de demonstração salvas
            neste navegador. Os novos cadastros são enviados ao servidor, mas o
            login online ainda não está disponível.
          </p>
          <form onSubmit={(event) => void submit(event)}>
            <Fields>
              <Input
                id="email"
                label="E-mail"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                id="password"
                label="Senha"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error && <p role="alert">{error}</p>}
              <Button disabled={busy} type="submit">
                {busy ? 'Entrando…' : 'Entrar'}
              </Button>
              <p>
                Não tem uma conta?{' '}
                <Link to="/cadastro/startup">Tenho uma startup</Link>
                {' · '}
                <Link to="/cadastro/investidor">
                  Sou um investidor ou mentor
                </Link>
              </p>
              <small>
                Acesso de teste, disponível somente no navegador onde a conta
                foi criada.
              </small>
            </Fields>
          </form>
        </Content>
      </Shell>
    </JourneyBackground>
  );
}
