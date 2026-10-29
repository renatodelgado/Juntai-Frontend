import { useEffect, useRef } from 'react';
import { env } from '@/shared/config/env';
import { getSession } from '@/features/auth/services/session';
import { observeExposure } from './exposureVisibility';

export function useExposure(context?: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current || !context) return;
    return observeExposure(ref.current, context, async (token) => {
      const tokenSession = getSession()?.token;
      if (!tokenSession) throw new Error('Sem sessão');
      // Telemetria não deve disparar logout/redirecionamentos em caso de falha.
      const response = await fetch(`${env.apiUrl}/startups/exposicoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenSession}`,
        },
        body: JSON.stringify({ contexto: token }),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error('Exposição não confirmada');
    });
  }, [context]);
  return ref;
}
