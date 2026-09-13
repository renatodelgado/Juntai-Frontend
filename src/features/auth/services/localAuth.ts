import { get, set } from 'idb-keyval';
import type { SavedDraft } from '@/features/startup-onboarding/services/draftStorage';
import type { SavedInvestor } from '@/features/investor-onboarding/model/investor';

interface LocalAccount {
  email: string;
  salt: number[];
  passwordHash: number[];
  role?: 'startup' | 'investor';
  profile: SavedDraft | SavedInvestor;
}
const sessionKey = 'juntai:local-session';
const accountKey = (email: string) =>
  `juntai:account:${email.trim().toLowerCase()}`;
export const sessionEmail = () => sessionStorage.getItem(sessionKey);
export function logout() {
  sessionStorage.removeItem(sessionKey);
}

async function hashPassword(password: string, salt: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return Array.from(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' },
        key,
        256,
      ),
    ),
  );
}

export async function registerLocal(
  email: string,
  password: string,
  profile: SavedDraft | SavedInvestor,
  role: 'startup' | 'investor' = 'startup',
) {
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('Informe um e-mail válido.');
  if (password.length < 8)
    throw new Error('Use uma senha com pelo menos 8 caracteres.');
  if (await get(accountKey(email)))
    throw new Error(
      'Este e-mail já tem uma conta neste navegador. Entre pela tela de login.',
    );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account: LocalAccount = {
    email,
    salt: Array.from(salt),
    passwordHash: await hashPassword(password, salt),
    profile,
    role,
  };
  await set(accountKey(email), account);
  sessionStorage.setItem(sessionKey, email);
}

export async function loginLocal(email: string, password: string) {
  const account = await get<LocalAccount>(accountKey(email));
  if (!account) throw new Error('E-mail ou senha não conferem.');
  const hash = await hashPassword(password, new Uint8Array(account.salt));
  if (hash.some((byte, index) => byte !== account.passwordHash[index]))
    throw new Error('E-mail ou senha não conferem.');
  sessionStorage.setItem(sessionKey, account.email);
  return account.role === 'investor' ? '/investidor/perfil' : '/startup/perfil';
}

export async function loadProfile() {
  const email = sessionEmail();
  if (!email) return null;
  const account = await get<LocalAccount>(accountKey(email));
  return account && account.role !== 'investor'
    ? (account.profile as SavedDraft)
    : null;
}

export async function saveProfile(profile: SavedDraft) {
  const email = sessionEmail();
  const account = email ? await get<LocalAccount>(accountKey(email)) : null;
  if (!account || account.role === 'investor')
    throw new Error('Entre novamente para salvar seu perfil.');
  await set(accountKey(account.email), { ...account, profile });
}

export async function loadInvestorProfile() {
  const email = sessionEmail();
  const account = email ? await get<LocalAccount>(accountKey(email)) : null;
  return account?.role === 'investor'
    ? (account.profile as SavedInvestor)
    : null;
}
export async function saveInvestorProfile(profile: SavedInvestor) {
  const email = sessionEmail();
  const account = email ? await get<LocalAccount>(accountKey(email)) : null;
  if (!account || account.role !== 'investor')
    throw new Error('Entre novamente para salvar seu perfil.');
  await set(accountKey(account.email), { ...account, profile });
}
