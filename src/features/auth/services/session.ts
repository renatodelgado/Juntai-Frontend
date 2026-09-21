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

export function getSession() {
  try {
    const parsed = sessionSchema.safeParse(
      JSON.parse(sessionStorage.getItem(key) || 'null'),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveSession(value: z.infer<typeof sessionSchema>) {
  sessionStorage.setItem(key, JSON.stringify(sessionSchema.parse(value)));
  window.dispatchEvent(new Event(sessionEvent));
}

export function logout() {
  sessionStorage.removeItem(key);
  sessionStorage.removeItem('juntai:local-session');
  window.dispatchEvent(new Event(sessionEvent));
}

export function profilePath(role: AuthUser['tipoPerfil']) {
  if (role === 'startup') return '/startup/perfil';
  if (role === 'investidor') return '/investidor/perfil';
  return '/login';
}
