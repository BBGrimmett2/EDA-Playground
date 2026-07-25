/**
 * Integration Loader Service
 *
 * Loads and validates integration definitions from JSON files
 */

import fs from 'fs/promises';
import path from 'path';
import Ajv from 'ajv';
import type { Integration, IntegrationIndex } from '../types/integration';

const INTEGRATIONS_DIR = path.join(__dirname, '../../integrations');
const SCHEMA_PATH = path.join(INTEGRATIONS_DIR, 'schema.json');
const INDEX_PATH = path.join(INTEGRATIONS_DIR, 'index.json');

let cachedIntegrations: Integration[] | null = null;
let ajv: Ajv;
let validateSchema: any;

/**
 * Initialize the validator
 */
async function initValidator(): Promise<void> {
  if (validateSchema) return;

  const schemaData = await fs.readFile(SCHEMA_PATH, 'utf-8');
  const schema = JSON.parse(schemaData);

  ajv = new Ajv({
    allErrors: true,
    verbose: true,
    validateFormats: false  // Disable format validation
  });

  validateSchema = ajv.compile(schema);
}

/**
 * Load all integrations from disk
 */
export async function loadIntegrations(): Promise<Integration[]> {
  // Return cached if available in production
  if (process.env.NODE_ENV === 'production' && cachedIntegrations) {
    return cachedIntegrations;
  }

  await initValidator();

  // Load index
  const indexData = await fs.readFile(INDEX_PATH, 'utf-8');
  const index: IntegrationIndex = JSON.parse(indexData);

  const integrations: Integration[] = [];

  for (const entry of index.integrations) {
    if (!entry.enabled) {
      console.log(`Skipping disabled integration: ${entry.id}`);
      continue;
    }

    try {
      const filePath = path.join(INTEGRATIONS_DIR, entry.file);
      const fileData = await fs.readFile(filePath, 'utf-8');
      const integration: Integration = JSON.parse(fileData);

      // Validate against schema
      if (!validateSchema(integration)) {
        console.error(`Invalid integration ${entry.id}:`, validateSchema.errors);
        throw new Error(`Integration ${entry.id} failed schema validation`);
      }

      // Verify ID matches
      if (integration.id !== entry.id) {
        throw new Error(
          `Integration ID mismatch in ${entry.file}: expected ${entry.id}, got ${integration.id}`
        );
      }

      integrations.push(integration);
    } catch (error) {
      console.error(`Failed to load integration ${entry.id}:`, error);
      // Continue loading other integrations instead of failing completely
    }
  }

  // Cache in production
  if (process.env.NODE_ENV === 'production') {
    cachedIntegrations = integrations;
  }

  console.log(`Loaded ${integrations.length} integration(s)`);
  return integrations;
}

/**
 * Get a specific integration by ID
 */
export async function getIntegrationById(id: string): Promise<Integration | null> {
  const integrations = await loadIntegrations();
  return integrations.find(i => i.id === id) || null;
}

/**
 * Clear the cache (useful for development/testing)
 */
export function clearCache(): void {
  cachedIntegrations = null;
}
