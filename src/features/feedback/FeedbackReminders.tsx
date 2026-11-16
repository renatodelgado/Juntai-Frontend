import { useEffect, useState } from 'react';
import { feedbackApi, type FeedbackContext } from './api';
import { FeedbackDialog } from './FeedbackDialog';
export function FeedbackReminders() {
  const [context, setContext] = useState<FeedbackContext | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (done || context) return;
    const controller = new AbortController();
    let running = false;
    const check = async () => {
      if (running || document.querySelector('dialog[open]')) return;
      running = true;
      try {
        const pending = await feedbackApi.pending(controller.signal);
        if (
          !controller.signal.aborted &&
          !document.querySelector('dialog[open]') &&
          pending[0]
        )
          setContext(pending[0]);
      } catch {
        /* Pending feedback must not block navigation; retry on next check. */
      } finally {
        running = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 60000);
    window.addEventListener('feedback-pending', check);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('feedback-pending', check);
    };
  }, [context, done]);
  return (
    context && (
      <FeedbackDialog
        context={context}
        reminder
        onClose={() => {
          setDone(true);
          setContext(null);
        }}
      />
    )
  );
}
