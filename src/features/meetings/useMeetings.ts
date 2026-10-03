import { useEffect, useState } from 'react';
import type { AuthUser } from '@/features/auth/services/session';
import { demoMeetingsRepository } from './repository';
import type { ScheduledMeeting } from './model';

export function useMeetings(user: AuthUser) {
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void demoMeetingsRepository
        .list(user)
        .then((items) => {
          if (active) {
            setMeetings(items);
            setFailed(false);
          }
        })
        .catch(() => {
          if (active) setFailed(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    refresh();
    const tick = window.setInterval(() => {
      setNow(Date.now());
      refresh();
    }, 60000);
    const storage = (event: StorageEvent) => {
      if (event.key === 'juntai:meetings:v1') refresh();
    };
    window.addEventListener('juntai:meetings-change', refresh);
    window.addEventListener('storage', storage);
    return () => {
      active = false;
      clearInterval(tick);
      window.removeEventListener('juntai:meetings-change', refresh);
      window.removeEventListener('storage', storage);
    };
  }, [user, attempt]);
  return {
    meetings,
    loading,
    failed,
    now,
    retry: () => {
      setLoading(true);
      setFailed(false);
      setAttempt((value) => value + 1);
    },
  };
}
