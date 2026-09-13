import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    min-width: 320px;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.darkSlateBlue};
    font-family: ${({ theme }) => theme.fonts.body};
    line-height: 1.6;
  }
  button, input, textarea, select { font: inherit; }
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: 700;
    line-height: 1.2;
  }
  a {
    color: inherit;
    text-underline-offset: 0.2em;
    text-decoration-thickness: 2px;
  }
  a:hover { text-decoration-color: ${({ theme }) => theme.colors.terracotta}; }
  ::selection {
    background: ${({ theme }) => theme.colors.darkSlateBlue};
    color: ${({ theme }) => theme.colors.white};
  }
  :focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 4px;
  }
  img { display: block; max-width: 100%; }
`;
