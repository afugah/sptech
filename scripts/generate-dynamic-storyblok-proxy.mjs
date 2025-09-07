#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SPACE_ID = '329822';
const CLI_TYPES_DIR = path.join(process.cwd(), '.storyblok', 'types', SPACE_ID);
const PROXY_FILE_PATH = path.join(process.cwd(), 'src', 'types', 'framework', 'storyblok-components.ts');

console.log('🔄 Generating dynamic Storyblok proxy...');

// Enhanced custom field types for the proxy
const ENHANCED_CUSTOM_TYPES = `
// Enhanced Custom Field Types
export interface StoryblokSlider {
  value: number;
  [k: string]: any;
}

export interface StoryblokVimeo {
  url: string;
  title?: string;
  description?: string;
  [k: string]: any;
}

export interface StoryblokColorPicker {
  color: string;
  alpha?: number;
  [k: string]: any;
}

export interface StoryblokSeo {
  title?: string;
  description?: string;
  keywords?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  [k: string]: any;
}

export interface StoryblokPalette {
  value: string;
  [k: string]: any;
}
`;

function parseInterfaceNames(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const interfaceRegex = /export interface (\w+)/g;
  const interfaces = [];
  let match;
  
  while ((match = interfaceRegex.exec(content)) !== null) {
    interfaces.push(match[1]);
  }
  
  return interfaces;
}

function parseImportedTypes(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import type \{ ([^}]+) \} from/g;
  const importedTypes = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const types = match[1]
      .split(',')
      .map(type => type.trim())
      .filter(type => type.length > 0);
    importedTypes.push(...types);
  }
  
  return importedTypes;
}

function generateBackwardCompatibilityAliases(interfaces, importedTypes) {
  const allTypes = [...interfaces, ...importedTypes];
  
  const aliases = allTypes.map(typeName => {
    // Special case for base Storyblok types that should get different alias names
    if (typeName === 'StoryblokRichtext') {
      return `export type RichtextStoryblok = StoryblokRichtext;`;
    }
    if (typeName === 'StoryblokAsset') {
      return `export type AssetStoryblok = StoryblokAsset;`;
    }
    if (typeName === 'StoryblokMultiasset') {
      return `export type MultiassetStoryblok = StoryblokMultiasset;`;
    }
    if (typeName === 'StoryblokMultilink') {
      return `export type MultilinkStoryblok = StoryblokMultilink;`;
    }
    
    // Generate standard aliases with Storyblok suffix for component interfaces
    return `export type ${typeName}Storyblok = ${typeName};`;
  });
  
  // Remove duplicates and join
  return [...new Set(aliases)].join('\n');
}

function generateProxyFile() {
  try {
    // Check if CLI-generated types directory exists
    if (!fs.existsSync(CLI_TYPES_DIR)) {
      console.log(`⚠️  CLI types directory not found: ${CLI_TYPES_DIR}`);
      console.log('Run the type generation script first to create the CLI types.');
      return;
    }

    // Find the CLI-generated types file
    const files = fs.readdirSync(CLI_TYPES_DIR);
    const typesFile = files.find(file => file.endsWith('.d.ts') || file.endsWith('.ts'));
    
    if (!typesFile) {
      console.log('⚠️  No CLI-generated types file found');
      return;
    }

    const cliTypesPath = path.join(CLI_TYPES_DIR, typesFile);
    const storyblokTypesPath = path.join(process.cwd(), '.storyblok', 'types', 'storyblok.d.ts');
    const relativePath = path.relative(path.dirname(PROXY_FILE_PATH), cliTypesPath);
    const relativeStoryblokPath = path.relative(path.dirname(PROXY_FILE_PATH), storyblokTypesPath);

    // Parse interface names and imported types for backward compatibility aliases
    const interfaceNames = parseInterfaceNames(cliTypesPath);
    const importedTypes = parseImportedTypes(cliTypesPath);
    const backwardCompatibilityAliases = generateBackwardCompatibilityAliases(interfaceNames, importedTypes);
    
    console.log(`📝 Found ${interfaceNames.length} interfaces and ${importedTypes.length} imported types to create aliases for`);

    // Generate proxy file content
    const proxyContent = `/* eslint-disable @typescript-eslint/no-explicit-any */

// This file is a proxy that re-exports types from CLI-generated files
// with enhanced custom field types and backward compatibility aliases

// Re-export all CLI-generated types
export * from '${relativePath.replace(/\\/g, '/')}';

${ENHANCED_CUSTOM_TYPES}

// Import types for backward compatibility aliases
import type { ${interfaceNames.join(', ')} } from '${relativePath.replace(/\\/g, '/')}';
import type { ${importedTypes.join(', ')} } from '${relativeStoryblokPath.replace(/\\/g, '/')}';

// Backward Compatibility Type Aliases
// These aliases maintain compatibility with existing codebase expecting types with "Storyblok" suffix
${backwardCompatibilityAliases}
`;

    // Ensure the directory exists
    const proxyDir = path.dirname(PROXY_FILE_PATH);
    if (!fs.existsSync(proxyDir)) {
      fs.mkdirSync(proxyDir, { recursive: true });
    }

    // Write the proxy file
    fs.writeFileSync(PROXY_FILE_PATH, proxyContent);

    console.log(`✅ Dynamic proxy generated successfully at: ${PROXY_FILE_PATH}`);
    console.log(`   Re-exporting from: ${relativePath}`);
    console.log(`   Generated ${interfaceNames.length + importedTypes.length} backward compatibility aliases`);

  } catch (error) {
    console.error('❌ Error generating dynamic proxy:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateProxyFile();
}

export default generateProxyFile;