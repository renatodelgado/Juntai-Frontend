import { redirect } from 'react-router-dom';
import { ApiError } from '@/shared/services/api';
import { validateSession } from './auth';
import { getSession, logout, homePath, type AuthUser } from './session';

export function requireRole(role: AuthUser['tipoPerfil']) {
  return async () => {
    try {
      const user = await validateSession();
      if (!user) return redirect('/login');
      if (user.tipoPerfil === 'admin') {
        logout();
        return redirect('/login');
      }
      if (user.tipoPerfil !== role) return redirect(homePath(user.tipoPerfil));
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
    if (user?.tipoPerfil === 'admin') {
      logout();
      return null;
    }
    return user ? redirect(homePath(user.tipoPerfil)) : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
