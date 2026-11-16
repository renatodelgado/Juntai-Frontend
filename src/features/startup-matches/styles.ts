import styled from 'styled-components';
export const Summary = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  > div {
    padding: 1.25rem 1.5rem;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    background: ${({ theme }) => theme.colors.white};
    border-radius: 1rem;
  }
  strong {
    display: block;
    font-size: 1.8rem;
    color: ${({ theme }) => theme.colors.accentStrong};
    margin-top: 0.5rem;
  }
  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  @media (max-width: 36rem) {
    gap: 0.5rem;
    > div {
      padding: 1rem 0.65rem;
    }
    span {
      font-size: 0.72rem;
    }
    strong {
      font-size: 1.5rem;
    }
  }
`;
export const Filters = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 1rem;
  label {
    display: grid;
    gap: 0.4rem;
    font-size: 0.8rem;
    flex: 1;
    min-width: 9rem;
  }
  label:first-child {
    flex: 2;
    min-width: 14rem;
  }
  input,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    background: white;
    color: inherit;
    font: inherit;
    border-radius: 0.65rem;
  }
  @media (max-width: 36rem) {
    label:first-child {
      min-width: 100%;
    }
  }
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  @media (max-width: 54rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const Person = styled.article`
  padding: 1.5rem;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.appBorder};
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  h2 {
    margin: 0 0 0.35rem;
    font-size: 1.15rem;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .identity {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .identity > div:last-child {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .avatar {
    width: 3.5rem;
    height: 3.5rem;
    flex-shrink: 0;
    border-radius: 50%;
  }
  .meta {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  .bio {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .tags span,
  .status {
    font-size: 0.75rem;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.darkSlateBlue};
  }
  .status {
    align-self: start;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
    font-weight: 600;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: auto;
  }
  .actions button,
  .actions a {
    font-size: 0.8rem;
  }
  .waiting {
    padding: 0.75rem;
    border-radius: 0.65rem;
    background: ${({ theme }) => theme.colors.appBackground};
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
`;
export const Empty = styled.section`
  text-align: center;
  padding: 3rem 1.5rem;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.appBorder};
  border-radius: 1.25rem;
  svg {
    color: ${({ theme }) => theme.colors.accentStrong};
  }
  p {
    color: ${({ theme }) => theme.colors.appMuted};
    max-width: 34rem;
    margin: 1rem auto 1.5rem;
    line-height: 1.6;
  }
`;
export const Profile = styled.div`
  .identity {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .avatar {
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  h3 {
    margin-top: 1.5rem;
  }
  p {
    white-space: pre-wrap;
    line-height: 1.65;
  }
  ul {
    padding-left: 1.25rem;
    line-height: 1.8;
  }
  .meta {
    color: ${({ theme }) => theme.colors.appMuted};
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }
`;
