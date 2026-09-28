import styled from 'styled-components';
import { Button } from '../ui/Button';

export const Layout = styled.div<{ $audience?: 'startup' | 'investor' }>`
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.appBackground};
  color: ${({ theme }) => theme.colors.appText};
  padding-bottom: 3rem;
`;
export const Main = styled.main`
  width: min(100% - 4rem, 82.5rem);
  margin: 0 auto;
  padding-top: 2rem;
  display: grid;
  gap: 1.5rem;
  h1 {
    font-size: clamp(1.6rem, 2.6vw, 2.15rem);
    letter-spacing: -0.035em;
    margin: 0 0 0.5rem;
  }
  h2 {
    font-size: 1.12rem;
    letter-spacing: -0.015em;
    line-height: 1.4;
  }
  h3 {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.075em;
    color: ${({ theme }) => theme.colors.appMuted};
    margin-top: 1.5rem;
  }
  p {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  @media (max-width: 48rem) {
    width: calc(100% - 2rem);
    padding-top: 1.25rem;
    gap: 1rem;
  }
`;
export const Card = styled.section`
  min-width: 0;
  padding: clamp(1.25rem, 2vw, 1.75rem);
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.appBorder};
  box-shadow: 0 2px 2px ${({ theme }) => theme.colors.appText}03;
  > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  > header h2 {
    margin: 0;
  }
  > h2:first-child {
    margin-top: 0;
  }
  p {
    margin: 0.6rem 0;
  }
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  @media (max-width: 48rem) {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
`;
export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentSoft};
  font-size: 0.75rem;
  font-weight: 600;
  &[aria-current='step'] {
    background: ${({ theme }) => theme.colors.accentStrong};
    color: ${({ theme }) => theme.colors.white};
  }
`;
export const Avatar = styled.div`
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  background: ${({ theme }) => theme.colors.accentSoft};
  color: ${({ theme }) => theme.colors.accentStrong};
  font-size: 1.75rem;
  font-weight: 700;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
export const Muted = styled.p`
  color: ${({ theme }) => theme.colors.appMuted};
  font-size: 0.82rem;
`;
export const Progress = styled.progress`
  display: block;
  width: 100%;
  height: 0.6rem;
  margin: 1.25rem 0;
  border: 0;
  border-radius: 2rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.appBackground};
  accent-color: ${({ theme }) => theme.colors.accentStrong};
  &::-webkit-progress-bar {
    background: ${({ theme }) => theme.colors.appBackground};
    border-radius: 2rem;
  }
  &::-webkit-progress-value {
    background: ${({ theme }) => theme.colors.accentStrong};
    border-radius: 2rem;
  }
  &::-moz-progress-bar {
    background: ${({ theme }) => theme.colors.accentStrong};
    border-radius: 2rem;
  }
`;
export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  > div {
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 0.78rem;
  }
  strong {
    display: block;
    margin-top: 0.45rem;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.colors.appText};
    overflow-wrap: anywhere;
  }
`;
export const CanvasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  button {
    text-align: left;
    min-width: 0;
    padding: 1rem;
    min-height: 8rem;
    border-radius: 0.85rem;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    color: inherit;
    background: ${({ theme }) => theme.colors.appBackground};
    font: inherit;
    cursor: pointer;
  }
  button:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }
  strong {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  span {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 0.6rem;
    overflow-wrap: anywhere;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  @media (max-width: 40rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const ProfileColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18.5rem;
  gap: 1.5rem;
  align-items: start;
  @media (max-width: 65rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const PrimaryColumn = styled.div`
  display: grid;
  gap: 1.5rem;
  min-width: 0;
  @media (max-width: 48rem) {
    gap: 1rem;
  }
`;
export const SupportColumn = styled.aside`
  display: grid;
  gap: 1.25rem;
  min-width: 0;
  h2 {
    font-size: 1rem;
  }
  @media (min-width: 48rem) and (max-width: 65rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
export const IdentityCard = styled(Card)`
  border-top: 3px solid ${({ theme }) => theme.colors.accent};
  padding: clamp(1.5rem, 3vw, 2rem);
  h1 {
    margin: 0;
  }
  > ${Row} {
    gap: 1.25rem;
  }
`;
export const ContextBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.82rem;
  > div {
    display: flex;
    gap: 0.65rem;
    align-items: center;
  }
  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.accentStrong};
    font-weight: 600;
  }
  p {
    margin: 0;
  }
`;
export const StatusCard = styled(Card)<{ $status?: string }>`
  background: ${({ theme, $status }) => (!$status || ['pendente', 'in_review'].includes($status) ? theme.colors.statusBackground : theme.colors.white)};
  border-color: ${({ theme, $status }) => (!$status || ['pendente', 'in_review'].includes($status) ? theme.colors.statusBorder : theme.colors.accentBorder)};
  h2 {
    margin: 0.65rem 0;
  }
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  > ${Badge} {
    color: ${({ theme }) => theme.colors.statusText};
    background: transparent;
    padding: 0;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-size: 0.68rem;
  }
`;
export const FeatureCard = styled(Card)`
  background: ${({ theme }) => theme.colors.accentStrong};
  color: ${({ theme }) => theme.colors.white};
  border-color: transparent;
  h2 {
    color: inherit;
  }
  p {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.88;
    font-size: 0.85rem;
  }
  > svg {
    margin-bottom: 1rem;
  }
  ${Muted} {
    margin-top: 1rem;
    padding: 0.75rem;
    border: 1px solid #ffffff30;
    border-radius: 0.75rem;
    font-size: 0.74rem;
  }
`;
export const EditButton = styled(Button).attrs({ $variant: 'quiet' as const })`
  min-height: 2rem;
  width: 2rem;
  padding: 0;
  flex-shrink: 0;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.appMuted};
  background: ${({ theme }) => theme.colors.appBackground};
`;
export const CompletionActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
  button,
  a {
    justify-content: flex-start;
    text-align: left;
    min-height: 2.5rem;
    font-size: 0.75rem;
    padding: 0.5rem 0.65rem;
    color: ${({ theme }) => theme.colors.accentStrong};
    background: ${({ theme }) => theme.colors.appBackground};
  }
  @media (max-width: 28rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const PitchQuote = styled.blockquote`
  margin: 0;
  padding: 1.3rem;
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.accentSoft};
  font-size: 1.05rem;
  font-style: italic;
  line-height: 1.7;
  overflow-wrap: anywhere;
`;
