import styled, { css } from 'styled-components';

export const Button = styled.button<{
  $variant?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'investor';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 3rem;
  padding: 0.7rem 1.2rem;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.input};
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  background: ${({ theme }) => theme.colors.accentStrong};
  color: ${({ theme }) => theme.colors.white};
  ${({ $variant, theme }) =>
    $variant === 'investor' &&
    css`
      background: ${theme.colors.investor};
      &:hover:not(:disabled) {
        box-shadow: 0 0 0 3px ${theme.colors.investor}30;
      }
    `}
  ${({ $variant, theme }) =>
    $variant === 'secondary' &&
    css`
      background: ${theme.colors.white};
      color: ${theme.colors.darkSlateBlue};
      border-color: ${theme.colors.border};
    `}
  ${({ $variant, theme }) =>
    $variant === 'quiet' &&
    css`
      background: transparent;
      color: ${theme.colors.darkSlateBlue};
      padding-inline: 0.5rem;
    `}
  &:hover:not(:disabled) {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}30;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  ${({ $variant, theme }) =>
    $variant === 'danger' &&
    css`
      background: transparent;
      color: ${theme.colors.error};
      &:hover:not(:disabled) {
        background: ${theme.colors.accentSoft};
        box-shadow: 0 0 0 2px ${theme.colors.error}20;
      }
    `}
  svg {
    flex-shrink: 0;
  }
`;
