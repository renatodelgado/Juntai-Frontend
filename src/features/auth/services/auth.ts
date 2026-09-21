import { apiRequest } from '@/shared/services/api';
import {
  getSession,
  logout,
  profilePath,
  saveSession,
  sessionSchema,
  userSchema,
} from './session';

export async function login(email: string, senha: string) {
  const response = await apiRequest('auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
  });
  const session = sessionSchema.parse(await response.json());
  if (session.usuario.tipoPerfil === 'admin') {
    logout();
    throw new Error('A área administrativa ainda não está disponível.');
  }
  saveSession(session);
  return profilePath(session.usuario.tipoPerfil);
}

export async function validateSession() {
  const session = getSession();
  if (!session) return null;
  const response = await apiRequest('auth/me', { authenticated: true });
  const usuario = userSchema.parse(await response.json());
  if (getSession()?.token !== session.token) return null;
  saveSession({ token: session.token, usuario });
  return usuario;
}
