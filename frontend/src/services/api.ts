/**
 * API Service for backend communication
 */

import axios from 'axios';
import type { Integration, IntegrationsListResponse } from '../types/integration';

// In production (container), use relative URLs to same origin
// In development, use explicit backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all integrations from backend
 */
export async function fetchIntegrations(): Promise<Integration[]> {
  try {
    const response = await apiClient.get<IntegrationsListResponse>('/api/integrations');
    return response.data.integrations;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch integrations: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch a specific integration by ID
 */
export async function fetchIntegrationById(id: string): Promise<Integration> {
  try {
    const response = await apiClient.get<Integration>(`/api/integrations/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Integration '${id}' not found`);
      }
      throw new Error(`Failed to fetch integration: ${error.message}`);
    }
    throw error;
  }
}
