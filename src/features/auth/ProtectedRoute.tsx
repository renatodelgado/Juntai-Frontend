import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useRevalidator } from 'react-router-dom';
import {
  getSession,
  logout,
  sessionEvent,
  tokenExpiresAt,
} from './services/session';

export function ProtectedRoute() {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  useEffect(() => {
    let expiryTimer: number | undefined;
    const check = () => {
      window.clearTimeout(expiryTimer);
      const session = getSession();
      if (!session) {
        void navigate('/login', { replace: true });
        return;
      }
      const expiry = tokenExpiresAt(session.token);
      if (expiry !== null)
        expiryTimer = window.setTimeout(
          check,
          Math.min(Math.max(expiry - Date.now(), 0), 2_147_483_647),
        );
    };
    const refresh = () => {
      check();
      void revalidate();
    };
    const sync = (event: StorageEvent) => {
      if (event.key === 'juntai:auth-session' || event.key === null) {
        check();
        void revalidate();
      }
    };
    check();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener(sessionEvent, check);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', sync);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(expiryTimer);
      window.removeEventListener(sessionEvent, check);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', sync);
    };
  }, [navigate, revalidate]);
  return <Outlet />;
}

export function AuthRouteError() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Não conseguimos confirmar seu acesso</h1>
      <p>Confira sua conexão e tente novamente.</p>
      <button onClick={() => window.location.reload()}>
        Tentar novamente
      </button>{' '}
      <Link to="/login" onClick={logout}>
        Sair e ir para o login
      </Link>
    </main>
  );
}
