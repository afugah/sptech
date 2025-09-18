#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Typesense from 'typesense';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration from environment - supporting both naming conventions
const TYPESENSE_HOST = process.env.NEXT_PUBLIC_TYPESENSE_HOST || process.env.SEARCH_TYPESENSE_HOST;
const TYPESENSE_PORT = process.env.NEXT_PUBLIC_TYPESENSE_PORT || process.env.SEARCH_TYPESENSE_PORT || '443';
const TYPESENSE_PROTOCOL = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || process.env.SEARCH_TYPESENSE_PROTOCOL || 'https';
const TYPESENSE_API_KEY = process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || process.env.SEARCH_TYPESENSE_API_KEY;
const TYPESENSE_COLLECTION = process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION || process.env.SEARCH_TYPESENSE_COLLECTION || 'products';

// Schema storage directory
const SCHEMA_DIR = path.join(process.cwd(), '.typesense', 'schemas');
const BACKUP_DIR = path.join(SCHEMA_DIR, 'backups');

console.log('🚀 Typesense Schema Pull Utility');
console.log(`   Host: ${TYPESENSE_HOST}`);
console.log(`   Collection: ${TYPESENSE_COLLECTION}`);

// Validate configuration
if (!TYPESENSE_HOST || !TYPESENSE_API_KEY) {
  console.error('❌ Missing required environment variables');
  console.log('   Required: SEARCH_TYPESENSE_HOST (or NEXT_PUBLIC_TYPESENSE_HOST)');
  console.log('            SEARCH_TYPESENSE_API_KEY (or NEXT_PUBLIC_TYPESENSE_API_KEY)');
  console.log('   Optional: SEARCH_TYPESENSE_PORT, SEARCH_TYPESENSE_PROTOCOL, SEARCH_TYPESENSE_COLLECTION');
  process.exit(1);
}

