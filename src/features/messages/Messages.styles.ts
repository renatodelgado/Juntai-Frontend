import styled from 'styled-components';

export const Page = styled.main`
  max-width: 90rem;
  margin: auto;
  min-width: 0;
  > header {
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  h1 {
    margin: 0 0 0.4rem;
    font-size: clamp(1.8rem, 3vw, 2.5rem);
  }
  > header p {
    margin: 0;
  }
  .demo {
    font-size: 0.8rem;
    margin-top: 0.7rem;
    opacity: 0.9;
  }
`;
export const Workspace = styled.section<{ $selected: boolean }>`
  display: grid;
  grid-template-columns: minmax(17rem, 32%) minmax(0, 1fr);
  height: max(36rem, calc(100dvh - 12rem));
  max-height: 65rem;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  button,
  input,
  textarea,
  select {
    font: inherit;
  }
  button {
    cursor: pointer;
  }
  button:disabled {
    cursor: not-allowed;
  }
  input,
  textarea,
  select {
    color: inherit;
  }
  small,
  time {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
  }
  @media (max-width: 45rem) {
    grid-template-columns: minmax(0, 1fr);
    height: calc(100dvh - 15rem);
    min-height: 28rem;
    > aside {
      display: ${({ $selected }) => ($selected ? 'none' : 'flex')};
    }
    > section {
      display: ${({ $selected }) => ($selected ? 'flex' : 'none')};
    }
  }
`;
export const List = styled.aside`
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  > header {
    padding: 1.5rem 1.1rem 1rem;
  }
  h2 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: ${({ theme }) => theme.colors.background};
    padding: 0.7rem;
    border-radius: 0.7rem;
  }
  input {
    width: 100%;
    min-width: 0;
    border: 0;
    background: transparent;
    outline-offset: 5px;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 1rem;
  }
  nav button {
    border: 0;
    padding: 0.4rem 0.6rem;
    border-radius: 2rem;
    background: transparent;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
  }
  nav button[aria-pressed='true'] {
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
    font-weight: 700;
  }
  > div {
    overflow-y: auto;
    flex: 1;
    padding: 0 0.6rem;
  }
  > footer {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding: 1rem;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
    display: flex;
    gap: 0.5rem;
  }
`;
export const ConversationItem = styled.button`
  display: flex;
  width: 100%;
  gap: 0.75rem;
  text-align: left;
  padding: 1rem 0.6rem;
  border: 1px solid transparent;
  border-radius: 0.8rem;
  background: transparent;
  color: inherit;
  margin-bottom: 0.4rem;
  &[aria-current='true'] {
    background: ${({ theme }) => theme.colors.accentSoft};
    border-color: ${({ theme }) => theme.colors.accentBorder};
  }
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
  > div {
    min-width: 0;
    flex: 1;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
  }
  strong {
    font-size: 0.9rem;
  }
  p {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.8rem;
    margin: 0.5rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
  }
  small {
    display: block;
    margin-top: 0.25rem;
  }
`;
export const Avatar = styled.span`
  display: inline-grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.nileBlue};
  font-weight: 700;
  font-size: 0.95rem;
`;
export const Thread = styled.section`
  display: flex;
  min-height: 0;
  min-width: 0;
  flex-direction: column;
  > header {
    padding: 1.1rem 1.5rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  > header .identity {
    flex: 1;
    min-width: 8rem;
  }
  h2 {
    font-size: 1rem;
    margin: 0 0 0.3rem;
  }
  .back {
    display: none;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .actions button {
    font-size: 0.8rem;
  }
  .options {
    position: relative;
  }
  .options > div {
    position: absolute;
    right: 0;
    top: 100%;
    padding: 0.5rem;
    background: white;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0.8rem;
    z-index: 2;
    width: 13rem;
    box-shadow: 0 6px 18px #1b485512;
  }
  @media (max-width: 45rem) {
    > header {
      padding: 0.75rem;
    }
    .back {
      display: inline-flex;
    }
    .actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
`;
export const Match = styled.details`
  margin: 1rem 1.5rem 0;
  padding: 0.8rem 1rem;
  background: ${({ theme }) => theme.colors.accentSoft};
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  border-radius: 0.75rem;
  font-size: 0.8rem;
  summary {
    cursor: pointer;
    font-weight: 600;
  }
  p {
    line-height: 1.6;
    margin: 0.6rem 0;
  }
  button {
    font-size: 0.8rem;
    min-height: 2rem;
  }
`;
export const Timeline = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  .date {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    margin: 0.4rem 0 1.5rem;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.muted};
  }
  .date::before,
  .date::after {
    content: '';
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
    flex: 1;
  }
`;
export const Bubble = styled.article<{ $own: boolean }>`
  max-width: 85%;
  width: fit-content;
  margin: 0 ${({ $own }) => ($own ? '0 1.25rem auto' : 'auto 1.25rem 0')};
  > div {
    padding: 0.85rem 1rem;
    border-radius: 0.85rem;
    background: ${({ theme, $own }) => ($own ? theme.colors.accentSoft : theme.colors.background)};
  }
  strong {
    font-size: 0.75rem;
  }
  p {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 0.9rem;
    line-height: 1.65;
    margin: 0.35rem 0;
  }
  time {
    display: flex;
    gap: 0.3rem;
    align-items: center;
    margin-top: 0.4rem;
    justify-content: ${({ $own }) => ($own ? 'flex-end' : 'flex-start')};
  }
  a {
    overflow-wrap: anywhere;
  }
`;
export const Composer = styled.form`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem 1.5rem;
  background: white;
  > div {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  textarea {
    resize: vertical;
    width: 100%;
    min-height: 3rem;
    max-height: 8rem;
    border: 0;
    background: transparent;
    padding: 0.7rem 0.4rem;
  }
  > small {
    display: block;
    margin-top: 0.5rem;
  }
`;
export const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  > svg {
    color: ${({ theme }) => theme.colors.accentStrong};
    margin-bottom: 1rem;
  }
  h2 {
    color: ${({ theme }) => theme.colors.nileBlue};
    font-size: 1.2rem;
  }
  p {
    font-size: 0.9rem;
    max-width: 22rem;
    line-height: 1.6;
  }
`;
export const Form = styled.form`
  display: grid;
  gap: 1rem;
  label {
    display: grid;
    gap: 0.5rem;
    font-weight: 600;
  }
  input,
  select,
  textarea {
    width: 100%;
    font: inherit;
    color: inherit;
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0.6rem;
    background: white;
  }
`;
