/**
 * AAP API Client Service
 * Handles OAuth token exchange and AAP API interactions
 */

import axios, { AxiosError } from 'axios';
import {
  OAuthTokenResponse,
  AAPEventStream,
  AAPEventStreamsResponse,
  AAPUser,
  AAPOrganization,
  AAPOrganizationsResponse,
  AAPCredential,
} from '../types/aap';

const allowSelfSigned = process.env.ALLOW_SELF_SIGNED_CERTS === 'true';

/**
 * Normalize AAP base URL by removing trailing slashes
 */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Exchange OAuth authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  aapBaseUrl: string
): Promise<OAuthTokenResponse> {
  const clientId = process.env.AAP_CLIENT_ID;
  const clientSecret = process.env.AAP_CLIENT_SECRET;
  const redirectUri = process.env.AAP_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('AAP OAuth configuration missing. Check AAP_CLIENT_ID, AAP_CLIENT_SECRET, and AAP_REDIRECT_URI environment variables.');
  }

  const tokenUrl = `${normalizeBaseUrl(aapBaseUrl)}/o/token/`;

  try {
    const response = await axios.post<OAuthTokenResponse>(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: allowSelfSigned
          ? new (await import('https')).Agent({ rejectUnauthorized: false })
          : undefined,
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to exchange authorization code: ${axiosError.response?.data || axiosError.message}`
      );
    }
    throw error;
  }
}

/**
 * Fetch event streams from AAP with optional filtering
 */
export async function fetchEventStreams(
  accessToken: string,
  aapBaseUrl: string,
  filterPrefix?: string
): Promise<AAPEventStream[]> {
  const eventStreamsUrl = `${normalizeBaseUrl(aapBaseUrl)}/api/eda/v1/event-streams/`;

  try {
    const response = await axios.get<AAPEventStreamsResponse>(eventStreamsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: allowSelfSigned
        ? new (await import('https')).Agent({ rejectUnauthorized: false })
        : undefined,
      timeout: 30000,
    });

    let streams = response.data.results || [];

    // Filter by prefix if provided (e.g., "EDA-Playground")
    if (filterPrefix) {
      streams = streams.filter((stream) =>
        stream.name.startsWith(filterPrefix)
      );
    }

    return streams;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        throw new Error('AAP access token is invalid or expired');
      }

      throw new Error(
        `Failed to fetch event streams: ${axiosError.response?.data || axiosError.message}`
      );
    }
    throw error;
  }
}

/**
 * Validate AAP access token and get current user info
 */
export async function validateToken(
  accessToken: string,
  aapBaseUrl: string
): Promise<AAPUser | null> {
  const userUrl = `${normalizeBaseUrl(aapBaseUrl)}/api/gateway/v1/me/`;

  try {
    const response = await axios.get<{ results: AAPUser[] }>(userUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: allowSelfSigned
        ? new (await import('https')).Agent({ rejectUnauthorized: false })
        : undefined,
      timeout: 15000,
    });

    // AAP returns a results array, get the first user
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        return null; // Token invalid/expired
      }

      console.error('Error validating AAP token:', axiosError.message);
    }
    return null;
  }
}

/**
 * Refresh AAP access token using refresh token
 * Note: AAP may not support refresh tokens - check AAP OAuth configuration
 */
export async function refreshAccessToken(
  refreshToken: string,
  aapBaseUrl: string
): Promise<OAuthTokenResponse> {
  const clientId = process.env.AAP_CLIENT_ID;
  const clientSecret = process.env.AAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('AAP OAuth configuration missing');
  }

  const tokenUrl = `${normalizeBaseUrl(aapBaseUrl)}/o/token/`;

  try {
    const response = await axios.post<OAuthTokenResponse>(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: allowSelfSigned
          ? new (await import('https')).Agent({ rejectUnauthorized: false })
          : undefined,
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to refresh access token: ${axiosError.response?.data || axiosError.message}`
      );
    }
    throw error;
  }
}

/**
 * Fetch organizations from AAP
 */
export async function fetchOrganizations(
  accessToken: string,
  aapBaseUrl: string
): Promise<AAPOrganization[]> {
  const organizationsUrl = `${normalizeBaseUrl(aapBaseUrl)}/api/gateway/v1/organizations/`;

  try {
    const response = await axios.get<AAPOrganizationsResponse>(organizationsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: allowSelfSigned
        ? new (await import('https')).Agent({ rejectUnauthorized: false })
        : undefined,
      timeout: 30000,
    });

    return response.data.results || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        throw new Error('AAP access token is invalid or expired');
      }

      throw new Error(
        `Failed to fetch organizations: ${JSON.stringify(axiosError.response?.data) || axiosError.message}`
      );
    }
    throw error;
  }
}

/**
 * Create an EDA credential for event stream authentication
 */
export async function createEventStreamCredential(
  accessToken: string,
  aapBaseUrl: string,
  name: string,
  token: string,
  organizationId: number
): Promise<AAPCredential> {
  const credentialsUrl = `${normalizeBaseUrl(aapBaseUrl)}/api/eda/v1/eda-credentials/`;

  const payload = {
    name,
    description: `Auto-generated credential for event stream: ${name}`,
    inputs: {
      auth_type: 'token',
      http_header_key: 'Authorization',
      token,
    },
    credential_type_id: 8, // Token credential type
    organization_id: organizationId,
  };

  try {
    const response = await axios.post<AAPCredential>(credentialsUrl, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: allowSelfSigned
        ? new (await import('https')).Agent({ rejectUnauthorized: false })
        : undefined,
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        throw new Error('AAP access token is invalid or expired');
      }

      if (axiosError.response?.status === 409) {
        throw new Error(`A credential with the name "${name}" already exists`);
      }

      throw new Error(
        `Failed to create credential: ${axiosError.response?.data || axiosError.message}`
      );
    }
    throw error;
  }
}

/**
 * Create an event stream in AAP
 */
export async function createEventStream(
  accessToken: string,
  aapBaseUrl: string,
  name: string,
  testMode: boolean,
  credentialId: number,
  organizationId: number
): Promise<AAPEventStream> {
  const eventStreamsUrl = `${normalizeBaseUrl(aapBaseUrl)}/api/eda/v1/event-streams/`;

  const payload = {
    name,
    test_mode: testMode,
    additional_data_headers: '',
    eda_credential_id: credentialId,
    organization_id: organizationId,
  };

  try {
    const response = await axios.post<AAPEventStream>(eventStreamsUrl, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: allowSelfSigned
        ? new (await import('https')).Agent({ rejectUnauthorized: false })
        : undefined,
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        throw new Error('AAP access token is invalid or expired');
      }

      if (axiosError.response?.status === 409) {
        throw new Error(`An event stream with the name "${name}" already exists`);
      }

      throw new Error(
        `Failed to create event stream: ${axiosError.response?.data || axiosError.message}`
      );
    }
    throw error;
  }
}

/**
 * Delete an EDA credential (used for cleanup if event stream creation fails)
 */
export async function deleteEventStreamCredential(
  accessToken: string,
  aapBaseUrl: string,
  credentialId: number
): Promise<void> {
  const credentialUrl = `${normalizeBaseUrl(aapBaseUrl)}/api/eda/v1/eda-credentials/${credentialId}/`;

  try {
    await axios.delete(credentialUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: allowSelfSigned
        ? new (await import('https')).Agent({ rejectUnauthorized: false })
        : undefined,
      timeout: 30000,
    });
  } catch (error) {
    // Best effort cleanup - log but don't throw
    console.error(`Failed to delete orphaned credential ${credentialId}:`, error);
  }
}
