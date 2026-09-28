import styled from 'styled-components';
import {
  Layout,
  Card,
  ProfileColumns,
  StatusCard,
  FeatureCard,
} from '@/shared/components/profile/Profile.styles';

export const DashboardLayout = styled(Layout)``;
export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem 0 0.75rem;
  h1 {
    margin: 0.75rem 0 0.4rem;
    overflow-wrap: anywhere;
  }
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted};
  }
  > div:first-child {
    flex: 1;
    min-width: min(100%, 16rem);
  }
`;
export const Columns = styled(ProfileColumns)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 20rem);
  gap: 1.5rem;
  align-items: start;
  > div {
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }
  @media (max-width: 64rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const Overview = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  > section {
    height: 100%;
  }
  @media (max-width: 46rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const StatusPanel = styled(StatusCard)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  > div {
    flex: 1;
    min-width: 0;
  }
  h2 {
    margin: 0.6rem 0;
  }
`;
export const TipsPanel = styled(FeatureCard)`
  background: ${({ theme }) => theme.colors.accentStrong};
  border-color: transparent;
  color: ${({ theme }) => theme.colors.white};
  h2 {
    margin-top: 0;
  }
  p {
    color: inherit;
    opacity: 0.9;
  }
  ul {
    padding-left: 1.2rem;
    line-height: 1.8;
  }
`;
export const Checklist = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 1rem 0;
  li {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    font-size: 0.8rem;
    line-height: 1.4;
  }
  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.accentStrong};
  }
`;
export const Details = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
  margin: 1.5rem 0;
  dt {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.muted};
  }
  dd {
    margin: 0.25rem 0 0;
    font-weight: 500;
    font-size: 0.9rem;
    overflow-wrap: anywhere;
  }
  @media (max-width: 30rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const Empty = styled.div`
  display: grid;
  justify-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
  margin-top: 1.25rem;
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.accentSoft};
  > svg {
    padding: 0.65rem;
    box-sizing: content-box;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  h3 {
    margin-bottom: 0;
  }
  p {
    max-width: 36rem;
    color: ${({ theme }) => theme.colors.muted};
  }
  a {
    margin-top: 0.4rem;
  }
`;
export const QuietSection = styled(Card)`
  h2 {
    margin-top: 0;
  }
`;
