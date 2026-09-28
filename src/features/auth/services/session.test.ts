import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSession, logout, saveSession, tokenExpiresAt } from './session';

const key = 'juntai:auth-session';
const usuario = {
  id: 'one',
  nome: 'Teste',
  email: 'teste@example.com',
  tipoPerfil: 'startup' as const,
};
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}
const jwt = (exp: number) =>
  `header.${btoa(JSON.stringify({ exp }))}.signature`;
beforeEach(() => {
  vi.stubGlobal('localStorage', storage());
  vi.stubGlobal('sessionStorage', storage());
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());
describe('sessão persistente', () => {
  it('migra sessões anteriores e remove a cópia da aba', () => {
    sessionStorage.setItem(
      key,
      JSON.stringify({ usuario, token: jwt(Date.now() / 1000 + 3600) }),
    );
    expect(getSession()?.usuario.id).toBe('one');
    expect(localStorage.getItem(key)).not.toBeNull();
    expect(sessionStorage.getItem(key)).toBeNull();
  });
  it('remove tokens expirados sem renovar o prazo', () => {
    saveSession({ usuario, token: jwt(Date.now() / 1000 - 1) });
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
  });
  it('logout remove as duas formas de armazenamento', () => {
    saveSession({ usuario, token: 'opaque' });
    sessionStorage.setItem(key, 'old');
    logout();
    expect(getSession()).toBeNull();
    expect(sessionStorage.getItem(key)).toBeNull();
  });
  it('ignora armazenamento inválido e deixa tokens opacos para o servidor', () => {
    localStorage.setItem(key, '{invalid');
    expect(getSession()).toBeNull();
    expect(tokenExpiresAt('opaque')).toBeNull();
  });
});
