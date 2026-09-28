import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { Input } from '@/shared/components/forms/Fields';
import { Button } from '@/shared/components/ui/Button';
import {
  Content,
  Fields,
} from '@/features/startup-onboarding/pages/Onboarding.styles';
import { checkRecoveryEmail } from '../services/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await checkRecoveryEmail(email);
      setMessage(
        'E-mail encontrado! O envio do código está temporariamente indisponível. Nenhum código foi enviado. Tente novamente mais tarde.',
      );
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Tente novamente.'
          : cause instanceof Error
            ? cause.message
            : 'Não conseguimos verificar seu e-mail. Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer style={{ maxWidth: '32rem' }}>
      <Content>
        <Link to="/login">Voltar para o login</Link>
        <h1>Esqueceu sua senha?</h1>
        <p>
          Informe seu e-mail cadastrado. Vamos enviar um código para esse
          endereço para você recuperar sua senha assim que o envio estiver
          disponível.
        </p>
        <p>
          Por enquanto, você pode verificar se o e-mail está na nossa base de
          dados.
        </p>
        <form onSubmit={(event) => void submit(event)}>
          <Fields>
            <Input
              id="recovery-email"
              label="E-mail cadastrado"
              type="email"
              required
              autoComplete="email"
              value={email}
              disabled={busy}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
                setMessage('');
              }}
            />
            {error && <p role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? 'Verificando…' : 'Continuar'}
            </Button>
          </Fields>
        </form>
      </Content>
    </PageContainer>
  );
}
