import { useEffect, useState } from 'react';
import type { AuthUser } from '@/features/auth/services/session';
import { meetingsRepository } from './repository';
import type { ScheduledMeeting } from './model';

export function useMeetings(user: AuthUser) {
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let running = false;
    const refresh = async () => {
      if (running) return;
      running = true;
      try {
        const items = await meetingsRepository.list(controller.signal);
        if (!controller.signal.aborted) {
          setMeetings(items);
          setFailed(false);
        }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        running = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    const focus = () => void refresh();
    window.addEventListener('focus', focus);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', focus);
    };
  }, [user.id, attempt]);
  return {
    meetings,
    loading,
    failed,
    retry: () => {
      setLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}
