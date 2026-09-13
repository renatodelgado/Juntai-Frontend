import styled from 'styled-components';

export const Brand = styled.img`
  width: clamp(8rem, 18vw, 11rem);
  height: auto;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Status = styled.span`
  padding: 0.4rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 2rem;
  background: ${({ theme }) => theme.colors.background};
  font-size: 0.8rem;
  font-weight: 500;
`;

export const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(2rem, 4vw, 4rem);
  padding: clamp(2.5rem, 6vw, 5rem) 0;

  @media (max-width: 48rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SymbolComposition = styled.div`
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  width: 100%;
  max-width: 20rem;
  aspect-ratio: 1;
  justify-self: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};

  &::before {
    content: '';
    position: absolute;
    inset: 12%;
    z-index: -1;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
  }

  img {
    width: 56%;
    height: auto;
  }

  @media (max-width: 48rem) {
    max-width: 12rem;
  }
`;

export const HeroCopy = styled.div`
  container-type: inline-size;
`;

export const Eyebrow = styled.p`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;

  &::before {
    content: '';
    flex-shrink: 0;
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.terracotta};
  }
`;

export const Title = styled.h1`
  margin: 0;
  max-width: 50rem;
  font-size: clamp(1.75rem, 8cqi, 3.25rem);
  letter-spacing: -0.035em;
  white-space: nowrap;

  span {
    color: ${({ theme }) => theme.colors.terracotta};
  }

  .wide-break {
    display: none;
  }

  @container (min-width: 32rem) {
    .wide-break {
      display: initial;
    }

    .narrow-break {
      display: none;
    }
  }
`;

export const Description = styled.p`
  max-width: 42rem;
  margin: 1.5rem 0 0;
  font-size: 1.1rem;
`;

export const Card = styled.section`
  padding: clamp(1.5rem, 4vw, 2rem);
  background: ${({ theme }) => theme.colors.darkSlateBlue};
  color: ${({ theme }) => theme.colors.white};
  border-top: 4px solid ${({ theme }) => theme.colors.terracotta};
  border-radius: ${({ theme }) => theme.radii.card};
  h2 {
    margin-top: 0;
  }
  p {
    margin-bottom: 0;
  }
`;
