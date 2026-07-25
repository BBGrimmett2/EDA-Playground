/**
 * AAP (Ansible Automation Platform) OAuth and Event Stream Types
 */

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
  token_type: string; // "Bearer"
  scope?: string;
}

export interface AAPEventStream {
  id: number;
  name: string;
  url: string; // Full webhook URL
  created_at: string;
  modified_at: string;
  description?: string;
  // Additional fields from AAP API
  enabled?: boolean;
  user?: string;
  event_stream_type?: string;
}

export interface AAPSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp (milliseconds)
  aapBaseUrl: string;
  user?: {
    username: string;
    email?: string;
  };
}

export interface AAPUser {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface AAPEventStreamsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AAPEventStream[];
}

export interface AAPOrganization {
  id: number;
  name: string;
  description?: string;
}

export interface AAPOrganizationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AAPOrganization[];
}

export interface AAPCredential {
  id: number;
  name: string;
  description?: string;
  inputs: {
    auth_type: string;
    http_header_key?: string;
    token?: string;
  };
  managed: boolean;
  credential_type_id: number;
  organization_id: number;
}

export interface CreateEventStreamRequest {
  name: string;
  testMode: boolean;
  token: string;
  organizationId: number;
}
