// Courtly Design Tokens
export const colors = {
  // Primary
  deepNavy: '#14232D',
  midnightBlue: '#101C25',
  warmIvory: '#F7F5F0',
  softWhite: '#FFFFFF',
  champagneGold: '#C7A979',
  slateGray: '#667580',
  mutedBorder: '#E5E8E8',
  
  // Semantic
  success: '#237A57',
  warning: '#B78032',
  error: '#B94B4B',
  info: '#356C91',
  
  // Extended
  goldLight: '#D4B88C',
  goldDark: '#A68B5B',
  navyLight: '#1D3344',
  navyDarker: '#0A1419',
  ivoryDark: '#EDE9E0',
  grayLight: '#8A9AA5',
  grayLighter: '#B8C4CC',
  borderLight: '#F0F1F1',
} as const;

export const typography = {
  fontSans: '"Inter", "Geist", system-ui, -apple-system, sans-serif',
  fontSerif: '"Playfair Display", "Georgia", serif',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const radii = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '14px',
  full: '9999px',
} as const;
