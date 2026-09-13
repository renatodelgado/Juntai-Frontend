import styled from 'styled-components';

export const PageContainer = styled.main`
  width: min(100% - 2rem, 72rem);
  margin: clamp(1rem, 4vw, 3rem) auto;
  padding: clamp(1.5rem, 5vw, 4rem);
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: 0 16px 48px ${({ theme }) => theme.colors.darkSlateBlue}08;
`;
