import styled from 'styled-components';
import { Button } from '@/shared/components/ui/Button';
import { Card as DiscoveryCard } from '@/features/explore-startups/Explore.styles';

export const PreferencesButton = styled(Button)`
  @media (max-width: 48rem) {
    padding-inline: 0.8rem;
    span {
      display: none;
    }
  }
`;

export const Intro = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding: 22px 26px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.accentSoft};
  .intro-copy {
    display: flex;
    align-items: center;
    gap: 15px;
    max-width: 510px;
  }
  .intro-copy > svg {
    color: ${({ theme }) => theme.colors.accentStrong};
    flex-shrink: 0;
  }
  h2 {
    margin: 0 0 7px;
    font-size: 17px;
  }
  p {
    margin: 0;
    font-size: 12px;
  }
  dl {
    display: flex;
    gap: 24px;
    margin: 0;
    flex-wrap: wrap;
  }
  dd {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  dt {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  @media (max-width: 48rem) {
    padding: 20px;
    dl {
      gap: 20px;
    }
  }
`;
export const Highlight = styled.section`
  margin: 0 0 30px;
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  background: white;
  border-radius: 18px;
  padding: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 28px;
  .eyebrow {
    color: ${({ theme }) => theme.colors.accentStrong};
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0 0 18px;
  }
  .identity {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  h2 {
    margin: 0 0 7px;
    font-size: 25px;
  }
  .meta {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  .tagline {
    font-size: 18px;
    margin: 20px 0 14px;
    font-family: ${({ theme }) => theme.fonts.heading};
    color: ${({ theme }) => theme.colors.appText};
  }
  .reasons {
    padding-left: 26px;
    border-left: 1px solid ${({ theme }) => theme.colors.appBorder};
  }
  h3 {
    margin: 18px 0 10px;
    font-size: 13px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 20px;
  }
  li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 12px;
    margin: 9px 0;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  li svg {
    color: ${({ theme }) => theme.colors.accentStrong};
    flex-shrink: 0;
    margin-top: 3px;
  }
  .actions {
    margin-top: 18px;
  }
  .actions a,
  .actions button {
    font-size: 12px;
  }
  @media (max-width: 48rem) {
    grid-template-columns: 1fr;
    padding: 22px;
    gap: 20px;
    .reasons {
      padding: 20px 0 0;
      border-left: 0;
      border-top: 1px solid ${({ theme }) => theme.colors.appBorder};
    }
  }
`;
export const Filters = styled.section`
  margin-bottom: 28px;
  .search {
    display: flex;
    gap: 12px;
    align-items: center;
    background: white;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 12px;
    padding: 5px 16px;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  .search input {
    border: 0;
    padding: 10px 0;
    width: 100%;
    min-width: 0;
    background: transparent;
    font-size: 13px;
    color: inherit;
  }
  .quick {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 14px 0;
    align-items: center;
  }
  .quick button {
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    background: transparent;
    color: ${({ theme }) => theme.colors.appMuted};
    border-radius: 8px;
    padding: 7px 13px;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .quick [aria-pressed='true'],
  .quick [aria-expanded='true'] {
    background: ${({ theme }) => theme.colors.accentSoft};
    border-color: ${({ theme }) => theme.colors.accentBorder};
    color: ${({ theme }) => theme.colors.accentStrong};
    font-weight: 600;
  }
  .quick .more {
    margin-left: auto;
  }
  .controls {
    display: none;
    gap: 9px;
    flex-wrap: wrap;
  }
  .controls[data-open='true'] {
    display: flex;
  }
  .controls select {
    max-width: 215px;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    background: white;
    color: ${({ theme }) => theme.colors.appMuted};
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 11px;
  }
  .controls [data-active='true'] {
    border-color: ${({ theme }) => theme.colors.accentStrong};
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .chips button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
    border: 0;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 11px;
  }
  .clear {
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.accentStrong};
    font-size: 12px;
    padding: 5px 10px;
  }
  @media (max-width: 48rem) {
    .controls {
      display: none;
    }
    .controls[data-open='true'] {
      display: flex;
    }
    .controls select {
      width: 100%;
      max-width: none;
    }
    .quick .more {
      margin-left: 0;
    }
  }
`;
export const Status = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  padding: 5px 9px;
  border-radius: 6px;
  font-weight: 600;
  background: ${({ $status }) => (['conversation', 'connected', 'mutual'].includes($status) ? '#edf3ed' : '#f3f0f7')};
  color: ${({ $status }) => (['conversation', 'connected', 'mutual'].includes($status) ? '#506c53' : '#766482')};
`;
export const MatchCard = styled(DiscoveryCard)`
  .match-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin: 18px 0 0;
    flex-wrap: wrap;
  }
  .body > .description {
    margin: 20px 0;
  }
  details {
    margin: 18px 0 0;
    padding-top: 15px;
    border-top: 1px solid ${({ theme }) => theme.colors.appBorder};
  }
  summary {
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accentStrong};
    cursor: pointer;
    min-height: 32px;
  }
  .factors {
    display: grid;
    gap: 8px;
    padding: 0;
    list-style: none;
    margin: 10px 0 16px;
  }
  .factors li {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  .factors svg {
    margin-top: 3px;
    flex-shrink: 0;
  }
  .connection-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .connection-actions a,
  .connection-actions button {
    font-size: 11px;
    min-height: 44px;
  }
  .discard {
    background: transparent;
    border: 0;
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 11px;
    padding: 5px 0;
    margin-top: 10px;
  }
  .initials-banner {
    background: ${({ theme }) => theme.colors.accentSoft};
    min-height: 88px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-size: 13px;
    font-family: ${({ theme }) => theme.fonts.heading};
  }
`;
export const Connections = styled.section`
  margin-top: 30px;
  padding-top: 28px;
  border-top: 1px solid ${({ theme }) => theme.colors.appBorder};
  > h2 {
    margin: 0 0 8px;
    font-size: 22px;
  }
  > p {
    margin: 0 0 20px;
    font-size: 13px;
  }
  .items {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  article {
    background: white;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 14px;
    padding: 20px;
  }
  .identity {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  h3 {
    margin: 0 0 6px;
    font-size: 17px;
  }
  time {
    display: block;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.appMuted};
    margin: 14px 0 8px;
  }
  blockquote {
    margin: 0 0 14px;
    padding-left: 12px;
    border-left: 2px solid ${({ theme }) => theme.colors.accentBorder};
    font-size: 12px;
    color: ${({ theme }) => theme.colors.appMuted};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .actions a {
    font-size: 12px;
  }
  @media (max-width: 48rem) {
    .items {
      grid-template-columns: 1fr;
    }
  }
`;
