
export const theme = {
  colors: {
    primary: '#6C63FF',
    secondary: '#2A2D3E',
    background: '#1A1C2E',
    surface: '#2A2D3E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
    disabled: '#666666',
    white: '#FFFFFF',
  },
  gradients: {
    primary: {
      start: '#000000',
      end: '#1850a4',
    },
    secondary: {
      start: '#1850a4',
      end: '#00ff00',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    },
    small: {
      fontSize: 12,
    },
  },
} as const;

export type Theme = typeof theme;

export default theme; 