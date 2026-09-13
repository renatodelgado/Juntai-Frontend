import { env } from '@/shared/config/env';

// Retorna Response para que cada serviço trate o formato real do seu endpoint.
export async function apiRequest(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await fetch(
    `${env.apiUrl}/${path.replace(/^\/+/, '')}`,
    options,
  );

  if (!response.ok) {
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
    throw new Error(`A requisição falhou (HTTP ${response.status}).`);
  }

  return response;
}
