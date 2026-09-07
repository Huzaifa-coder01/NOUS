import 'src/global.css';

import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from 'src/store';
import { Router } from 'src/routes/sections';

import { ThemeProvider } from 'src/theme/theme-provider';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SettingsProvider settings={defaultSettings}>
          <ThemeProvider>
            <MotionLazy>
              <AuthProvider>
                <Snackbar />
                <ProgressBar />
                <SettingsDrawer />
                <Router />
              </AuthProvider>
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
