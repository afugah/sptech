#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import generateProxyFile from './generate-dynamic-storyblok-proxy.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '329822';
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;

console.log('🔄 Generating Storyblok types with environment configuration...');

if (!ACCESS_TOKEN) {
  console.error('❌ NEXT_PUBLIC_STORYBLOK_TOKEN is required in environment variables');
  process.exit(1);
}

const CLI_TYPES_DIR = path.join(process.cwd(), '.storyblok', 'types', SPACE_ID);

// Enhanced custom type parser with all field types from migration guide
function getCustomTypeParser() {
  return `
function customTypeParser(key, obj) {
  switch (obj.field_type) {
    case 'storyblok-slider':
      return {
        [key]: {
          type: 'object',
          required: ['value'],
          properties: {
            value: {
              plugin: 'string',
              type: 'number',
            },
          },
        },
      };

    case 'storyblok-vimeo':
      return {
        [key]: {
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
        },
      };

    case 'storyblok-palette':
    case 'storyblok-color-picker':
      return {
        [key]: {
          type: 'object',
          required: ['value'],
          properties: {
            value: {
              plugin: 'string',
              type: 'string',
            },
            color: {
              type: 'string',
            },
            alpha: {
              type: 'number',
            },
          },
        },
      };

    case 'storyblok-seo':
      return {
        [key]: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            keywords: { type: 'string' },
            og_image: { type: 'string' },
            og_title: { type: 'string' },
            og_description: { type: 'string' },
            twitter_image: { type: 'string' },
            twitter_title: { type: 'string' },
            twitter_description: { type: 'string' },
          },
        },
      };

    default:
      return {};
  }
}
  `;
}

function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function generateTypes() {
  try {
    // Ensure .storyblok directory exists
    const storyblokDir = path.join(process.cwd(), '.storyblok');
    if (!fs.existsSync(storyblokDir)) {
      fs.mkdirSync(storyblokDir, { recursive: true });
    }

    // Ensure types directory exists
    if (!fs.existsSync(CLI_TYPES_DIR)) {
      fs.mkdirSync(CLI_TYPES_DIR, { recursive: true });
    }

    console.log('🔄 Step 1: Pulling components from Storyblok...');
    await executeCommand('npx', [
      'storyblok@latest',
      'pull-components',
      `--space=${SPACE_ID}`,
      `--token=${ACCESS_TOKEN}`
    ]);

    console.log('🔄 Step 2: Generating TypeScript types...');
    await executeCommand('npx', [
      'storyblok@latest',
      'generate-types',
      `--sourceFilePaths=./.storyblok/`,
      `--destinationFilePath=./.storyblok/types/${SPACE_ID}/`,
      '--componentsDirectories=./components/blocks'
    ]);

    console.log('🔄 Step 3: Generating dynamic proxy file...');
    generateProxyFile();

    console.log('✅ All Storyblok types generated successfully!');
    console.log(`   CLI types: ${CLI_TYPES_DIR}`);
    console.log('   Proxy file: src/types/framework/storyblok-components.ts');

  } catch (error) {
    console.error('❌ Error generating Storyblok types:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTypes();
}

export default generateTypes;