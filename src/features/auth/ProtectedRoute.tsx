import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useRevalidator } from 'react-router-dom';
import { getSession, sessionEvent } from './services/session';

export function ProtectedRoute() {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  useEffect(() => {
    const check = () => {
      if (!getSession()) void navigate('/login', { replace: true });
    };
    const refresh = () => {
      void revalidate();
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener(sessionEvent, check);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(sessionEvent, check);
      window.removeEventListener('focus', refresh);
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
      <Link to="/login">Ir para o login</Link>
    </main>
  );
}
