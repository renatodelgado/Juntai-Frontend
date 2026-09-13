import styled, { css } from 'styled-components';

export const FieldRoot = styled.div`
  position: relative;
  display: grid;
  gap: 0.5rem;
  min-width: 0;
`;
export const Label = styled.label`
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  span {
    font-weight: 400;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.muted};
  }
`;
export const Hint = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
`;
export const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
`;
const control = css`
  width: 100%;
  min-width: 0;
  min-height: 3.25rem;
  padding: 0.85rem 1rem;
  color: ${({ theme }) => theme.colors.darkSlateBlue};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.input};
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accentStrong};
    outline-offset: 2px;
  }
  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.error};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
    opacity: 1;
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    cursor: not-allowed;
  }
`;
export const ErrorBalloon = styled.span`
  position: absolute;
  z-index: 3;
  right: 0.25rem;
  top: 1.25rem;
  transform: translateY(-100%);
  max-width: min(85%, 22rem);
  padding: 0.4rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.input};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.error};
  font-size: 0.75rem;
  line-height: 1.4;
  box-shadow: 0 3px 10px ${({ theme }) => theme.colors.error}20;
  &::after {
    content: '';
    position: absolute;
    right: 0.85rem;
    top: 100%;
    border: 5px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.error};
  }
`;
export const InputControl = styled.input`
  ${control}
`;
export const TextareaControl = styled.textarea`
  ${control} resize: vertical;
  min-height: 7rem;
`;
export const SelectControl = styled.select`
  ${control} padding-right: 2rem;
`;
export const Fieldset = styled.fieldset`
  position: relative;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  legend {
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
`;
export const ChoiceGrid = styled.div<{ $cards?: boolean }>`
  display: ${({ $cards }) => ($cards ? 'grid' : 'flex')};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  flex-wrap: wrap;
  gap: 0.65rem;
`;
export const ChoiceLabel = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  min-height: 2.9rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid
    ${({ theme, $checked }) => ($checked ? theme.colors.accentStrong : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.input};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.accentSoft : theme.colors.white)};
  cursor: pointer;
  input {
    accent-color: ${({ theme }) => theme.colors.accentStrong};
    width: 1.1rem;
    height: 1.1rem;
    margin: 0.2rem 0 0;
    flex-shrink: 0;
  }
  small {
    display: block;
    color: ${({ theme }) => theme.colors.muted};
    margin-top: 0.3rem;
  }
  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.accentStrong};
    outline-offset: 2px;
  }
`;
export const RangeControl = styled.input`
  width: 100%;
  height: 2.75rem;
  accent-color: ${({ theme }) => theme.colors.accentStrong};
  cursor: pointer;
`;
export const Tag = styled.span`
  display: inline-flex;
  padding: 0.25rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.accentSoft};
  color: ${({ theme }) => theme.colors.accentStrong};
  font-size: 0.8rem;
  font-weight: 500;
`;
