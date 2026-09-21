import styled from 'styled-components';

export const JourneyBackground = styled.div`
  min-height: 100dvh;
  padding: 1px 0;
  background: ${({ theme }) => theme.colors.startupBackground};
`;

export const DeleteAction = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
`;

export const Shell = styled.main`
  width: min(100% - 2rem, 76rem);
  margin: 1.5rem auto;
  padding: clamp(1rem, 3vw, 2.5rem);
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: 0 12px 40px ${({ theme }) => theme.colors.darkSlateBlue}06;
  @media (max-width: 40rem) {
    width: calc(100% - 1rem);
    margin: 0.5rem auto;
  }
`;
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.5rem;
  img {
    width: 8rem;
    height: auto;
  }
  > div {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
`;
export const JourneyLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentSoft};
  font-size: 0.8rem;
  font-weight: 600;
`;
export const Content = styled.div`
  max-width: 48rem;
  margin: 2.5rem auto 0;
  h1 {
    scroll-margin-top: 8rem;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    margin: 0.75rem 0 1rem;
    letter-spacing: -0.03em;
    &[tabindex='-1']:focus {
      outline: none;
    }
  }
`;
export const Intro = styled.div`
  margin-bottom: 2rem;
  > p {
    color: ${({ theme }) => theme.colors.muted};
    margin: 0;
  }
  > span {
    color: ${({ theme }) => theme.colors.accentStrong};
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;
export const Fields = styled.div`
  display: grid;
  gap: 1.75rem;
`;
export const FormBody = styled.fieldset`
  margin: 0;
  padding: 0;
  min-width: 0;
  border: 0;
`;
export const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  @media (max-width: 38rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const Notice = styled.div`
  padding: 1rem 1.2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.input};
  background: ${({ theme }) => theme.colors.accentSoft};
  font-size: 0.9rem;
  p {
    margin: 0.5rem 0 0;
  }
`;
export const ErrorSummary = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
`;
export const Actions = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  @media (max-width: 40rem) {
    flex-direction: column-reverse;
    align-items: stretch;
    > div {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    > div > :only-child {
      grid-column: 1 / -1;
    }
  }
`;
export const SaveMessage = styled.p`
  min-height: 1.5rem;
  margin: 0.75rem 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.75rem;
  text-align: center;
`;
export const SubCard = styled.section`
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  h2,
  h3 {
    margin-top: 0;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  header h2,
  header h3 {
    margin: 0;
    font-size: 1.1rem;
  }
`;
export const CanvasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  > div {
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.input};
  }
  @media (min-width: 68rem) {
    grid-template-columns: repeat(10, minmax(0, 1fr));
    grid-template-areas:
      'partners partners activities activities value value relationships relationships customers customers'
      'partners partners resources resources value value channels channels customers customers'
      'costs costs costs costs costs revenue revenue revenue revenue revenue';
    > :nth-child(1) {
      grid-area: partners;
    }
    > :nth-child(2) {
      grid-area: activities;
    }
    > :nth-child(3) {
      grid-area: value;
    }
    > :nth-child(4) {
      grid-area: relationships;
    }
    > :nth-child(5) {
      grid-area: customers;
    }
    > :nth-child(6) {
      grid-area: resources;
    }
    > :nth-child(7) {
      grid-area: channels;
    }
    > :nth-child(8) {
      grid-area: costs;
    }
    > :nth-child(9) {
      grid-area: revenue;
    }
    label {
      font-size: 0.85rem;
      flex-wrap: wrap;
    }
    textarea {
      padding: 0.6rem;
      font-size: 0.85rem;
    }
  }
  @media (max-width: 38rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const SummaryList = styled.dl`
  display: grid;
  gap: 0.85rem;
  margin: 0;
  dt {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.8rem;
  }
  dd {
    margin: 0.15rem 0 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    > span {
      margin: 0.15rem 0.25rem 0.15rem 0;
    }
  }
`;
export const InlineRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  > :first-child {
    flex: 1;
    min-width: 0;
  }
`;

export const CanvasTile = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
  height: 100%;
  min-height: 10rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.darkSlateBlue};
  text-align: left;
  cursor: pointer;
  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    line-height: 1.3;
  }
  > span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  small {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: ${({ theme }) => theme.colors.accentStrong};
    margin-top: auto;
    font-weight: 600;
  }
`;
