import styled from 'styled-components';
import {
  Main as SharedMain,
  Card as SharedCard,
} from '@/shared/components/profile/Profile.styles';
import { Button } from '@/shared/components/ui/Button';

export const Main = styled(SharedMain)`
  .notice {
    padding: 12px 18px;
    background: ${({ theme }) => theme.colors.accentSoft};
    border-radius: 10px;
    font-size: 13px;
  }
  .empty {
    text-align: center;
    padding: 40px 20px;
  }
  .empty .actions {
    justify-content: center;
  }
  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
`;
export const ScheduleButton = styled(Button)`
  @media (max-width: 48rem) {
    span {
      display: none;
    }
    padding-inline: 0.8rem;
  }
`;
export const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  > div {
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 14px;
    background: white;
    padding: 18px 20px;
  }
  strong {
    display: block;
    color: ${({ theme }) => theme.colors.accentStrong};
    font-size: 26px;
    margin-top: 6px;
  }
  span {
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 12px;
  }
  @media (max-width: 48rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    > div {
      padding: 15px;
    }
  }
`;
export const Toolbar = styled.section`
  .tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .tabs button {
    min-height: 44px;
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 9px;
    padding: 8px 14px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.appMuted};
    cursor: pointer;
  }
  .tabs [aria-pressed='true'] {
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
    border-color: ${({ theme }) => theme.colors.accentBorder};
    font-weight: 600;
  }
  .filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  .search {
    flex: 1;
    min-width: min(100%, 260px);
    display: flex;
    align-items: center;
    gap: 10px;
    background: white;
    padding: 0 14px;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 9px;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  input,
  select {
    min-height: 44px;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    padding: 8px 10px;
    border-radius: 9px;
    background: white;
    color: ${({ theme }) => theme.colors.appText};
    font-size: 12px;
    max-width: 100%;
  }
  .search input {
    width: 100%;
    min-width: 0;
    border: 0;
    padding-left: 0;
  }
  .switch {
    display: flex;
    gap: 3px;
    padding: 3px;
    background: white;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 9px;
  }
  .switch button {
    background: transparent;
    color: ${({ theme }) => theme.colors.appMuted};
    border: 0;
    border-radius: 6px;
    min-height: 38px;
    width: 40px;
    cursor: pointer;
  }
  .switch [aria-pressed='true'] {
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  .custom {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 14px;
  }
  .custom label {
    display: grid;
    gap: 4px;
    font-size: 12px;
  }
`;
export const MeetingCard = styled(SharedCard)<{ $soon?: boolean }>`
  display: grid;
  grid-template-columns: 95px minmax(0, 1fr) auto;
  gap: 22px;
  align-items: start;
  margin-bottom: 14px;
  ${({ $soon, theme }) => $soon && `border-color: ${theme.colors.accentBorder}; box-shadow: inset 3px 0 ${theme.colors.accent};`}
  .time {
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.appBorder};
    padding-right: 20px;
  }
  .time strong {
    display: block;
    font-size: 24px;
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  .time small {
    display: block;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  .person {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .avatar {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }
  h3 {
    margin: 12px 0 8px;
    text-transform: none;
    font-size: 17px;
    letter-spacing: -0.2px;
    color: ${({ theme }) => theme.colors.appText};
  }
  .person strong {
    font-size: 13px;
  }
  .person small {
    display: block;
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 11px;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 12px;
  }
  .side {
    display: grid;
    gap: 12px;
    justify-items: end;
  }
  button,
  a {
    font-size: 12px;
  }
  @media (max-width: 48rem) {
    grid-template-columns: 68px minmax(0, 1fr);
    gap: 14px;
    padding: 18px;
    .time {
      padding-right: 12px;
    }
    .time strong {
      font-size: 20px;
    }
    .side {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
    }
  }
`;
export const Status = styled.span<{ $status: string }>`
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  background: ${({ $status }) => ($status === 'pending' ? '#fff7e7' : $status === 'confirmed' ? '#edf4ee' : '#f1f1f5')};
  color: ${({ $status }) => ($status === 'pending' ? '#8a5a14' : $status === 'confirmed' ? '#506c53' : '#68758a')};
`;
export const Calendar = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.appBorder};
  background: white;
  border-radius: 16px;
  overflow: hidden;
  header {
    padding: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  header h2 {
    margin: 0;
  }
  header .actions {
    gap: 6px;
  }
  header button {
    font-size: 12px;
  }
  .weekdays,
  .days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  .weekdays span {
    text-align: center;
    padding: 10px 2px;
    background: ${({ theme }) => theme.colors.appBackground};
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 11px;
  }
  .day {
    min-height: 130px;
    border-top: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-right: 1px solid ${({ theme }) => theme.colors.appBorder};
    padding: 8px;
    min-width: 0;
  }
  .day[data-outside='true'] {
    background: #fafafa;
    color: #aaa;
  }
  .day time {
    display: inline-flex;
    padding: 2px 6px;
    font-size: 12px;
  }
  .day[data-today='true'] time {
    background: ${({ theme }) => theme.colors.accentStrong};
    color: white;
    border-radius: 50%;
  }
  .event {
    display: block;
    width: 100%;
    text-align: left;
    border: 0;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
    border-radius: 5px;
    font-size: 11px;
    padding: 7px;
    margin-top: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }
  .event span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (max-width: 48rem) {
    .day {
      min-height: 88px;
      padding: 4px 2px;
    }
    .event {
      padding: 5px 3px;
      font-size: 10px;
      min-height: 44px;
    }
    .event .subject {
      display: none;
    }
  }
`;
