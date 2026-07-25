/**
 * Main Application Component with Routing
 */

import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/Layout/AppLayout';
import { EventSenderForm } from './components/EventSenderForm/EventSenderForm';
import { OAuthCallback } from './components/Auth/OAuthCallback';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Main application page */}
          <Route
            path="/"
            element={
              <AppLayout>
                <EventSenderForm />
              </AppLayout>
            }
          />

          {/* OAuth callback route */}
          <Route
            path="/auth/callback"
            element={
              <AppLayout>
                <OAuthCallback />
              </AppLayout>
            }
          />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
