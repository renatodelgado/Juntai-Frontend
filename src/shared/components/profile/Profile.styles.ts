import styled from 'styled-components';

export const Layout = styled.div<{ $audience?: 'startup' | 'investor' }>`
  min-height: 100dvh;
  background: ${({ theme, $audience }) => ($audience === 'investor' ? theme.colors.investor : theme.colors.startupBackground)};
  padding: 2rem 2rem 3rem 16rem;
  @media (max-width: 60rem) {
    padding: 1rem;
  }
`;
export const Sidebar = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: 14rem;
  padding: 2rem 1rem;
  background: ${({ theme }) => theme.colors.white};
  border-right: 1px solid ${({ theme }) => theme.colors.accentBorder};
  img {
    width: 7rem;
    margin: 0 1rem 2rem;
  }
  nav {
    display: grid;
    gap: 0.5rem;
  }
  nav a,
  nav button {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.85rem;
    border: 0;
    border-radius: 0.75rem;
    text-decoration: none;
    font: inherit;
    color: inherit;
    background: transparent;
    text-align: left;
  }
  nav [aria-current] {
    color: ${({ theme }) => theme.colors.accentStrong};
    background: ${({ theme }) => theme.colors.accentSoft};
    font-weight: 700;
  }
  nav button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  small {
    display: block;
    padding: 1rem;
    color: ${({ theme }) => theme.colors.muted};
  }
  > button {
    display: none;
  }
  @media (max-width: 60rem) {
    position: static;
    width: auto;
    border: 0;
    border-radius: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
    img {
      margin: 0;
      width: 6rem;
    }
    > button {
      display: inline-flex;
      float: right;
    }
    nav {
      margin-top: 1rem;
    }
    nav[data-open='false'],
    small {
      display: none;
    }
  }
`;
export const Main = styled.main`
  max-width: 75rem;
  margin: auto;
  display: grid;
  gap: 1.5rem;
  h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
  }
  h2 {
    font-size: 1.3rem;
  }
  h3 {
    font-size: 1rem;
  }
  p {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
`;
export const Card = styled.section`
  min-width: 0;
  padding: clamp(1.25rem, 3vw, 2rem);
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  > header h2 {
    margin: 0;
  }
  p {
    margin: 0.65rem 0;
  }
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  @media (max-width: 48rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 2rem;
  color: ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentSoft};
  font-size: 0.85rem;
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
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.accentSoft};
  color: ${({ theme }) => theme.colors.accentStrong};
  font-size: 1.75rem;
  font-weight: 700;
`;
export const Muted = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
`;
export const Progress = styled.progress`
  width: 100%;
  height: 0.6rem;
  accent-color: ${({ theme }) => theme.colors.accentStrong};
`;
export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  > div {
    padding: 1rem;
    background: ${({ theme }) => theme.colors.accentSoft};
    border-radius: 0.8rem;
  }
  strong {
    display: block;
    margin-top: 0.5rem;
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
    border-radius: 0.8rem;
    border: 1px solid ${({ theme }) => theme.colors.accentBorder};
    color: inherit;
    background: ${({ theme }) => theme.colors.accentSoft};
    font: inherit;
  }
  span {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 0.5rem;
    overflow-wrap: anywhere;
  }
  @media (max-width: 40rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
