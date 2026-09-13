const palette = {
  darkSlateBlue: '#3E327F',
  terracotta: '#E6655E',
  white: '#FFFFFF',
} as const;

export const theme = {
  colors: {
    ...palette,
    background: '#F3F1F8',
    border: '#E6E2F0',
    startup: palette.terracotta,
    startupStrong: '#A83C36',
    startupSoft: '#FFF3F0',
    startupBackground: '#FCF3EF',
    startupBorder: '#F0DDD6',
    investor: palette.darkSlateBlue,
    accent: palette.terracotta,
    accentStrong: '#A83C36',
    accentSoft: '#FFF3F0',
    accentBorder: '#F0DDD6',
    muted: '#726C86',
    error: '#B42332',
    overlay: `${palette.darkSlateBlue}A6`,
  },
  fonts: {
    heading: '"Quicksand", system-ui, sans-serif',
    body: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  radii: { card: '1.25rem', input: '0.75rem', pill: '999px' },
  spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
} as const;

export type AppTheme = Omit<typeof theme, 'colors'> & {
  colors: { [K in keyof typeof theme.colors]: string };
};

export const investorTheme: AppTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    accent: theme.colors.investor,
    accentStrong: theme.colors.investor,
    accentSoft: theme.colors.background,
    accentBorder: theme.colors.border,
  },
};
