import { useEffect, useRef } from 'react';
import { apiRequest } from '@/shared/services/api';

// Deduplicate only successful confirmations. The server also makes the signed context idempotent.
const confirmed = new Set<string>();
const pending = new Map<string, Promise<void>>();
export async function confirmExposure(contexto: string) {
  if (confirmed.has(contexto)) return;
  let request = pending.get(contexto);
  if (!request) {
    request = apiRequest('startups/exposicoes', {
      authenticated: true,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contexto }),
    })
      .then(() => {
        confirmed.add(contexto);
      })
      .finally(() => {
        pending.delete(contexto);
      });
    pending.set(contexto, request);
  }
  await request;
}

export function useExposure(contexto?: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !contexto || !('IntersectionObserver' in window)) return;
    let visible = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    let attempts = 0;
    function schedule() {
      clearTimeout(timer);
      if (
        !visible ||
        document.visibilityState !== 'visible' ||
        confirmed.has(contexto!)
      )
        return;
      timer = setTimeout(() => {
        attempts++;
        void confirmExposure(contexto!).catch(() => {
          // Retry transient failures while the card remains visible, without blocking navigation.
          if (!disposed && attempts < 3) schedule();
        });
      }, 1000);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible =
          !!entry && entry.isIntersecting && entry.intersectionRatio >= 0.5;
        schedule();
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(element);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [contexto]);
  return ref;
}
