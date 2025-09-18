#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directories
const SCHEMA_DIR = path.join(process.cwd(), '.typesense', 'schemas');
const TYPES_DIR = path.join(process.cwd(), '.typesense', 'types');
const PROXY_FILE_PATH = path.join(process.cwd(), 'src', 'types', 'typesense', 'generated.ts');

console.log('🚀 Typesense Type Generator');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Map Typesense field types to TypeScript types
function mapTypesenseTypeToTS(typesenseType, fieldName) {
  // Handle array types
  if (typesenseType.endsWith('[]')) {
    const baseType = typesenseType.slice(0, -2);
    const mappedBase = mapTypesenseTypeToTS(baseType, fieldName);
    return `${mappedBase}[]`;
  }

  // Handle special field names
  if (fieldName === 'id' || fieldName === 'external_id') {
    return 'string';
  }

  // Map base types
  const typeMap = {
    'string': 'string',
    'string*': 'string',
    'int32': 'number',
    'int64': 'number',
    'float': 'number',
    'bool': 'boolean',
    'geopoint': '[number, number]',
    'object': 'Record<string, unknown>',
    'object[]': 'Record<string, unknown>[]',
    'auto': 'unknown',
  };

  return typeMap[typesenseType] || 'unknown';
}

// Analyze sample document to infer nested structure
function analyzeDocumentStructure(doc, fieldName = 'root') {
  if (doc === null || doc === undefined) {
    return 'unknown';
  }

  if (Array.isArray(doc)) {
    if (doc.length === 0) {
      return 'unknown[]';
    }
    const firstItem = doc[0];
    const itemType = analyzeDocumentStructure(firstItem, fieldName);
    return `${itemType}[]`;
  }

  if (typeof doc === 'object') {
    const properties = {};
    for (const [key, value] of Object.entries(doc)) {
      properties[key] = analyzeDocumentStructure(value, key);
    }
    return properties;
  }

  // Primitive types
  if (typeof doc === 'string') return 'string';
  if (typeof doc === 'number') return 'number';
  if (typeof doc === 'boolean') return 'boolean';

  return 'unknown';
}

// Generate TypeScript interface from schema
function generateInterface(schemaData, interfaceName) {
  const { schema, sampleDocument } = schemaData;
  let output = '';

  // Analyze sample document for additional fields
  let sampleStructure = {};
  if (sampleDocument) {
    sampleStructure = analyzeDocumentStructure(sampleDocument);
  }

  // Generate main interface
  output += `export interface ${interfaceName} {\n`;

  // Add fields from schema
  const processedFields = new Set();
  schema.fields.forEach(field => {
    const tsType = mapTypesenseTypeToTS(field.type, field.name);
    const optional = field.optional ? '?' : '';

    // Add JSDoc comment if field has special properties
    if (field.facet || field.sort || field.infix || field.index === false) {
      output += `  /** `;
      const props = [];
      if (field.facet) props.push('facetable');
      if (field.sort) props.push('sortable');
      if (field.infix) props.push('infix searchable');
      if (field.index === false) props.push('not indexed');
      output += props.join(', ');
      output += ` */\n`;
    }

    output += `  ${field.name}${optional}: ${tsType};\n`;
    processedFields.add(field.name);
  });

  // Add fields from sample document that aren't in schema
  if (sampleStructure && typeof sampleStructure === 'object') {
    const additionalFields = Object.entries(sampleStructure)
      .filter(([key]) => !processedFields.has(key));

    if (additionalFields.length > 0) {
      output += '\n  // Fields found in sample document but not in schema\n';
      additionalFields.forEach(([key, type]) => {
        if (typeof type === 'object' && !Array.isArray(type)) {
          // Generate nested interface
          output += `  ${key}?: ${generateNestedInterface(type, `${interfaceName}_${capitalizeFirst(key)}`)};\n`;
        } else {
          output += `  ${key}?: ${type};\n`;
        }
      });
    }
  }

  output += '}\n';

  return output;
}

