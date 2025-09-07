#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const SPACE_ID = process.env.STORYBLOK_SPACE || '329822';
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;

console.log('🚀 Storyblok CLI v4 Migration - Pull Components and Generate Types');
console.log(`   Space ID: ${SPACE_ID}`);

if (!ACCESS_TOKEN) {
  console.error('❌ NEXT_PUBLIC_STORYBLOK_TOKEN is required in environment variables');
  console.log('   Add NEXT_PUBLIC_STORYBLOK_TOKEN to your .env.local file');
  process.exit(1);
}

const CLI_TYPES_DIR = path.join(process.cwd(), '.storyblok', 'types', SPACE_ID);
const PROXY_FILE_PATH = path.join(process.cwd(), 'src', 'types', 'framework', 'storyblok-components.ts');

function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function generateProxyFile() {
  try {
    // Find the CLI-generated types file
    if (!fs.existsSync(CLI_TYPES_DIR)) {
      console.log(`⚠️  CLI types directory not found: ${CLI_TYPES_DIR}`);
      return;
    }

    const files = fs.readdirSync(CLI_TYPES_DIR);
    const typesFile = files.find(file => file.endsWith('.d.ts') || file.endsWith('.ts'));
    
    if (!typesFile) {
      console.log('⚠️  No CLI-generated types file found');
      return;
    }

    const cliTypesPath = path.join(CLI_TYPES_DIR, typesFile);
    const relativePath = path.relative(path.dirname(PROXY_FILE_PATH), cliTypesPath);

    // Enhanced custom field types
    const enhancedTypes = `
// Enhanced Custom Field Types for CLI v4
export interface StoryblokSlider {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  [k: string]: any;
}

export interface StoryblokVimeo {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  [k: string]: any;
}

export interface StoryblokColorPicker {
  color: string;
  alpha?: number;
  [k: string]: any;
}

export interface StoryblokPalette {
  value: string;
  name?: string;
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
  canonical_url?: string;
  [k: string]: any;
}

// Asset interface compatible with CLI v4
export interface AssetStoryblok {
  id: number;
  alt?: string;
  name: string;
  focus?: string;
  title?: string;
  filename: string;
  copyright?: string;
  fieldtype?: string;
  is_external_url?: boolean;
  [k: string]: any;
}

// Multilink interface compatible with CLI v4
export type MultilinkStoryblok =
  | {
      cached_url?: string;
      linktype?: "story";
      [k: string]: any;
    }
  | {
      cached_url?: string;
      linktype?: "asset" | "url";
      [k: string]: any;
    }
  | {
      cached_url?: string;
      linktype?: "email";
      [k: string]: any;
    };
`;

    // Generate proxy file content
    const proxyContent = `/* eslint-disable @typescript-eslint/no-explicit-any */

// This file is a dynamic proxy that re-exports types from Storyblok CLI v4 generated files
// with enhanced custom field types for better development experience
// Generated on: ${new Date().toISOString()}

// Re-export all CLI-generated types
export * from '${relativePath.replace(/\\/g, '/')}';

${enhancedTypes}
`;

    // Ensure the directory exists
    const proxyDir = path.dirname(PROXY_FILE_PATH);
    ensureDirectoryExists(proxyDir);

    // Write the proxy file
    fs.writeFileSync(PROXY_FILE_PATH, proxyContent);

    console.log(`✅ Dynamic proxy generated at: ${PROXY_FILE_PATH}`);
    console.log(`   Re-exporting from: ${relativePath}`);

  } catch (error) {
    console.error('❌ Error generating dynamic proxy:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔄 Step 1: Setting up directories...');
    ensureDirectoryExists(path.join(process.cwd(), '.storyblok'));
    ensureDirectoryExists(CLI_TYPES_DIR);

    console.log('🔄 Step 2: Pulling components from Storyblok...');
    
    // First, we need to login or set the token
    process.env.STORYBLOK_TOKEN = ACCESS_TOKEN;
    process.env.STORYBLOK_SPACE = SPACE_ID;
    
    await executeCommand('npx', [
      'storyblok@latest',
      'components',
      'pull',
      '--space',
      SPACE_ID
    ]);

    console.log('🔄 Step 3: Generating TypeScript types...');
    await executeCommand('npx', [
      'storyblok@latest',
      'types',
      'generate',
      '--space',
      SPACE_ID
    ]);

    console.log('🔄 Step 4: Creating dynamic proxy file...');
    generateProxyFile();

    console.log('🔄 Step 5: Running lint fix...');
    try {
      await executeCommand('yarn', ['lint:fix']);
    } catch (lintError) {
      console.log('⚠️  Lint fix failed, but continuing...');
    }

    console.log('');
    console.log('✅ Storyblok CLI v4 migration completed successfully!');
    console.log('');
    console.log('📁 Generated files:');
    console.log(`   CLI types: ${CLI_TYPES_DIR}`);
    console.log(`   Proxy file: ${PROXY_FILE_PATH}`);
    console.log('');
    console.log('🎉 Your project is now using Storyblok CLI v4!');
    console.log('   - Enhanced custom field types available');
    console.log('   - Dynamic proxy system active');
    console.log('   - Type generation automated');

  } catch (error) {
    console.error('❌ Storyblok CLI v4 migration failed:', error.message);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('   1. Check your NEXT_PUBLIC_STORYBLOK_TOKEN in .env.local');
    console.log('   2. Verify space ID is correct (currently: ' + SPACE_ID + ')');
    console.log('   3. Ensure you have network access to Storyblok API');
    console.log('   4. Try running: npx storyblok@latest --version');
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;