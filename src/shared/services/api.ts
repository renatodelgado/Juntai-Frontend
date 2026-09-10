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
    throw new Error(`A requisição falhou (HTTP ${response.status}).`);
  }

  return response;
}
