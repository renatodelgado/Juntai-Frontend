const palette = {
  nileBlue: '#1B4855',
  mountainMeadow: '#1DAA58',
  white: '#FFFFFF',
} as const;

export const theme = {
  colors: {
    ...palette,
    background: '#F0F5F6',
    border: '#D5E2E5',
    startup: palette.mountainMeadow,
    startupStrong: '#13783E',
    startupSoft: '#EDF9F1',
    startupBackground: palette.mountainMeadow,
    startupBorder: '#C8E8D4',
    investor: palette.nileBlue,
    accent: palette.mountainMeadow,
    accentStrong: '#13783E',
    accentSoft: '#EDF9F1',
    accentBorder: '#C8E8D4',
    muted: '#587078',
    error: '#B42332',
    overlay: `${palette.nileBlue}A6`,
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
