/**
 * Event Sender Service for EDA Webhooks
 */

import axios from 'axios';
import type { ApiResponse, AuthType } from '../types/integration';

// In production (container), use relative URLs to same origin
// In development, use explicit backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

/**
 * Send event payload to EDA webhook via backend proxy
 * Uses proxy to bypass CORS restrictions
 */
export async function sendEventToEDA(
  url: string,
  payload: Record<string, any>,
  authToken: string,
  authType: AuthType
): Promise<ApiResponse> {
  const startTime = Date.now();

  try {
    // Send request through backend proxy to bypass CORS
    const response = await axios.post<ApiResponse>(
      `${API_BASE_URL}/api/proxy`,
      {
        url,
        payload,
        authToken,
        authType,
      },
      {
        timeout: 35000, // Slightly longer than backend timeout
        validateStatus: () => true,
      }
    );

    const duration = Date.now() - startTime;

    // If backend returned success, return the proxied response
    if (response.status === 200 && response.data) {
      return {
        ...response.data,
        duration: response.data.duration || duration,
      };
    }

    // If backend returned an error, throw it
    if (response.status >= 400) {
      const errorData = response.data as any;
      throw new Error(
        errorData?.message || errorData?.error || 'Proxy request failed'
      );
    }

    // Fallback response
    return {
      success: false,
      statusCode: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Network error or timeout
      throw new Error(
        `Request failed: ${error.message}${
          error.code ? ` (${error.code})` : ''
        }`
      );
    }

    throw error;
  }
}
