import { useContext, createContext } from 'react';

// ----------------------------------------------------------------------

export const SettingsContext = createContext(undefined);

export const SettingsConsumer = SettingsContext.Consumer;

export function useSettingsContext() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettingsContext: Context must be used inside SettingsProvider');
  }

  return context;
}
