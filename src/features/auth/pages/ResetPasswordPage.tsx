import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { Input } from '@/shared/components/forms/Fields';
import { Button } from '@/shared/components/ui/Button';
import {
  Content,
  Fields,
} from '@/features/startup-onboarding/pages/Onboarding.styles';
import { resetPassword } from '../services/auth';
import { passwordError, passwordRequirements } from '../model/password';

export function ResetPasswordPage() {
  const [token] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname,
    );
  }, []);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    const invalidPassword = passwordError(password);
    if (invalidPassword) {
      setError(invalidPassword);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await resetPassword(token, password);
      setDone(true);
      setPassword('');
      setConfirmation('');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível redefinir a senha.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer style={{ maxWidth: '32rem' }}>
      <Content>
        <Link to="/login">Voltar para o login</Link>
        <h1>Redefinir senha</h1>
        {done ? (
          <p role="status">Senha alterada. Você já pode entrar.</p>
        ) : !/^[a-f0-9]{64}$/.test(token) ? (
          <p role="alert">Link inválido. Solicite outro link de recuperação.</p>
        ) : (
          <form onSubmit={(event) => void submit(event)}>
            <Fields>
              <Input
                id="new-password"
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                hint={passwordRequirements}
                required
                value={password}
                disabled={busy}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Input
                id="confirm-password"
                label="Confirme a senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmation}
                disabled={busy}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              {error && <p role="alert">{error}</p>}
              <Button type="submit" disabled={busy}>
                {busy ? 'Salvando…' : 'Redefinir senha'}
              </Button>
            </Fields>
          </form>
        )}
      </Content>
    </PageContainer>
  );
}
