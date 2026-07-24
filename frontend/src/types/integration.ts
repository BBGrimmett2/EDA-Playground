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
  | { type: 'CLEAR_ERROR' };
