/**
 * AAP API Service
 * Handles authenticated requests to AAP via backend proxy
 */

import axios from 'axios';
import type { AAPEventStream } from '../types/integration';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  withCredentials: true, // Send cookies (includes auth token)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch event streams from AAP
 * Filters for "EDA-Playground" prefix automatically on backend
 */
export async function fetchEventStreams(
  aapBaseUrl: string
): Promise<AAPEventStream[]> {
  try {
    const response = await apiClient.get('/api/aap/event-streams', {
      params: { aapBaseUrl },
    });

    return response.data.eventStreams || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('AAP session expired. Please log in again.');
      }
      throw new Error(
        error.response?.data?.message || 'Failed to fetch event streams from AAP'
      );
    }
    throw error;
  }
}
