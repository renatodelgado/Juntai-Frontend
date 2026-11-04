import { useEffect, useSyncExternalStore } from 'react';
import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
import { getSession, sessionEvent } from './session';

const schema = z.object({
  statusModeracao: z.string(),
  avatarUrl: z.string().nullish(),
  logoUrl: z.string().nullish(),
  tituloProfissional: z.string().nullish(),
});
type CurrentProfile = z.infer<typeof schema>;
let snapshot: { token: string; profile: CurrentProfile } | null = null;
let pending: { token: string; request: Promise<void> } | null = null;
let revision = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const getCurrentProfile = () =>
  snapshot && snapshot.token === getSession()?.token ? snapshot.profile : null;

// Only server-confirmed values enter this shared store; drafts stay in their forms.
export function publishCurrentProfile(value: unknown, token: string) {
  if (getSession()?.token !== token) return;
  const profile = schema.parse(value);
  revision++;
  snapshot = { token, profile };
  emit();
}

export async function refreshCurrentProfile() {
  const token = getSession()?.token;
  if (!token) {
    snapshot = null;
    emit();
    return;
  }
  if (pending?.token === token) return pending.request;
  const requestedRevision = revision;
  const request = apiRequest('auth/profile', { authenticated: true })
    .then((response) => response.json())
    .then((profile: unknown) => {
      if (requestedRevision === revision) publishCurrentProfile(profile, token);
    })
    .finally(() => {
      if (pending?.token === token) pending = null;
    });
  pending = { token, request };
  return request;
}

export function useCurrentProfile(enabled = true) {
  const state = useSyncExternalStore(subscribe, getCurrentProfile, () => null);
  useEffect(() => {
    if (!enabled) return;
    const refresh = () => {
      void refreshCurrentProfile().catch(() => {
        /* Retain the last confirmed profile on transient errors. */
      });
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    window.addEventListener(sessionEvent, refresh);
    const sync = (event: StorageEvent) => {
      if (event.key === 'juntai:auth-session' || event.key === null) refresh();
    };
    window.addEventListener('storage', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener(sessionEvent, refresh);
      window.removeEventListener('storage', sync);
    };
  }, [enabled]);
  return state;
}
