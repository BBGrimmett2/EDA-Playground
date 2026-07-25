/**
 * Type definitions for EDA integrations (Frontend)
 */

export type IntegrationCategory =
  | 'monitoring'
  | 'ticketing'
  | 'scm'
  | 'messaging'
  | 'security'
  | 'generic';

export type AuthType = 'bearer' | 'hmac' | 'mtls' | 'none';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description?: string;
  authTypes: AuthType[];
  defaultAuthType?: AuthType;
  examplePayload: Record<string, any>;
  payloadSchema?: Record<string, any>;
  documentation?: string;
  tags?: string[];
}

export interface IntegrationsListResponse {
  version: string;
  count: number;
  integrations: Integration[];
}

export interface ApiResponse {
  success: boolean;
  statusCode: number;
  statusText: string;
  headers: Record<string, any>;
  data: any;
  duration: number;
}

// AAP Event Stream Types
export interface AAPEventStream {
  id: number;
  name: string;
  url: string;
  created_at: string;
  modified_at: string;
  description?: string;
}

export interface AAPSessionInfo {
  authenticated: boolean;
  aapBaseUrl: string | null;
  user: { username: string; email?: string } | null;
  expiresAt: number | null;
  healthy?: boolean; // AAP reachability status
}

export interface AppState {
  integrations: Integration[];
  selectedIntegration: Integration | null;
  payload: string;
  webhookUrl: string;
  authToken: string;
  authType: AuthType;
  loading: boolean;
  sending: boolean;
  response: ApiResponse | null;
  error: string | null;

  // AAP Session (non-sensitive data only, token in httpOnly cookie)
  aapSession: AAPSessionInfo;

  // Event Streams
  eventStreams: AAPEventStream[];
  selectedEventStream: AAPEventStream | null;
  loadingEventStreams: boolean;
}

export type Action =
  | { type: 'SET_INTEGRATIONS'; payload: Integration[] }
  | { type: 'SELECT_INTEGRATION'; payload: Integration }
  | { type: 'UPDATE_PAYLOAD'; payload: string }
  | { type: 'UPDATE_URL'; payload: string }
  | { type: 'UPDATE_AUTH_TOKEN'; payload: string }
  | { type: 'UPDATE_AUTH_TYPE'; payload: AuthType }
  | { type: 'SEND_REQUEST_START' }
  | { type: 'SEND_REQUEST_SUCCESS'; payload: ApiResponse }
  | { type: 'SEND_REQUEST_FAILURE'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_AAP_SESSION'; payload: AAPSessionInfo }
  | { type: 'CLEAR_AAP_SESSION' }
  | { type: 'SET_EVENT_STREAMS'; payload: AAPEventStream[] }
  | { type: 'SELECT_EVENT_STREAM'; payload: AAPEventStream }
  | { type: 'LOADING_EVENT_STREAMS'; payload: boolean }
  | { type: 'SET_AAP_HEALTH'; payload: boolean };
