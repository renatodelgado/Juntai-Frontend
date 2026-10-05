import { apiRequest } from '@/shared/services/api';
import {
  getSession,
  homePath,
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
  saveSession(session);
  return homePath(session.usuario.tipoPerfil);
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

export async function checkRecoveryEmail(email: string): Promise<void> {
  await apiRequest('auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}
