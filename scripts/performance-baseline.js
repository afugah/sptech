#!/usr/bin/env node

/**
 * Performance Baseline Measurement Script
 * 
 * This script establishes baseline performance metrics before optimization phases.
 * It measures Core Web Vitals, API performance, bundle sizes, and build times.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class PerformanceBaseline {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      branch: this.getCurrentBranch(),
      commit: this.getCurrentCommit(),
      nodeVersion: process.version,
      metrics: {}
    };
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getCurrentCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  async measureBuildPerformance() {
    console.log('📦 Measuring build performance...');
    
    try {
      // Clean build
      execSync('rm -rf .next', { stdio: 'inherit' });
      
      // Measure build time
      const buildStart = Date.now();
      execSync('yarn build', { stdio: 'inherit' });
      const buildTime = Date.now() - buildStart;
      
      // Measure bundle sizes
      const bundleAnalysis = await this.analyzeBundleSize();
      
      this.results.metrics.build = {
        buildTime: buildTime,
        buildTimeFormatted: this.formatTime(buildTime),
        bundleSize: bundleAnalysis,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Build completed in ${this.formatTime(buildTime)}`);
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      this.results.metrics.build = { error: error.message };
    }
  }

  async analyzeBundleSize() {
    try {
      const nextDir = '.next';
      const serverSize = await this.getDirectorySize(path.join(nextDir, 'server'));
      const staticSize = await this.getDirectorySize(path.join(nextDir, 'static'));
      
      // Get specific bundle files
      const mainJs = await this.getFileSize('.next/static/chunks/main-*.js');
      const vendorJs = await this.getFileSize('.next/static/chunks/framework-*.js');
      const appCss = await this.getFileSize('.next/static/css/app-*.css');
      
      return {
        total: serverSize + staticSize,
        server: serverSize,
        static: staticSize,
        mainJs,
        vendorJs,
        appCss,
        formatted: {
          total: this.formatBytes(serverSize + staticSize),
          server: this.formatBytes(serverSize),
          static: this.formatBytes(staticSize),
          mainJs: this.formatBytes(mainJs),
          vendorJs: this.formatBytes(vendorJs),
          appCss: this.formatBytes(appCss)
        }
      };
    } catch (error) {
      console.error('Error analyzing bundle size:', error.message);
      return { error: error.message };
    }
  }

  async getDirectorySize(dirPath) {
    try {
      // Use -s flag instead of -sb for macOS compatibility
      const result = execSync(`du -s ${dirPath} | cut -f1`, { encoding: 'utf8' });
      return parseInt(result.trim()) * 1024; // Convert from KB to bytes
    } catch (error) {
      return 0;
    }
  }

  async getFileSize(pattern) {
    try {
      const files = execSync(`ls -la ${pattern} 2>/dev/null || echo "0"`, { encoding: 'utf8' });
      if (files.trim() === "0") return 0;
      const match = files.match(/\s+(\d+)\s+/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      return 0;
    }
  }

  async measureApiPerformance() {
    console.log('🔌 Measuring API performance...');
    
    // Start development server for testing
    const server = this.startDevServer();
    
    try {
      // Wait for server to start
      await this.waitForServer('http://localhost:3100');
      
      const apiEndpoints = [
        '/api/redirects',
        '/api/user-id', 
        '/api/session/get-session',
        '/api/health'
      ];
      
      const apiResults = {};
      
      for (const endpoint of apiEndpoints) {
        console.log(`Testing ${endpoint}...`);
        const results = await this.testApiEndpoint(`http://localhost:3100${endpoint}`);
        apiResults[endpoint] = results;
      }
      
      this.results.metrics.api = {
        endpoints: apiResults,
        summary: this.calculateApiSummary(apiResults),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ API testing failed:', error.message);
      this.results.metrics.api = { error: error.message };
    } finally {
      this.stopDevServer(server);
    }
  }

  startDevServer() {
    console.log('Starting development server...');
    const { spawn } = require('child_process');
    const server = spawn('yarn', ['dev'], { 
      stdio: 'pipe',
      detached: true 
    });
    
    return server;
  }

  async waitForServer(url, timeout = 30000) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        const fetch = (await import('node-fetch')).default;
        await fetch(url);
        console.log('✅ Server is ready');
        return;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Server failed to start within timeout');
  }

  async testApiEndpoint(url, iterations = 5) {
    const fetch = (await import('node-fetch')).default;
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      try {
        const response = await fetch(url);
        const duration = Date.now() - start;
        
        results.push({
          duration,
          status: response.status,
          success: response.ok
        });
        
      } catch (error) {
        results.push({
          duration: Date.now() - start,
          status: 0,
          success: false,
          error: error.message
        });
      }
    }
    
    return this.analyzeApiResults(results);
  }

  analyzeApiResults(results) {
    const durations = results.map(r => r.duration);
    const successRate = results.filter(r => r.success).length / results.length;
    
    return {
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      p95: this.calculatePercentile(durations, 95),
      successRate: successRate * 100,
      totalRequests: results.length,
      errors: results.filter(r => !r.success).map(r => r.error).filter(Boolean)
    };
  }

  calculatePercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  calculateApiSummary(apiResults) {
    const endpoints = Object.values(apiResults);
    const averages = endpoints.map(e => e.average);
    const successRates = endpoints.map(e => e.successRate);
    
    return {
      overallAverage: averages.reduce((a, b) => a + b, 0) / averages.length,
      overallSuccessRate: successRates.reduce((a, b) => a + b, 0) / successRates.length,
      fastestEndpoint: Math.min(...averages),
      slowestEndpoint: Math.max(...averages)
    };
  }

  stopDevServer(server) {
    if (server) {
      console.log('Stopping development server...');
      process.kill(-server.pid);
    }
  }

  async measureDependencies() {
    console.log('📋 Analyzing dependencies...');
    
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const nodeModulesSize = await this.getDirectorySize('node_modules');
      
      this.results.metrics.dependencies = {
        production: Object.keys(packageJson.dependencies || {}).length,
        development: Object.keys(packageJson.devDependencies || {}).length,
        total: Object.keys({...packageJson.dependencies, ...packageJson.devDependencies}).length,
        nodeModulesSize: nodeModulesSize,
        nodeModulesSizeFormatted: this.formatBytes(nodeModulesSize),
        heavyDependencies: await this.findHeavyDependencies(),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Dependency analysis failed:', error.message);
      this.results.metrics.dependencies = { error: error.message };
    }
  }

  async findHeavyDependencies() {
    try {
      // Find largest directories in node_modules
      const result = execSync('du -sh node_modules/* | sort -rh | head -10', { encoding: 'utf8' });
      return result.trim().split('\n').map(line => {
        const [size, path] = line.split('\t');
        return { package: path.replace('node_modules/', ''), size };
      });
    } catch (error) {
      return [];
    }
  }

  async measureSourceCode() {
    console.log('📁 Analyzing source code...');
    
    try {
      const sourceMetrics = {
        totalFiles: await this.countFiles('src/**/*'),
        components: await this.countFiles('src/components/**/*.{tsx,jsx}'),
        pages: await this.countFiles('src/app/**/*.{tsx,jsx}'),
        apiRoutes: await this.countFiles('src/app/api/**/route.ts'),
        styles: await this.countFiles('src/**/*.{css,scss,module.css}'),
        tests: await this.countFiles('**/*.{test,spec}.{ts,tsx,js,jsx}'),
        totalLinesOfCode: await this.countLinesOfCode('src'),
        timestamp: new Date().toISOString()
      };
      
      this.results.metrics.sourceCode = sourceMetrics;
      
    } catch (error) {
      console.error('❌ Source code analysis failed:', error.message);
      this.results.metrics.sourceCode = { error: error.message };
    }
  }

  async countFiles(pattern) {
    try {
      const result = execSync(`find . -name "${pattern}" -type f | wc -l`, { encoding: 'utf8' });
      return parseInt(result.trim());
    } catch (error) {
      return 0;
    }
  }

  async countLinesOfCode(directory) {
    try {
      const result = execSync(`find ${directory} -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) -exec wc -l {} + | tail -1`, { encoding: 'utf8' });
      return parseInt(result.trim().split(' ')[0]);
    } catch (error) {
      return 0;
    }
  }

  formatTime(milliseconds) {
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(1);
    return `${minutes}m ${remainingSeconds}s`;
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  async saveResults() {
    const resultsDir = 'performance-results';
    await fs.mkdir(resultsDir, { recursive: true });
    
    const filename = `baseline-${this.results.branch.replace(/[\/\\]/g, '-')}-${Date.now()}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
    
    // Also save as latest baseline for comparison
    const latestPath = path.join(resultsDir, 'latest-baseline.json');
    await fs.writeFile(latestPath, JSON.stringify(this.results, null, 2));
    
    console.log(`📊 Results saved to ${filepath}`);
    return filepath;
  }

  displaySummary() {
    console.log('\n📈 Performance Baseline Summary');
    console.log('=====================================');
    console.log(`Branch: ${this.results.branch}`);
    console.log(`Commit: ${this.results.commit.substring(0, 8)}`);
    console.log(`Timestamp: ${this.results.timestamp}`);
    console.log('');
    
    if (this.results.metrics.build) {
      console.log('🏗️ Build Performance:');
      console.log(`  Build Time: ${this.results.metrics.build.buildTimeFormatted || 'Failed'}`);
      if (this.results.metrics.build.bundleSize) {
        console.log(`  Bundle Size: ${this.results.metrics.build.bundleSize.formatted?.total || 'Unknown'}`);
        console.log(`  Main JS: ${this.results.metrics.build.bundleSize.formatted?.mainJs || 'Unknown'}`);
      }
      console.log('');
    }
    
    if (this.results.metrics.api && this.results.metrics.api.summary) {
      console.log('🔌 API Performance:');
      console.log(`  Average Response: ${this.results.metrics.api.summary.overallAverage.toFixed(1)}ms`);
      console.log(`  Success Rate: ${this.results.metrics.api.summary.overallSuccessRate.toFixed(1)}%`);
      console.log('');
    }
    
    if (this.results.metrics.dependencies) {
      console.log('📦 Dependencies:');
      console.log(`  Total Packages: ${this.results.metrics.dependencies.total}`);
      console.log(`  Node Modules: ${this.results.metrics.dependencies.nodeModulesSizeFormatted}`);
      console.log('');
    }
    
    if (this.results.metrics.sourceCode) {
      console.log('📁 Source Code:');
      console.log(`  Total Files: ${this.results.metrics.sourceCode.totalFiles}`);
      console.log(`  Components: ${this.results.metrics.sourceCode.components}`);
      console.log(`  API Routes: ${this.results.metrics.sourceCode.apiRoutes}`);
      console.log(`  Lines of Code: ${this.results.metrics.sourceCode.totalLinesOfCode?.toLocaleString()}`);
    }
  }

  async run() {
    console.log('🚀 Starting Performance Baseline Measurement');
    console.log('=============================================\n');
    
    await this.measureDependencies();
    await this.measureSourceCode();
    await this.measureBuildPerformance();
    // Note: API testing requires running server, uncomment if needed
    // await this.measureApiPerformance();
    
    const filepath = await this.saveResults();
    this.displaySummary();
    
    console.log('\n✅ Baseline measurement complete!');
    console.log(`📁 Results saved to: ${filepath}`);
    
    return this.results;
  }
}

// Run the baseline measurement if called directly
if (require.main === module) {
  const baseline = new PerformanceBaseline();
  baseline.run().catch(error => {
    console.error('❌ Baseline measurement failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceBaseline;