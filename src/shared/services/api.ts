import { env } from '@/shared/config/env';
import { getSession, logout } from '@/features/auth/services/session';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// Retorna Response para que cada serviço trate o formato real do seu endpoint.
export async function apiRequest(
  path: string,
  options: RequestInit & { authenticated?: boolean } = {},
): Promise<Response> {
  const { authenticated, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  const token = authenticated ? getSession()?.token : undefined;
  if (authenticated && !token)
    throw new ApiError('Entre na sua conta para continuar.', 401);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${env.apiUrl}/${path.replace(/^\/+/, '')}`, {
    ...requestOptions,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && token && getSession()?.token === token)
      logout();
    const body: unknown = await response.json().catch(() => null);
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof body.message === 'string' &&
      /e-mail já cadastrado/i.test(body.message)
    ) {
      throw new Error('E-mail já cadastrado. Use outro e-mail.');
    }
    const message =
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : `A requisição falhou (HTTP ${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return response;
}
