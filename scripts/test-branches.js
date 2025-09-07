#!/usr/bin/env node

/**
 * Automated Branch Testing Script
 * Tests all Vercel optimization branches for functionality and performance
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BRANCHES = [
  'feat/edge-runtime-optimization',
  'feat/regional-optimization', 
  'feat/vercel-config',
  'feat/isr-enhancement'
];

const TEST_RESULTS_DIR = './test-results';
const PORT = 3000;

class BranchTester {
  constructor() {
    this.results = {};
    this.currentServer = null;
    
    // Ensure test results directory exists
    if (!fs.existsSync(TEST_RESULTS_DIR)) {
      fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
    
    // Also write to log file
    fs.appendFileSync(path.join(TEST_RESULTS_DIR, 'test.log'), logMessage + '\n');
  }

  async execCommand(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        timeout: 300000, // 5 minutes
        ...options 
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  async testBuild(branch) {
    this.log(`Testing build for ${branch}`);
    
    const buildResult = await this.execCommand('yarn build');
    
    if (!buildResult.success) {
      this.log(`Build failed for ${branch}: ${buildResult.error}`, 'error');
      return false;
    }
    
    // Check for build artifacts
    const buildDir = '.next';
    if (!fs.existsSync(buildDir)) {
      this.log(`Build directory missing for ${branch}`, 'error');
      return false;
    }
    
    this.log(`Build successful for ${branch}`, 'success');
    return true;
  }

  async testLint(branch) {
    this.log(`Testing lint for ${branch}`);
    
    const lintResult = await this.execCommand('yarn lint --max-warnings 50'); // Allow some warnings
    
    if (!lintResult.success) {
      this.log(`Lint issues found for ${branch}: ${lintResult.error}`, 'warn');
      return false;
    }
    
    this.log(`Lint passed for ${branch}`, 'success');
    return true;
  }

  async startDevServer() {
    return new Promise((resolve, reject) => {
      this.log('Starting development server...');
      
      this.currentServer = spawn('yarn', ['dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
      });

      let serverReady = false;
      
      this.currentServer.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready') || output.includes('localhost:3000')) {
          if (!serverReady) {
            serverReady = true;
            this.log('Development server started');
            setTimeout(resolve, 2000); // Give it 2 seconds to fully start
          }
        }
      });

      this.currentServer.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('Error') && !serverReady) {
          reject(new Error(`Server startup failed: ${error}`));
        }
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'));
        }
      }, 60000);
    });
  }

  async stopDevServer() {
    if (this.currentServer) {
      this.log('Stopping development server...');
      this.currentServer.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => {
        this.currentServer.on('exit', resolve);
        setTimeout(() => {
          this.currentServer.kill('SIGKILL');
          resolve();
        }, 5000);
      });
      
      this.currentServer = null;
    }
  }

  async testEndpoints(branch) {
    this.log(`Testing API endpoints for ${branch}`);
    
    const endpoints = [
      'http://localhost:3000/api/redirects?pathname=/test',
      'http://localhost:3000/se',
      'http://localhost:3000/se/isr-demo', // Test ISR demo specifically
    ];

    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        this.log(`✓ ${endpoint}: ${response.status}`);
      } catch (error) {
        results[endpoint] = {
          error: error.message
        };
        this.log(`✗ ${endpoint}: ${error.message}`, 'error');
      }
    }
    
    return results;
  }

  async testPerformance(branch) {
    this.log(`Testing performance for ${branch}`);
    
    // Simple performance test using curl
    const performanceResult = await this.execCommand(
      'curl -w "@-" -s -o /dev/null http://localhost:3000/se <<< "time_total: %{time_total}\\ntime_connect: %{time_connect}\\ntime_starttransfer: %{time_starttransfer}\\nsize_download: %{size_download}"'
    );
    
    if (performanceResult.success) {
      this.log(`Performance metrics for ${branch}: ${performanceResult.output}`);
      return performanceResult.output;
    }
    
    return null;
  }

  async testBranch(branch) {
    this.log(`\n🔍 Testing branch: ${branch}`, 'info');
    this.log('='.repeat(50));
    
    const branchResults = {
      branch,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Switch to branch
      this.log(`Switching to ${branch}`);
      const switchResult = await this.execCommand(`git checkout ${branch}`);
      if (!switchResult.success) {
        throw new Error(`Failed to switch to ${branch}: ${switchResult.error}`);
      }

      // Test build
      branchResults.tests.build = await this.testBuild(branch);
      
      // Test lint (continue even if it fails)
      branchResults.tests.lint = await this.testLint(branch);
      
      // Only continue with runtime tests if build succeeded
      if (branchResults.tests.build) {
        try {
          // Start dev server
          await this.startDevServer();
          
          // Test endpoints
          branchResults.tests.endpoints = await this.testEndpoints(branch);
          
          // Test performance
          branchResults.tests.performance = await this.testPerformance(branch);
          
        } finally {
          // Always stop the server
          await this.stopDevServer();
        }
      }

    } catch (error) {
      this.log(`Error testing ${branch}: ${error.message}`, 'error');
      branchResults.error = error.message;
    }

    // Save results
    this.results[branch] = branchResults;
    fs.writeFileSync(
      path.join(TEST_RESULTS_DIR, `${branch.replace('/', '-')}.json`),
      JSON.stringify(branchResults, null, 2)
    );

    return branchResults;
  }

  async testAllBranches() {
    this.log('🚀 Starting automated branch testing');
    this.log(`Testing branches: ${BRANCHES.join(', ')}`);
    
    const startTime = Date.now();

    for (const branch of BRANCHES) {
      await this.testBranch(branch);
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Generate summary report
    this.generateSummaryReport(duration);
  }

  generateSummaryReport(duration) {
    this.log('\n📊 TESTING SUMMARY REPORT');
    this.log('='.repeat(50));

    const summary = {
      totalBranches: BRANCHES.length,
      duration: `${duration}s`,
      results: {},
      timestamp: new Date().toISOString()
    };

    for (const [branch, result] of Object.entries(this.results)) {
      const buildStatus = result.tests.build ? '✅' : '❌';
      const lintStatus = result.tests.lint ? '✅' : '⚠️';
      const endpointStatus = result.tests.endpoints ? '✅' : '❌';
      
      this.log(`${branch}:`);
      this.log(`  Build: ${buildStatus}`);
      this.log(`  Lint: ${lintStatus}`);
      this.log(`  Endpoints: ${endpointStatus}`);
      
      summary.results[branch] = {
        build: result.tests.build,
        lint: result.tests.lint,
        endpoints: !!result.tests.endpoints,
        hasError: !!result.error
      };
    }

    // Save summary
    fs.writeFileSync(
      path.join(TEST_RESULTS_DIR, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );

    this.log(`\n✅ Testing completed in ${duration}s`);
    this.log(`📁 Results saved to: ${TEST_RESULTS_DIR}`);

    // Return summary for further processing
    return summary;
  }
}

// Main execution
async function main() {
  const tester = new BranchTester();
  
  try {
    await tester.testAllBranches();
  } catch (error) {
    console.error('Testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { BranchTester };