import styled from 'styled-components';

export const Header = styled.header`
  padding: 0.5rem 0 0.75rem;
  min-width: 0;
  .heading-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
  }
  .heading-copy {
    min-width: 0;
    flex: 1;
  }
  && h1 {
    font-size: clamp(1.6rem, 2.6vw, 2.15rem);
    letter-spacing: -0.035em;
    margin: 0 0 0.5rem;
    color: ${({ theme }) => theme.colors.appText};
    overflow-wrap: anywhere;
  }
  && p {
    margin: 0;
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 0.875rem;
    max-width: 46rem;
    line-height: 1.65;
  }
  .heading-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  nav {
    margin-bottom: 1rem;
  }
  ol {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  li,
  li a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  li a {
    text-decoration: none;
    min-height: 28px;
  }
  li a:hover {
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  [aria-current='page'] {
    color: ${({ theme }) => theme.colors.accentStrong};
    font-weight: 600;
  }
  @media (max-width: 48rem) {
    .heading-row {
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .heading-actions {
      gap: 0.5rem;
    }
  }
`;