// Generate nested interface for complex objects
function generateNestedInterface(structure, interfaceName) {
  if (typeof structure !== 'object' || Array.isArray(structure)) {
    return typeof structure === 'string' ? structure : 'unknown';
  }

  let output = `{\n`;
  for (const [key, type] of Object.entries(structure)) {
    if (typeof type === 'object' && !Array.isArray(type)) {
      output += `    ${key}?: ${generateNestedInterface(type, `${interfaceName}_${capitalizeFirst(key)}`)};\n`;
    } else {
      output += `    ${key}?: ${type};\n`;
    }
  }
  output += '  }`;

  return output;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate type file for a collection
function generateTypeFile(collectionName) {
  const schemaPath = path.join(SCHEMA_DIR, `${collectionName}.json`);

  if (!fs.existsSync(schemaPath)) {
    console.log(`⚠️  Schema not found for collection: ${collectionName}`);
    return null;
  }

  console.log(`🔄 Generating types for: ${collectionName}`);

  const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const interfaceName = `Typesense${capitalizeFirst(collectionName)}Document`;

  let output = `/* eslint-disable @typescript-eslint/no-explicit-any */\n\n`;
  output += `// Auto-generated Typesense types for collection: ${collectionName}\n`;
  output += `// Generated on: ${new Date().toISOString()}\n`;
  output += `// Schema version: ${schemaData.metadata?.version || '1.0.0'}\n`;
  output += `// Documents in collection: ${schemaData.schema.num_documents || 0}\n\n`;

  // Generate main document interface
  output += generateInterface(schemaData, interfaceName);

  // Generate search response type
  output += `\n// Search response type for ${collectionName}\n`;
  output += `export interface ${interfaceName}SearchResponse {\n`;
  output += `  facet_counts?: Array<{\n`;
  output += `    field_name: string;\n`;
  output += `    counts: Array<{\n`;
  output += `      count: number;\n`;
  output += `      highlighted: string;\n`;
  output += `      value: string;\n`;
  output += `    }>;\n`;
  output += `    stats?: {\n`;
  output += `      avg?: number;\n`;
  output += `      max?: number;\n`;
  output += `      min?: number;\n`;
  output += `      sum?: number;\n`;
  output += `      total_values?: number;\n`;
  output += `    };\n`;
  output += `  }>;\n`;
  output += `  found: number;\n`;
  output += `  found_docs?: number;\n`;
  output += `  out_of: number;\n`;
  output += `  page: number;\n`;
  output += `  search_cutoff: boolean;\n`;
  output += `  search_time_ms: number;\n`;
  output += `  hits: Array<{\n`;
  output += `    document: ${interfaceName};\n`;
  output += `    highlight?: Record<string, unknown>;\n`;
  output += `    highlights?: Array<{\n`;
  output += `      field: string;\n`;
  output += `      snippet?: string;\n`;
  output += `      snippets?: string[];\n`;
  output += `      value?: string;\n`;
  output += `      values?: string[];\n`;
  output += `      matched_tokens: string[];\n`;
  output += `    }>;\n`;
  output += `    text_match: number;\n`;
  output += `    text_match_info?: {\n`;
  output += `      best_field_score: string;\n`;
  output += `      best_field_weight: number;\n`;
  output += `      fields_matched: number;\n`;
  output += `      num_tokens_dropped: number;\n`;
  output += `      score: string;\n`;
  output += `      tokens_matched: number;\n`;
  output += `      typo_prefix_score: number;\n`;
  output += `    };\n`;
  output += `  }>;\n`;
  output += `}\n`;

  // Save type file
  ensureDirectoryExists(TYPES_DIR);
  const typeFilePath = path.join(TYPES_DIR, `${collectionName}.ts`);
  fs.writeFileSync(typeFilePath, output);

  console.log(`✅ Types generated: ${path.relative(process.cwd(), typeFilePath)}`);

  return {
    collectionName,
    interfaceName,
    filePath: typeFilePath,
  };
}

// Generate proxy file that combines all generated types
function generateProxyFile(generatedTypes) {
  ensureDirectoryExists(path.dirname(PROXY_FILE_PATH));

  let output = `/* eslint-disable @typescript-eslint/no-explicit-any */\n\n`;
  output += `// This file is auto-generated and re-exports all Typesense types\n`;
  output += `// Generated on: ${new Date().toISOString()}\n\n`;

  // Import and re-export all generated types
  generatedTypes.forEach(({ collectionName, interfaceName, filePath }) => {
    const relativePath = path.relative(path.dirname(PROXY_FILE_PATH), filePath);
    const importPath = relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');
    output += `export type { ${interfaceName}, ${interfaceName}SearchResponse } from '${importPath.startsWith('.') ? importPath : './' + importPath}';\n`;
  });

  // Add common Typesense types
  output += `\n// Common Typesense types\n`;
  output += `export interface TypesenseQueryParams {\n`;
  output += `  q?: string;\n`;
  output += `  query_by?: string;\n`;
  output += `  filter_by?: string;\n`;
  output += `  sort_by?: string;\n`;
  output += `  facet_by?: string;\n`;
  output += `  max_facet_values?: number;\n`;
  output += `  page?: number;\n`;
  output += `  per_page?: number;\n`;
  output += `  group_by?: string;\n`;
  output += `  group_limit?: number;\n`;
  output += `  include_fields?: string;\n`;
  output += `  exclude_fields?: string;\n`;
  output += `  highlight_fields?: string;\n`;
  output += `  snippet_threshold?: number;\n`;
  output += `  num_typos?: number;\n`;
  output += `  prefix?: boolean;\n`;
  output += `  infix?: boolean;\n`;
  output += `  min_len_1typo?: number;\n`;
  output += `  min_len_2typo?: number;\n`;
  output += `  split_join_tokens?: string;\n`;
  output += `  exhaustive_search?: boolean;\n`;
  output += `  drop_tokens_threshold?: number;\n`;
  output += `  typo_tokens_threshold?: number;\n`;
  output += `  pinned_hits?: string;\n`;
  output += `  hidden_hits?: string;\n`;
  output += `  prioritize_exact_match?: boolean;\n`;
  output += `  enable_overrides?: boolean;\n`;
  output += `  override_tags?: string;\n`;
  output += `  search_cutoff_ms?: number;\n`;
  output += `  limit_multi_searches?: number;\n`;
  output += `}\n`;

  fs.writeFileSync(PROXY_FILE_PATH, output);
  console.log(`\n✅ Proxy file generated: ${path.relative(process.cwd(), PROXY_FILE_PATH)}`);
}

// Generate comparison report
function generateComparisonReport(collectionName) {
  const schemaPath = path.join(SCHEMA_DIR, `${collectionName}.json`);
  const existingTypePath = path.join(process.cwd(), 'src', 'lib', 'framework', 'Product', 'types', 'ITypesense.ts');

  if (!fs.existsSync(schemaPath) || !fs.existsSync(existingTypePath)) {
    return;
  }

  const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const existingTypeContent = fs.readFileSync(existingTypePath, 'utf-8');

  // Extract field names from schema
  const schemaFields = new Set(schemaData.schema.fields.map(f => f.name));

  // Extract field names from sample document
  const sampleFields = schemaData.sampleDocument
    ? new Set(Object.keys(schemaData.sampleDocument))
    : new Set();

  console.log(`\n📊 Comparison Report for ${collectionName}:`);
  console.log(`   Schema fields: ${schemaFields.size}`);
  console.log(`   Sample document fields: ${sampleFields.size}`);

  // Find fields in sample but not in schema
  const undefinedFields = Array.from(sampleFields).filter(f => !schemaFields.has(f));
  if (undefinedFields.length > 0) {
    console.log(`\n   ⚠️  Fields in documents but not in schema (${undefinedFields.length}):`);
    undefinedFields.slice(0, 10).forEach(field => {
      console.log(`      - ${field}`);
    });
    if (undefinedFields.length > 10) {
      console.log(`      ... and ${undefinedFields.length - 10} more`);
    }
  }
}

async function main() {
  try {
    console.log('');

    // Check if schema directory exists
    if (!fs.existsSync(SCHEMA_DIR)) {
      console.error('❌ Schema directory not found');
      console.log('   Run "npm run typesense:pull" first to fetch schemas');
      process.exit(1);
    }

    // Find all schema files
    const schemaFiles = fs.readdirSync(SCHEMA_DIR)
      .filter(file => file.endsWith('.json') && !file.includes('_summary'));

    if (schemaFiles.length === 0) {
      console.error('❌ No schema files found');
      console.log('   Run "npm run typesense:pull" first to fetch schemas');
      process.exit(1);
    }

    console.log(`📋 Found ${schemaFiles.length} schema file(s)`);

    // Generate types for each schema
    const generatedTypes = [];
    for (const schemaFile of schemaFiles) {
      const collectionName = schemaFile.replace('.json', '');
      const result = generateTypeFile(collectionName);
      if (result) {
        generatedTypes.push(result);
        generateComparisonReport(collectionName);
      }
    }

    // Generate proxy file
    if (generatedTypes.length > 0) {
      generateProxyFile(generatedTypes);
    }

    console.log('\n');
    console.log('✅ Type generation completed successfully!');
    console.log('');
    console.log('📁 Generated files:');
    console.log(`   Types: ${TYPES_DIR}`);
    console.log(`   Proxy: ${PROXY_FILE_PATH}`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Review generated types');
    console.log('   2. Update mappers to use new types');
    console.log('   3. Run: npm run lint:fix');

  } catch (error) {
    console.error('\n❌ Type generation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;