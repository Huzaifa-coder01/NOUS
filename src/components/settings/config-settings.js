import { defaultFont } from 'src/theme/core/typography';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'app-settings';

export const defaultSettings = {
  colorScheme: 'light', // 'light' | 'dark'
  direction: 'ltr', // 'rtl' | 'ltr'
  contrast: 'default',
  navLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
  primaryColor: 'blue', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
  navColor: 'integrate',
  compactLayout: true,
  fontFamily: defaultFont, // 'Public Sans', 'Inter', 'DM Sans', 'Nunito Sans'
};
