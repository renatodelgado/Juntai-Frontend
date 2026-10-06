import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';

export async function uploadInvestorPhoto(file: Blob, token: string) {
  const response = await apiRequest('uploads/investidor/avatar', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type,
    },
    body: file,
  });
  return z
    .object({ url: z.url().startsWith('https://') })
    .parse(await response.json()).url;
}

export async function removeInvestorPhoto(token: string) {
  await apiRequest('uploads/investidor/avatar', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