// Initialize Typesense client
const client = new Typesense.Client({
  nodes: [{
    host: TYPESENSE_HOST,
    port: parseInt(TYPESENSE_PORT, 10),
    protocol: TYPESENSE_PROTOCOL,
  }],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function backupExistingSchema(collectionName) {
  const schemaPath = path.join(SCHEMA_DIR, `${collectionName}.json`);

  if (fs.existsSync(schemaPath)) {
    ensureDirectoryExists(BACKUP_DIR);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${collectionName}_${timestamp}.json`);

    fs.copyFileSync(schemaPath, backupPath);
    console.log(`📦 Backed up existing schema to: ${path.relative(process.cwd(), backupPath)}`);
  }
}

async function fetchCollectionSchema(collectionName) {
  try {
    console.log(`🔄 Fetching schema for collection: ${collectionName}`);

    const collection = await client.collections(collectionName).retrieve();

    // Extract relevant schema information
    const schema = {
      name: collection.name,
      fields: collection.fields,
      default_sorting_field: collection.default_sorting_field,
      token_separators: collection.token_separators,
      symbols_to_index: collection.symbols_to_index,
      enable_nested_fields: collection.enable_nested_fields,
      num_documents: collection.num_documents,
      created_at: collection.created_at,
      metadata: {
        pulled_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        typesense_host: TYPESENSE_HOST,
      }
    };

    return schema;
  } catch (error) {
    if (error.httpStatus === 404) {
      console.error(`❌ Collection "${collectionName}" not found`);
      return null;
    }
    throw error;
  }
}

async function fetchSampleDocument(collectionName) {
  try {
    console.log(`🔄 Fetching sample document from: ${collectionName}`);

    // Search for a single document to get the actual data structure
    const searchResult = await client.collections(collectionName)
      .documents()
      .search({
        q: '*',
        per_page: 1,
        limit_hits: 1,
      });

    if (searchResult.hits && searchResult.hits.length > 0) {
      const sampleDoc = searchResult.hits[0].document;
      return sampleDoc;
    }

    console.log('⚠️  No documents found in collection');
    return null;
  } catch (error) {
    console.error(`⚠️  Could not fetch sample document: ${error.message}`);
    return null;
  }
}

async function saveSchema(collectionName, schema, sampleDocument) {
  ensureDirectoryExists(SCHEMA_DIR);

  // Backup existing schema if it exists
  backupExistingSchema(collectionName);

  // Save the schema
  const schemaPath = path.join(SCHEMA_DIR, `${collectionName}.json`);
  const schemaData = {
    schema,
    sampleDocument,
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
    }
  };

  fs.writeFileSync(schemaPath, JSON.stringify(schemaData, null, 2));
  console.log(`✅ Schema saved to: ${path.relative(process.cwd(), schemaPath)}`);

  // Also save a human-readable summary
  const summaryPath = path.join(SCHEMA_DIR, `${collectionName}_summary.md`);
  const summary = generateSchemaSummary(schema, sampleDocument);
  fs.writeFileSync(summaryPath, summary);
  console.log(`📄 Summary saved to: ${path.relative(process.cwd(), summaryPath)}`);
}

function generateSchemaSummary(schema, sampleDocument) {
  let summary = `# Typesense Collection: ${schema.name}\n\n`;
  summary += `## Metadata\n`;
  summary += `- **Documents**: ${schema.num_documents || 0}\n`;
  summary += `- **Created**: ${schema.created_at}\n`;
  summary += `- **Pulled**: ${schema.metadata.pulled_at}\n`;
  summary += `- **Environment**: ${schema.metadata.environment}\n\n`;

  summary += `## Fields\n\n`;
  summary += '| Field Name | Type | Facet | Optional | Index | Sort | Infix |\n';
  summary += '|------------|------|-------|----------|-------|------|-------|\n';

  schema.fields.forEach(field => {
    summary += `| ${field.name} | ${field.type} | ${field.facet ? '✅' : '❌'} | ${field.optional ? '✅' : '❌'} | ${field.index === false ? '❌' : '✅'} | ${field.sort ? '✅' : '❌'} | ${field.infix ? '✅' : '❌'} |\n`;
  });

  if (sampleDocument) {
    summary += `\n## Sample Document Structure\n\n`;
    summary += '```json\n';
    summary += JSON.stringify(sampleDocument, null, 2);
    summary += '\n```\n';
  }

  return summary;
}

async function listAllCollections() {
  try {
    console.log('🔍 Fetching all collections...');
    const collections = await client.collections().retrieve();

    if (collections && collections.length > 0) {
      console.log(`\n📚 Found ${collections.length} collection(s):`);
      collections.forEach(col => {
        console.log(`   - ${col.name} (${col.num_documents || 0} documents)`);
      });
      return collections.map(col => col.name);
    }

    console.log('⚠️  No collections found');
    return [];
  } catch (error) {
    console.error('❌ Failed to list collections:', error.message);
    return [];
  }
}

async function main() {
  try {
    console.log('');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const pullAll = args.includes('--all');
    const specificCollection = args.find(arg => !arg.startsWith('--'));

    let collectionsToFetch = [];

    if (pullAll) {
      // Fetch all collections
      collectionsToFetch = await listAllCollections();
    } else if (specificCollection) {
      // Fetch specific collection
      collectionsToFetch = [specificCollection];
    } else {
      // Default to configured collection
      collectionsToFetch = [TYPESENSE_COLLECTION];
    }

    console.log('');

    // Fetch schemas for each collection
    for (const collectionName of collectionsToFetch) {
      console.log(`\n📋 Processing collection: ${collectionName}`);
      console.log('─'.repeat(50));

      const schema = await fetchCollectionSchema(collectionName);

      if (schema) {
        const sampleDocument = await fetchSampleDocument(collectionName);
        await saveSchema(collectionName, schema, sampleDocument);

        // Display summary
        console.log(`\n📊 Schema Summary:`);
        console.log(`   - Fields: ${schema.fields.length}`);
        console.log(`   - Documents: ${schema.num_documents || 0}`);

        if (sampleDocument) {
          const docKeys = Object.keys(sampleDocument);
          console.log(`   - Sample document has ${docKeys.length} properties`);

          // Check for fields in document not in schema
          const schemaFieldNames = schema.fields.map(f => f.name);
          const undefinedFields = docKeys.filter(key => !schemaFieldNames.includes(key));

          if (undefinedFields.length > 0) {
            console.log(`\n⚠️  Found ${undefinedFields.length} field(s) in document not defined in schema:`);
            undefinedFields.slice(0, 10).forEach(field => {
              console.log(`   - ${field}`);
            });
            if (undefinedFields.length > 10) {
              console.log(`   ... and ${undefinedFields.length - 10} more`);
            }
          }
        }
      }
    }

    console.log('\n');
    console.log('✅ Schema pull completed successfully!');
    console.log('');
    console.log('📁 Generated files:');
    console.log(`   Schemas: ${SCHEMA_DIR}`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Run: npm run typesense:generate');
    console.log('   2. Review generated types in src/types/typesense/');
    console.log('   3. Update mappers if needed');

  } catch (error) {
    console.error('\n❌ Schema pull failed:', error.message);

    if (error.httpStatus) {
      console.error(`   HTTP Status: ${error.httpStatus}`);
    }

    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check your Typesense credentials in .env.local');
    console.log('   2. Verify Typesense server is accessible');
    console.log('   3. Ensure collection exists on the server');
    console.log('   4. Check API key has read permissions');

    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;