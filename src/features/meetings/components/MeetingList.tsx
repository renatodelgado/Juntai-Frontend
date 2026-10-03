import { Button } from '@/shared/components/ui/Button';
import { MapPinIcon, VideoCameraIcon, ClockIcon } from '@phosphor-icons/react';
import {
  canJoin,
  dayLabel,
  effectiveStatus,
  formatLabels,
  startTime,
  statusLabels,
  roleLabels,
  type ScheduledMeeting,
} from '../model';
import * as S from '../Meetings.styles';

export function MeetingList({
  meetings,
  selfId,
  now,
  onSelect,
}: {
  meetings: ScheduledMeeting[];
  selfId: string;
  now: number;
  onSelect: (meeting: ScheduledMeeting) => void;
}) {
  const dates = [...new Set(meetings.map((meeting) => meeting.date))];
  return (
    <div>
      {dates.map((date) => (
        <section key={date} aria-label={dayLabel(date)}>
          <h2>{dayLabel(date)}</h2>
          {meetings
            .filter((meeting) => meeting.date === date)
            .map((meeting) => {
              const person = meeting.participants.find(
                (item) => item.id !== selfId,
              )!;
              const status = effectiveStatus(meeting, now);
              const soon =
                status === 'confirmed' &&
                startTime(meeting) >= now &&
                startTime(meeting) - now <= 3600000;
              return (
                <S.MeetingCard
                  as="article"
                  key={meeting.id}
                  $soon={soon}
                  aria-label={meeting.title}
                >
                  <div className="time">
                    <strong>{meeting.time}</strong>
                    <small>{meeting.duration} minutos</small>
                    {soon && (
                      <small>
                        <ClockIcon size={12} /> Em breve
                      </small>
                    )}
                  </div>
                  <div>
                    <div className="person">
                      <span className="avatar" aria-hidden="true">
                        {person.name
                          .split(' ')
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join('')}
                      </span>
                      <div>
                        <strong>{person.name}</strong>
                        <small>
                          {roleLabels[person.role]}
                          {person.company && person.company !== person.name
                            ? ` · ${person.company}`
                            : ''}
                        </small>
                      </div>
                    </div>
                    <h3>{meeting.title}</h3>
                    <div className="meta">
                      {meeting.format === 'presential' ? (
                        <MapPinIcon size={15} />
                      ) : (
                        <VideoCameraIcon size={15} />
                      )}
                      {formatLabels[meeting.format]}
                      {meeting.format === 'presential' && meeting.address && (
                        <span>· {meeting.address}</span>
                      )}
                      {meeting.format === 'online' && !meeting.link && (
                        <span>· Link não informado</span>
                      )}
                    </div>
                  </div>
                  <div className="side">
                    <S.Status $status={status}>{statusLabels[status]}</S.Status>
                    <div className="actions">
                      <Button
                        $variant="secondary"
                        onClick={() => onSelect(meeting)}
                      >
                        Ver detalhes
                      </Button>
                      {canJoin(meeting, now) && (
                        <Button
                          as="a"
                          href={meeting.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Entrar na reunião
                        </Button>
                      )}
                    </div>
                  </div>
                </S.MeetingCard>
              );
            })}
        </section>
      ))}
    </div>
  );
}
