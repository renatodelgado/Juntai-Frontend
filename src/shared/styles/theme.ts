export const theme = {
  colors: {
    background: '#f8faf9',
    surface: '#ffffff',
    text: '#182c26',
    muted: '#52645d',
    primary: '#176349',
    border: '#dce5df',
  },
  fonts: {
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  radii: { card: '1.25rem' },
  spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
} as const;

export type AppTheme = typeof theme;
