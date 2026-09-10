import styled from 'styled-components';

export const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(3.5rem, 12vw, 7rem);
  line-height: 1.1;
  letter-spacing: -0.05em;
`;

export const Description = styled.p`
  max-width: 42rem;
  margin: 2rem 0 3rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Card = styled.section`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  h2 {
    margin-top: 0;
  }
  p {
    margin-bottom: 0;
  }
`;
