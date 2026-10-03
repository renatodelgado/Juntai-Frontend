import { useState } from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import { addDays, dayKey, weekStart, type ScheduledMeeting } from '../model';
import * as S from '../Meetings.styles';

export function MeetingCalendar({
  meetings,
  onSelect,
}: {
  meetings: ScheduledMeeting[];
  onSelect: (meeting: ScheduledMeeting) => void;
}) {
  const [anchor, setAnchor] = useState(dayKey());
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const first = `${anchor.slice(0, 7)}-01`;
  const start = weekStart(mode === 'week' ? anchor : first);
  const days = Array.from({ length: mode === 'week' ? 7 : 42 }, (_, index) =>
    addDays(start, index),
  );
  function move(direction: number) {
    if (mode === 'week') setAnchor(addDays(anchor, direction * 7));
    else {
      const date = new Date(`${first}T12:00:00-03:00`);
      date.setUTCMonth(date.getUTCMonth() + direction);
      setAnchor(dayKey(date));
    }
  }
  return (
    <S.Calendar aria-label="Calendário de reuniões">
      <header>
        <h2>
          {mode === 'week'
            ? `Semana de ${start.split('-').reverse().join('/')}`
            : new Date(`${first}T12:00:00-03:00`).toLocaleDateString('pt-BR', {
                timeZone: 'America/Fortaleza',
                month: 'long',
                year: 'numeric',
              })}
        </h2>
        <div className="actions">
          <Button
            $variant="quiet"
            aria-label="Período anterior"
            onClick={() => move(-1)}
          >
            <CaretLeftIcon />
          </Button>
          <Button $variant="secondary" onClick={() => setAnchor(dayKey())}>
            Hoje
          </Button>
          <Button
            $variant="quiet"
            aria-label="Próximo período"
            onClick={() => move(1)}
          >
            <CaretRightIcon />
          </Button>
          <Button
            $variant="secondary"
            aria-pressed={mode === 'month'}
            onClick={() => setMode('month')}
          >
            Mês
          </Button>
          <Button
            $variant="secondary"
            aria-pressed={mode === 'week'}
            onClick={() => setMode('week')}
          >
            Semana
          </Button>
        </div>
      </header>
      <div className="weekdays">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="days">
        {days.map((day) => (
          <div
            className="day"
            key={day}
            data-today={day === dayKey()}
            data-outside={
              mode === 'month' && day.slice(0, 7) !== anchor.slice(0, 7)
            }
          >
            <time dateTime={day}>{Number(day.slice(-2))}</time>
            {meetings
              .filter((meeting) => meeting.date === day)
              .map((meeting) => (
                <button
                  className="event"
                  key={meeting.id}
                  aria-label={`${meeting.time} ${meeting.title}`}
                  onClick={() => onSelect(meeting)}
                >
                  <span>{meeting.time}</span>
                  <span className="subject">{meeting.title}</span>
                </button>
              ))}
          </div>
        ))}
      </div>
    </S.Calendar>
  );
}
