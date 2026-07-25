/**
 * Type definitions for EDA integrations
 */

export type IntegrationCategory =
  | 'monitoring'
  | 'ticketing'
  | 'scm'
  | 'messaging'
  | 'security'
  | 'generic';

export type AuthType = 'bearer' | 'hmac' | 'mtls' | 'none';

/**
 * Integration definition structure
 */
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

/**
 * Integration registry index structure
 */
export interface IntegrationIndex {
  version: string;
  description?: string;
  integrations: IntegrationIndexEntry[];
}

export interface IntegrationIndexEntry {
  id: string;
  file: string;
  enabled: boolean;
}

/**
 * API Response types
 */
export interface IntegrationsListResponse {
  version: string;
  count: number;
  integrations: Integration[];
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
}
