import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().min(1),
  nome: z.string(),
  email: z.string(),
  tipoPerfil: z.enum(['startup', 'investidor', 'admin']),
});
export const sessionSchema = z.object({
  token: z.string().min(1),
  usuario: userSchema,
});
export type AuthUser = z.infer<typeof userSchema>;
const key = 'juntai:auth-session';
export const sessionEvent = 'juntai:session-change';

// Used only to schedule logout. The server still verifies the token signature.
export function tokenExpiresAt(token: string): number | null {
  try {
    const payload: unknown = JSON.parse(
      atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (
      payload &&
      typeof payload === 'object' &&
      'exp' in payload &&
      typeof payload.exp === 'number' &&
      Number.isFinite(payload.exp)
    )
      return payload.exp * 1000;
  } catch {
    /* Opaque tokens are validated by the server. */
  }
  return null;
}

export function getSession() {
  try {
    const parsed = sessionSchema.safeParse(
      JSON.parse(
        localStorage.getItem(key) || sessionStorage.getItem(key) || 'null',
      ),
    );
    if (!parsed.success) return null;
    const expiresAt = tokenExpiresAt(parsed.data.token);
    if (expiresAt !== null && expiresAt <= Date.now()) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      return null;
    }
    // Migrate existing tabs without requiring another login.
    if (!localStorage.getItem(key))
      localStorage.setItem(key, JSON.stringify(parsed.data));
    sessionStorage.removeItem(key);
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveSession(value: z.infer<typeof sessionSchema>) {
  localStorage.setItem(key, JSON.stringify(sessionSchema.parse(value)));
  sessionStorage.removeItem(key);
  window.dispatchEvent(new Event(sessionEvent));
}

export function logout() {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  sessionStorage.removeItem('juntai:local-session');
  window.dispatchEvent(new Event(sessionEvent));
}

export function homePath(role: AuthUser['tipoPerfil']) {
  if (role === 'admin') return '/admin';
  if (role === 'startup') return '/startup/inicio';
  if (role === 'investidor') return '/investidor/inicio';
  return '/login';
}

export function profilePath(role: AuthUser['tipoPerfil']) {
  if (role === 'startup') return '/startup/perfil';
  if (role === 'investidor') return '/investidor/perfil';
  return '/login';
}
