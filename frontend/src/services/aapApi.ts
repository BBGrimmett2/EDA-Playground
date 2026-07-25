/**
 * AAP API Service
 * Handles authenticated requests to AAP via backend proxy
 */

import axios from 'axios';
import type { AAPEventStream, AAPOrganization } from '../types/integration';

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

/**
 * Fetch organizations from AAP
 */
export async function fetchOrganizations(): Promise<AAPOrganization[]> {
  try {
    const response = await apiClient.get('/api/aap/organizations');

    return response.data.organizations || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('AAP session expired. Please log in again.');
      }
      throw new Error(
        error.response?.data?.message || 'Failed to fetch organizations from AAP'
      );
    }
    throw error;
  }
}

/**
 * Create a new event stream in AAP
 */
export async function createEventStream(
  name: string,
  testMode: boolean,
  token: string,
  organizationId: number
): Promise<AAPEventStream> {
  try {
    const response = await apiClient.post('/api/aap/event-streams', {
      name,
      testMode,
      token,
      organizationId,
    });

    return response.data.eventStream;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('AAP session expired. Please log in again.');
      }
      if (error.response?.status === 409) {
        // Duplicate name error - include AAP link if provided
        const message = error.response?.data?.message || 'Event stream already exists';
        const aapLink = error.response?.data?.aapLink;
        throw new Error(JSON.stringify({ message, aapLink }));
      }
      throw new Error(
        error.response?.data?.message || 'Failed to create event stream'
      );
    }
    throw error;
  }
}
