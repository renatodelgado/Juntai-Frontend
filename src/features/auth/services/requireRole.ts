import { redirect } from 'react-router-dom';
import { ApiError, apiRequest } from '@/shared/services/api';
import { validateSession } from './auth';
import { getSession, homePath, type AuthUser } from './session';

export function requireRole(
  role: AuthUser['tipoPerfil'],
  { approvedOnly = false } = {},
) {
  return async () => {
    try {
      const user = await validateSession();
      if (!user) return redirect('/login');
      if (user.tipoPerfil !== role) return redirect(homePath(user.tipoPerfil));
      if (approvedOnly) {
        const token = getSession()?.token;
        const profile: unknown = await (
          await apiRequest('auth/profile', { authenticated: true })
        ).json();
        if (!token || getSession()?.token !== token) return redirect('/login');
        if (
          !profile ||
          typeof profile !== 'object' ||
          !('statusModeracao' in profile) ||
          profile.statusModeracao !== 'aprovado'
        )
          return redirect(homePath(user.tipoPerfil));
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401)
        return redirect('/login');
      throw error;
    }
  };
}

export async function redirectAuthenticated() {
  if (!getSession()) return null;
  try {
    const user = await validateSession();
    return user ? redirect(homePath(user.tipoPerfil)) : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
