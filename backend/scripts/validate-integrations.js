#!/usr/bin/env node

/**
 * Validation script for EDA integration definitions
 *
 * This script:
 * 1. Loads the integration schema (schema.json)
 * 2. Loads the integration registry (index.json)
 * 3. Validates each integration file against the schema
 * 4. Reports validation errors with clear messages
 * 5. Exits with error code if validation fails
 *
 * Usage: node scripts/validate-integrations.js
 *        npm run validate-integrations
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Paths
const INTEGRATIONS_DIR = path.join(__dirname, '../integrations');
const SCHEMA_PATH = path.join(INTEGRATIONS_DIR, 'schema.json');
const INDEX_PATH = path.join(INTEGRATIONS_DIR, 'index.json');

async function validate() {
  console.log('🔍 Validating EDA integration definitions...\n');

  // Load schema
  let schema;
  try {
    const schemaData = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    schema = JSON.parse(schemaData);
    console.log('✓ Loaded schema from', SCHEMA_PATH);
  } catch (error) {
    console.error('❌ Failed to load schema:', error.message);
    process.exit(1);
  }

  // Load index
  let index;
  try {
    const indexData = fs.readFileSync(INDEX_PATH, 'utf-8');
    index = JSON.parse(indexData);
    console.log('✓ Loaded index from', INDEX_PATH);
    console.log(`  Found ${index.integrations.length} integration(s)\n`);
  } catch (error) {
    console.error('❌ Failed to load index:', error.message);
    process.exit(1);
  }

  // Initialize Ajv with format validation disabled (format is optional)
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    validateFormats: false  // Disable format validation to avoid errors
  });
  const validateSchema = ajv.compile(schema);

  let errors = 0;
  let validated = 0;

  // Validate each integration
  for (const entry of index.integrations) {
    const filePath = path.join(INTEGRATIONS_DIR, entry.file);

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`❌ ${entry.id}: File not found at ${entry.file}`);
        errors++;
        continue;
      }

      // Load integration file
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Validate against schema
      const valid = validateSchema(data);

      if (!valid) {
        console.error(`❌ ${entry.id}: Validation failed`);
        console.error(`   File: ${entry.file}`);

        if (validateSchema.errors) {
          validateSchema.errors.forEach((error) => {
            const field = error.instancePath || error.params.missingProperty || 'root';
            console.error(`   - ${field}: ${error.message}`);
            if (error.params) {
              console.error(`     ${JSON.stringify(error.params)}`);
            }
          });
        }
        console.error('');
        errors++;
      } else {
        // Additional validation: check if ID matches
        if (data.id !== entry.id) {
          console.error(`❌ ${entry.id}: ID mismatch`);
          console.error(`   Expected: ${entry.id}`);
          console.error(`   Found: ${data.id}\n`);
          errors++;
        } else {
          console.log(`✅ ${entry.id}: Valid`);
          validated++;
        }
      }
    } catch (error) {
      console.error(`❌ ${entry.id}: ${error.message}\n`);
      errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Validated: ${validated}/${index.integrations.length}`);

  if (errors > 0) {
    console.error(`❌ ${errors} error(s) found`);
    console.log('='.repeat(50) + '\n');
    process.exit(1);
  } else {
    console.log('✅ All integrations are valid!');
    console.log('='.repeat(50) + '\n');
    process.exit(0);
  }
}

// Run validation
validate().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
