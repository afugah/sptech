#!/usr/bin/env node

import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Pulling Storyblok components...');

// Run npx storyblok components pull --space=329822 --filename=../../../components.329822
const pullProcess = spawn('npx', ['storyblok', 'components', 'pull', '--space=329822', '--filename=../../../components.329822'], {
  stdio: 'inherit',
  shell: true
});

pullProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to pull Storyblok components');
    process.exit(code);
  }
  
  console.log('✅ Successfully pulled Storyblok components');
  console.log('🔄 Generating TypeScript types...');
  
  // Run yarn storyblok
  const generateProcess = spawn('yarn', ['storyblok'], {
    stdio: 'inherit',
    shell: true
  });
  
  generateProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to generate TypeScript types');
      process.exit(code);
    }
    
    console.log('✅ Successfully generated TypeScript types');
  });
});
