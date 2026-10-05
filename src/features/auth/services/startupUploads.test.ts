import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  authenticateUploads,
  logoFile,
  uploadStartupFile,
} from './startupUploads';

afterEach(() => vi.unstubAllGlobals());
describe('uploads da startup', () => {
  it('envia os bytes com autenticação e retorna a URL HTTPS', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            url: 'https://res.cloudinary.com/demo/raw/upload/pitch.pdf',
          }),
        ),
      );
    vi.stubGlobal('fetch', fetch);
    const file = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    await expect(
      uploadStartupFile('apresentacao', file, 'token', 'pitch.pdf'),
    ).resolves.toContain('pitch.pdf');
    const [url, options] = fetch.mock.calls[0]!;
    expect(url).toContain('/uploads/startup/apresentacao');
    expect(options.body).toBe(file);
    expect(options.headers.get('Authorization')).toBe('Bearer token');
  });
  it('propaga falhas de upload e não aceita URLs inseguras', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: 'Upload failed' }), {
          status: 502,
        }),
      );
    vi.stubGlobal('fetch', fetch);
    await expect(
      uploadStartupFile('logo', new Blob(['image']), 'token', 'logo'),
    ).rejects.toThrow('Upload failed');
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ url: 'http://example.com/logo.png' })),
    );
    await expect(
      uploadStartupFile('logo', new Blob(['image']), 'token', 'logo'),
    ).rejects.toThrow();
  });
  it('converte apenas imagens locais e autentica sem salvar a sessão', async () => {
    const blob = logoFile('data:image/png;base64,aGVsbG8=');
    expect(blob.type).toBe('image/png');
    expect(await blob.text()).toBe('hello');
    expect(() => logoFile('https://example.com/image')).toThrow();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ token: 'temporary-token' })),
        ),
    );
    await expect(
      authenticateUploads('User@Example.com', 'password'),
    ).resolves.toBe('temporary-token');
  });
});
