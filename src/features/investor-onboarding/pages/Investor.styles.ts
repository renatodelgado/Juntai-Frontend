import styled from 'styled-components';
export { investorTheme } from '@/shared/styles/theme';
export const InvestorBackground = styled.div`
  min-height: 100dvh;
  padding: 1px 0;
  background: ${({ theme }) => theme.colors.investor};
`;
