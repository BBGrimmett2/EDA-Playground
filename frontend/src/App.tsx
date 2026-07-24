/**
 * Main Application Component
 */

import '@patternfly/react-core/dist/styles/base.css';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/Layout/AppLayout';
import { EventSenderForm } from './components/EventSenderForm/EventSenderForm';

function App() {
  return (
    <AppProvider>
      <AppLayout>
        <EventSenderForm />
      </AppLayout>
    </AppProvider>
  );
}

export default App;
