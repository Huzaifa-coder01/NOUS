import { useMemo, useState, useCallback, useEffect } from 'react';

import { STORAGE_KEY } from '../config-settings';
import { SettingsContext } from './settings-context';

// ----------------------------------------------------------------------

function readStored(defaultSettings) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

/**
 * Theme settings (color scheme, nav layout, font, ...) persisted per browser.
 *
 * The template shipped this in `src/components/settings/context/`, which an old
 * blanket `context/` rule in .gitignore kept out of the repo, so it is
 * reimplemented here against the same API the theme and drawer already use.
 */
export function SettingsProvider({ children, settings: defaultSettings }) {
  const [state, setState] = useState(() => readStored(defaultSettings));

  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable (private mode) - settings stay in memory
    }
  }, [state]);

  const onUpdate = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const onUpdateField = useCallback((name, value) => {
    setState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onReset = useCallback(() => {
    setState(defaultSettings);
  }, [defaultSettings]);

  const canReset = useMemo(
    () => Object.keys(defaultSettings).some((key) => state[key] !== defaultSettings[key]),
    [state, defaultSettings]
  );

  const memoizedValue = useMemo(
    () => ({
      ...state,
      canReset,
      onReset,
      onUpdate,
      onUpdateField,
      openDrawer,
      onCloseDrawer: () => setOpenDrawer(false),
      onToggleDrawer: () => setOpenDrawer((prev) => !prev),
    }),
    [state, canReset, onReset, onUpdate, onUpdateField, openDrawer]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
