/**
 * AAP OAuth Authentication Service
 * Handles PKCE flow, token exchange, and session management
 */

import axios from 'axios';
import type { AAPSessionInfo } from '../types/integration';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * OAuth configuration returned from backend
 */
interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  baseUrl: string | null;
}

/**
 * Fetch OAuth configuration from backend
 * Configuration is read from environment variables on the backend
 */
async function fetchOAuthConfig(): Promise<OAuthConfig> {
  const response = await apiClient.get('/api/aap/auth/config');
  return response.data;
}

/**
 * Generate PKCE code verifier and challenge
 * Uses Web Crypto API for secure random generation
 */
export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}> {
  // Generate code_verifier (43-128 characters)
  const codeVerifier = generateRandomString(128);

  // Generate code_challenge from code_verifier using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64UrlEncode(hashBuffer);

  // Generate state parameter for CSRF protection
  const state = generateRandomString(32);

  return { codeVerifier, codeChallenge, state };
}

/**
 * Generate cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Base64 URL encoding (RFC 7636)
 */
function base64UrlEncode(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Initiate OAuth authorization flow
 * Generates PKCE codes, stores them, and redirects to AAP
 */
export async function initiateOAuthFlow(aapBaseUrl: string): Promise<void> {
  // Fetch OAuth configuration from backend
  const config = await fetchOAuthConfig();

  // Generate PKCE parameters
  const { codeVerifier, codeChallenge, state } = await generatePKCE();

  // Store PKCE parameters in sessionStorage (needed for callback)
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('pkce_state', state);

  // Store AAP base URL in localStorage (persists across redirects)
  localStorage.setItem('aap_base_url', aapBaseUrl);

  // Build AAP authorization URL
  const authUrl = new URL(`${aapBaseUrl}/o/authorize/`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', config.redirectUri);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);

  // Redirect to AAP login
  window.location.href = authUrl.toString();
}

/**
 * Exchange authorization code for access token
 * Called after OAuth callback redirect
 */
export async function exchangeAuthCode(
  code: string,
  codeVerifier: string,
  aapBaseUrl: string
): Promise<{ success: boolean; expiresAt?: number; user?: { username: string; email?: string } }> {
  const response = await apiClient.post('/api/aap/auth/token', {
    code,
    codeVerifier,
    aapBaseUrl,
  });

  return response.data;
}

/**
 * Check current authentication status
 * Queries backend to see if valid session cookie exists
 */
export async function checkAuthStatus(): Promise<AAPSessionInfo> {
  try {
    const response = await apiClient.get('/api/aap/auth/status');

    if (response.data.authenticated) {
      return {
        authenticated: true,
        aapBaseUrl: response.data.aapBaseUrl,
        user: response.data.user || null,
        expiresAt: response.data.expiresAt,
      };
    }

    return {
      authenticated: false,
      aapBaseUrl: null,
      user: null,
      expiresAt: null,
    };
  } catch (error) {
    console.error('Failed to check auth status:', error);
    return {
      authenticated: false,
      aapBaseUrl: null,
      user: null,
      expiresAt: null,
    };
  }
}

/**
 * Logout - clear session cookie
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/aap/auth/logout');

    // Clear localStorage items
    localStorage.removeItem('aap_base_url');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

/**
 * Check AAP health status
 * Returns true if AAP is reachable, false otherwise
 */
export async function checkAAPHealth(aapBaseUrl: string): Promise<boolean> {
  try {
    const response = await axios.get(`${aapBaseUrl}/api/gateway/v1/status/`, {
      timeout: 5000, // 5 second timeout for health check
    });
    return response.status === 200;
  } catch (error) {
    console.warn('AAP health check failed:', error);
    return false;
  }
}
