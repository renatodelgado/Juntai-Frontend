import { useEffect, useState } from 'react';
import { interestsApi } from '@/features/explore-startups/api';
import { messagesApi } from '@/features/messages/api';
import { meetingsRepository } from '@/features/meetings/repository';
import { feedbackApi, type FeedbackContext } from '@/features/feedback/api';
import { getSession } from '@/features/auth/services/session';

export function useMatchFeedback(userId: string, approved: boolean) {
  const [contexts, setContexts] = useState<Record<string, FeedbackContext>>({});
  const token = getSession()?.token;
  useEffect(() => {
    if (!approved) return;
    const controller = new AbortController();
    let running = false;
    async function load() {
      if (running) return;
      running = true;
      try {
        const [meetings, conversations] = await Promise.allSettled([
          meetingsRepository.list(controller.signal),
          Promise.all([
            interestsApi.list(controller.signal),
            messagesApi.list(controller.signal),
          ]),
        ]);
        const next: Record<string, FeedbackContext> = {};
        if (conversations.status === 'fulfilled') {
          const [interests, chats] = conversations.value;
          await Promise.allSettled(
            interests.map(async (interest) => {
              const chat = chats.find(
                (item) => item.usuarioId === interest.usuarioId,
              );
              if (!chat) return;
              const context: FeedbackContext = {
                tipo: 'conversa',
                id: chat.conversaId,
              };
              const state = await feedbackApi.get(context, controller.signal);
              if (state.elegivel || state.avaliacao)
                next[interest.startupId] = context;
            }),
          );
        }
        if (meetings.status === 'fulfilled') {
          const completed = meetings.value
            .filter((item) => item.status === 'realizada')
            .sort((a, b) =>
              a.dataHoraAgendada.localeCompare(b.dataHoraAgendada),
            );
          for (const meeting of completed)
            next[meeting.startupId] = { tipo: 'reuniao', id: meeting.id };
        }
        if (!controller.signal.aborted && getSession()?.token === token)
          setContexts(next);
      } finally {
        running = false;
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    window.addEventListener('focus', load);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, [userId, token, approved]);
  return contexts;
}
