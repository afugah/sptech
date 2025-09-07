#!/usr/bin/env node

/**
 * Storyblok Webhook Testing Script (Node.js version)
 * Usage: node scripts/test-webhook.js [test-number]
 * Example: node scripts/test-webhook.js 1
 */

const crypto = require('crypto');
const https = require('https');

// Configuration - NEVER hardcode secrets!
const WEBHOOK_SECRET = process.env.STORYBLOK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  log('red', 'Error: STORYBLOK_WEBHOOK_SECRET environment variable is not set.');
  console.log('Please set it in your .env.local file or export it:');
  console.log('  export STORYBLOK_WEBHOOK_SECRET="your-secret-here"');
  process.exit(1);
}
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3100';
const WEBHOOK_URL = `${BASE_URL}/api/storyblok-webhook`;

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test cases
const testCases = [
  {
    name: 'Home page publish (i18n format)',
    payload: {
      action: 'published',
      story_id: 123456,
      full_slug: 'home',
      full_slug__i18n__sv: 'home',
      full_slug__i18n__en: 'home',
      full_slug__i18n__fi: 'koti',
      full_slug__i18n__no: 'hjem',
      space_id: 789,
    },
  },
  {
    name: 'Regular page publish (old format)',
    payload: {
      action: 'published',
      story_id: 234567,
      slug: 'about-us',
      space_id: 789,
    },
  },
  {
    name: 'Config change (full site invalidation)',
    payload: {
      action: 'published',
      story_id: 345678,
      full_slug: 'config',
      space_id: 789,
    },
  },
  {
    name: 'Content page with i18n slugs',
    payload: {
      action: 'published',
      story_id: 456789,
      full_slug: 'content/size-guide/rings',
      full_slug__i18n__sv: 'content/storleksguide/ringar',
      full_slug__i18n__en: 'content/size-guide/rings',
      full_slug__i18n__fi: 'content/kokotaulukko/sormukset',
      space_id: 789,
    },
  },
  {
    name: 'Invalid signature test',
    payload: {
      action: 'published',
      story_id: 567890,
      slug: 'test-invalid',
      space_id: 789,
    },
    invalidSignature: true,
  },
  {
    name: 'Unpublish action',
    payload: {
      action: 'unpublished',
      story_id: 678901,
      full_slug: 'products/ring-123',
      full_slug__i18n__sv: 'produkter/ring-123',
      full_slug__i18n__en: 'products/ring-123',
      space_id: 789,
    },
  },
];

// Generate HMAC signature
function generateSignature(payload) {
  return crypto.createHmac('sha1', WEBHOOK_SECRET).update(JSON.stringify(payload)).digest('hex');
}

// Send webhook request
async function sendWebhook(testCase) {
  return new Promise((resolve, reject) => {
    const payloadStr = JSON.stringify(testCase.payload);
    const signature = testCase.invalidSignature ? 'invalid-signature' : generateSignature(testCase.payload);
    
    const url = new URL(WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadStr),
        'webhook-signature': signature,
      },
      rejectUnauthorized: false, // For localhost with self-signed cert
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payloadStr);
    req.end();
  });
}

// Run test
async function runTest(testNumber) {
  if (testNumber && (testNumber < 1 || testNumber > testCases.length)) {
    log('red', `Invalid test number. Please choose between 1 and ${testCases.length}`);
    process.exit(1);
  }

  log('green', '=== Storyblok Webhook Testing ===');
  log('blue', `Webhook URL: ${WEBHOOK_URL}`);
  log('blue', `Secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
  console.log();

  const testsToRun = testNumber ? [testCases[testNumber - 1]] : testCases;
  const testIndexOffset = testNumber ? testNumber - 1 : 0;

  for (let i = 0; i < testsToRun.length; i++) {
    const testCase = testsToRun[i];
    const testNum = testIndexOffset + i + 1;
    
    log('yellow', `Test ${testNum}: ${testCase.name}`);
    
    try {
      const result = await sendWebhook(testCase);
      
      if (result.statusCode === 200 || result.statusCode === 201) {
        log('green', `✓ Success (HTTP ${result.statusCode})`);
      } else if (testCase.invalidSignature && result.statusCode === 401) {
        log('green', `✓ Correctly rejected invalid signature (HTTP ${result.statusCode})`);
      } else {
        log('red', `✗ Failed (HTTP ${result.statusCode})`);
      }
      
      if (result.data) {
        try {
          const json = JSON.parse(result.data);
          console.log(JSON.stringify(json, null, 2));
        } catch {
          console.log(result.data);
        }
      }
    } catch (error) {
      log('red', `✗ Error: ${error.message}`);
    }
    
    console.log();
  }
  
  log('green', '=== Testing Complete ===');
}

// Main execution
const testNumber = parseInt(process.argv[2]);
runTest(testNumber).catch((error) => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});