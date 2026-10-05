import { useEffect, useState } from 'react';
import { apiRequest } from '@/shared/services/api';
import { getSession, sessionEvent } from './services/session';

export function useProfileApproval(knownApproval?: boolean) {
  const [approved, setApproved] = useState(false);
  useEffect(() => {
    if (knownApproval !== undefined) return;
    let active = true;
    let sequence = 0;
    const refresh = async () => {
      const request = ++sequence;
      const token = getSession()?.token;
      try {
        const profile: unknown = await (
          await apiRequest('auth/profile', { authenticated: true })
        ).json();
        if (active && request === sequence)
          setApproved(
            Boolean(
              token &&
              getSession()?.token === token &&
              profile &&
              typeof profile === 'object' &&
              'statusModeracao' in profile &&
              profile.statusModeracao === 'aprovado',
            ),
          );
      } catch {
        if (active && request === sequence) setApproved(false);
      }
    };
    const refreshProfile = () => void refresh();
    refreshProfile();
    const timer = window.setInterval(refreshProfile, 60_000);
    window.addEventListener('focus', refreshProfile);
    window.addEventListener(sessionEvent, refreshProfile);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshProfile);
      window.removeEventListener(sessionEvent, refreshProfile);
    };
  }, [knownApproval]);
  return knownApproval ?? approved;
}
