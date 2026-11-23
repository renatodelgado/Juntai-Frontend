import { useEffect } from 'react';
import { discoveryInteractions } from './api';

export function useProfileInteraction(
  startupId: string | undefined,
  enabled: boolean,
) {
  useEffect(() => {
    if (!startupId || !enabled) return;
    void discoveryInteractions
      .record(startupId, 'perfil_aberto')
      .catch(() => {});
    let started =
      document.visibilityState === 'visible' ? performance.now() : null;
    let elapsed = 0;
    let finished = false;
    function update() {
      if (started !== null) {
        elapsed += performance.now() - started;
        started = null;
      }
      if (document.visibilityState === 'visible') started = performance.now();
    }
    function finish() {
      if (finished) return;
      finished = true;
      if (started !== null) elapsed += performance.now() - started;
      const seconds = Math.min(300, Math.floor(elapsed / 1000));
      if (seconds >= 10)
        void discoveryInteractions
          .record(startupId!, 'tempo_perfil', seconds)
          .catch(() => {});
    }
    document.addEventListener('visibilitychange', update);
    window.addEventListener('pagehide', finish);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('pagehide', finish);
      finish();
    };
  }, [startupId, enabled]);
}
