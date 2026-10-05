import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';

export async function uploadStartupFile(
  kind: 'logo' | 'apresentacao',
  file: Blob,
  token: string,
  name: string,
) {
  const response = await apiRequest(`uploads/startup/${kind}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(name),
    },
    body: file,
  });
  return z
    .object({ url: z.url().startsWith('https://') })
    .parse(await response.json()).url;
}

export async function authenticateUploads(email: string, senha: string) {
  const response = await apiRequest('auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
  });
  return z.object({ token: z.string().min(1) }).parse(await response.json())
    .token;
}

export function logoFile(dataUri: string) {
  const match =
    /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUri);
  if (!match) throw new Error('Selecione um logo PNG, JPG ou WebP.');
  const bytes = Uint8Array.from(atob(match[2]!), (character) =>
    character.charCodeAt(0),
  );
  return new Blob([bytes], { type: match[1] });
}
