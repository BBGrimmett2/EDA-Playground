/**
 * Application Context - Global State Management
 */

import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, Action } from '../types/integration';

const initialState: AppState = {
  integrations: [],
  selectedIntegration: null,
  payload: '',
  webhookUrl: '',
  authToken: '',
  authType: 'bearer',
  loading: false,
  sending: false,
  response: null,
  error: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_INTEGRATIONS':
      return { ...state, integrations: action.payload, loading: false };

    case 'SELECT_INTEGRATION': {
      const integration = action.payload;
      return {
        ...state,
        selectedIntegration: integration,
        payload: JSON.stringify(integration.examplePayload, null, 2),
        authType: (integration.defaultAuthType || 'bearer') as any,
        response: null,
        error: null,
      };
    }

    case 'UPDATE_PAYLOAD':
      return { ...state, payload: action.payload };

    case 'UPDATE_URL':
      return { ...state, webhookUrl: action.payload };

    case 'UPDATE_AUTH_TOKEN':
      return { ...state, authToken: action.payload };

    case 'UPDATE_AUTH_TYPE':
      return { ...state, authType: action.payload };

    case 'SEND_REQUEST_START':
      return { ...state, sending: true, error: null, response: null };

    case 'SEND_REQUEST_SUCCESS':
      return { ...state, sending: false, response: action.payload };

    case 'SEND_REQUEST_FAILURE':
      return { ...state, sending: false, error: action.payload };

    case 'RESET_FORM':
      return {
        ...state,
        selectedIntegration: null,
        payload: '',
        webhookUrl: '',
        authToken: '',
        authType: 'bearer',
        response: null,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
