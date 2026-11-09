import { Button } from '@/shared/components/ui/Button';
import { dayLabel, statusLabels, type ScheduledMeeting } from '../model';
import * as S from '../Meetings.styles';
export function MeetingList({
  meetings,
  onSelect,
}: {
  meetings: ScheduledMeeting[];
  onSelect: (meeting: ScheduledMeeting) => void;
}) {
  return (
    <div>
      {[...new Set(meetings.map((item) => item.date))].map((date) => (
        <section key={date}>
          <h2>{dayLabel(date)}</h2>
          {meetings
            .filter((item) => item.date === date)
            .map((item) => (
              <S.MeetingCard as="article" key={item.id} $soon={false}>
                <div className="time">
                  <strong>{item.time}</strong>
                </div>
                <div>
                  <h3>{item.startupNome}</h3>
                  <p>{item.investidorNome}</p>
                </div>
                <div className="side">
                  <S.Status $status={item.status}>
                    {statusLabels[item.status]}
                  </S.Status>
                  <Button $variant="secondary" onClick={() => onSelect(item)}>
                    Ver detalhes
                  </Button>
                </div>
              </S.MeetingCard>
            ))}
        </section>
      ))}
    </div>
  );
}
