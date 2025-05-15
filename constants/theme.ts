import colors from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

export type ThemeType = 'light' | 'dark';

export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    notification: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: colors.neutral[50],
    card: colors.white,
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    border: colors.neutral[200],
    notification: colors.accent[500],
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    accent: colors.accent[500],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: colors.neutral[900],
    card: colors.neutral[800],
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    border: colors.neutral[700],
    notification: colors.accent[400],
    primary: colors.primary[400],
    secondary: colors.secondary[400],
    accent: colors.accent[400],
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.error[400],
  },
};

export default {
  spacing,
  fontSize,
  borderRadius,
  shadows,
  lightTheme,
  darkTheme,
};