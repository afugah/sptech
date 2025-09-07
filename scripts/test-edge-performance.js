#!/usr/bin/env node

/**
 * Edge Runtime Performance Testing Script
 * 
 * Tests the performance improvements from migrating API routes to Edge Runtime
 * Measures response times, geographic latency, and cold start performance
 */

const fs = require('fs').promises;
const path = require('path');

class EdgePerformanceTester {
  constructor(baseUrl = 'http://localhost:3100') {
    this.baseUrl = baseUrl;
    this.results = {
      timestamp: new Date().toISOString(),
      testType: 'edge-runtime-performance',
      baseUrl,
      results: {}
    };
  }

  async testEdgeEndpoints() {
    console.log('🚀 Testing Edge Runtime endpoints...');
    
    const edgeEndpoints = [
      '/api/redirects?pathname=/old-path',
      '/api/user-id',
      '/api/health',
      '/api/edge/geolocation',
      '/api/edge/feature-flags'
    ];

    const results = {};

    for (const endpoint of edgeEndpoints) {
      console.log(`Testing ${endpoint}...`);
      
      try {
        const endpointResults = await this.testEndpointPerformance(endpoint);
        results[endpoint] = endpointResults;
        
        console.log(`  ✅ Average: ${endpointResults.average.toFixed(1)}ms`);
        console.log(`  📊 P95: ${endpointResults.p95.toFixed(1)}ms`);
        console.log(`  🎯 Success Rate: ${endpointResults.successRate.toFixed(1)}%`);
        
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        results[endpoint] = { error: error.message };
      }
    }

    this.results.results.edgeEndpoints = results;
    return results;
  }

  async testEndpointPerformance(endpoint, iterations = 10) {
    const fetch = (await import('node-fetch')).default;
    const url = `${this.baseUrl}${endpoint}`;
    const measurements = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      try {
        const response = await fetch(url);
        const duration = Date.now() - start;
        
        measurements.push({
          duration,
          status: response.status,
          success: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        measurements.push({
          duration: Date.now() - start,
          status: 0,
          success: false,
          error: error.message
        });
      }
    }

    return this.analyzeResults(measurements);
  }

  analyzeResults(measurements) {
    const durations = measurements.map(m => m.duration);
    const successCount = measurements.filter(m => m.success).length;
    
    durations.sort((a, b) => a - b);
    
    return {
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: durations[Math.floor(durations.length / 2)],
      min: Math.min(...durations),
      max: Math.max(...durations),
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
      successRate: (successCount / measurements.length) * 100,
      totalRequests: measurements.length,
      measurements
    };
  }

  async testColdStartPerformance() {
    console.log('🥶 Testing cold start performance...');
    
    // Wait to ensure functions are cold
    console.log('  Waiting for functions to go cold...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const coldStartEndpoints = [
      '/api/health',
      '/api/edge/geolocation',
      '/api/edge/feature-flags'
    ];

    const results = {};

    for (const endpoint of coldStartEndpoints) {
      console.log(`  Testing cold start for ${endpoint}...`);
      
      try {
        const start = Date.now();
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        const duration = Date.now() - start;
        
        results[endpoint] = {
          coldStartTime: duration,
          status: response.status,
          success: response.ok
        };
        
        console.log(`    ⚡ Cold start: ${duration}ms`);
        
        // Wait before next test
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`    ❌ Cold start failed: ${error.message}`);
        results[endpoint] = { error: error.message };
      }
    }

    this.results.results.coldStart = results;
    return results;
  }

  async testGeographicPerformance() {
    console.log('🌍 Testing geographic performance simulation...');
    
    // Simulate requests from different regions using headers
    const regions = [
      { name: 'Sweden', country: 'SE', headers: { 'x-vercel-ip-country': 'SE' } },
      { name: 'Norway', country: 'NO', headers: { 'x-vercel-ip-country': 'NO' } },
      { name: 'Germany', country: 'DE', headers: { 'x-vercel-ip-country': 'DE' } },
      { name: 'USA', country: 'US', headers: { 'x-vercel-ip-country': 'US' } }
    ];

    const results = {};

    for (const region of regions) {
      console.log(`  Testing from ${region.name}...`);
      
      try {
        const geoResults = await this.testRegionalEndpoint('/api/edge/geolocation', region.headers);
        results[region.country] = geoResults;
        
        console.log(`    📍 Response time: ${geoResults.responseTime}ms`);
        
      } catch (error) {
        console.error(`    ❌ Failed for ${region.name}: ${error.message}`);
        results[region.country] = { error: error.message };
      }
    }

    this.results.results.geographic = results;
    return results;
  }

  async testRegionalEndpoint(endpoint, headers = {}) {
    const fetch = (await import('node-fetch')).default;
    const start = Date.now();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
    const responseTime = Date.now() - start;
    const data = await response.json();
    
    return {
      responseTime,
      status: response.status,
      success: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  async testFunctionalCorrectness() {
    console.log('🧪 Testing functional correctness...');
    
    const tests = [
      {
        name: 'Redirects API returns redirect data',
        test: async () => {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(`${this.baseUrl}/api/redirects?pathname=/old-path`);
          return response.ok;
        }
      },
      {
        name: 'User ID API returns valid format',
        test: async () => {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(`${this.baseUrl}/api/user-id`);
          const data = await response.json();
          return response.ok && typeof data === 'object';
        }
      },
      {
        name: 'Health API returns health data',
        test: async () => {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(`${this.baseUrl}/api/health`);
          const data = await response.json();
          return response.ok && data.status === 'healthy';
        }
      },
      {
        name: 'Geolocation API returns geo data',
        test: async () => {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(`${this.baseUrl}/api/edge/geolocation`);
          const data = await response.json();
          return response.ok && data.country !== undefined;
        }
      },
      {
        name: 'Feature flags API returns flags',
        test: async () => {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(`${this.baseUrl}/api/edge/feature-flags`);
          const data = await response.json();
          return response.ok && data.flags !== undefined;
        }
      }
    ];

    const results = {};

    for (const test of tests) {
      console.log(`  Running: ${test.name}...`);
      
      try {
        const passed = await test.test();
        results[test.name] = { passed, error: null };
        console.log(`    ${passed ? '✅' : '❌'} ${passed ? 'Passed' : 'Failed'}`);
        
      } catch (error) {
        results[test.name] = { passed: false, error: error.message };
        console.log(`    ❌ Error: ${error.message}`);
      }
    }

    this.results.results.functional = results;
    return results;
  }

  generateReport() {
    const { results } = this.results;
    
    console.log('\n📊 Edge Runtime Performance Report');
    console.log('=====================================');
    
    if (results.edgeEndpoints) {
      console.log('\n🚀 Edge Endpoint Performance:');
      Object.entries(results.edgeEndpoints).forEach(([endpoint, data]) => {
        if (data.error) {
          console.log(`  ${endpoint}: ❌ ${data.error}`);
        } else {
          console.log(`  ${endpoint}:`);
          console.log(`    Average: ${data.average.toFixed(1)}ms`);
          console.log(`    P95: ${data.p95.toFixed(1)}ms`);
          console.log(`    Success Rate: ${data.successRate.toFixed(1)}%`);
        }
      });
    }

    if (results.coldStart) {
      console.log('\n🥶 Cold Start Performance:');
      Object.entries(results.coldStart).forEach(([endpoint, data]) => {
        if (data.error) {
          console.log(`  ${endpoint}: ❌ ${data.error}`);
        } else {
          console.log(`  ${endpoint}: ${data.coldStartTime}ms`);
        }
      });
    }

    if (results.functional) {
      console.log('\n🧪 Functional Tests:');
      const totalTests = Object.keys(results.functional).length;
      const passedTests = Object.values(results.functional).filter(r => r.passed).length;
      console.log(`  Passed: ${passedTests}/${totalTests} tests`);
      
      Object.entries(results.functional).forEach(([test, result]) => {
        console.log(`  ${result.passed ? '✅' : '❌'} ${test}`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      });
    }
  }

  async saveResults() {
    const resultsDir = 'performance-results';
    await fs.mkdir(resultsDir, { recursive: true });
    
    const filename = `edge-runtime-test-${Date.now()}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n💾 Results saved to ${filepath}`);
    return filepath;
  }

  async run() {
    console.log('🧪 Starting Edge Runtime Performance Testing');
    console.log('============================================\n');
    
    try {
      await this.testFunctionalCorrectness();
      await this.testEdgeEndpoints();
      await this.testColdStartPerformance();
      await this.testGeographicPerformance();
      
      this.generateReport();
      await this.saveResults();
      
      console.log('\n✅ Edge Runtime testing complete!');
      
    } catch (error) {
      console.error('\n❌ Edge Runtime testing failed:', error);
      throw error;
    }
    
    return this.results;
  }
}

// Run the test if called directly
if (require.main === module) {
  const tester = new EdgePerformanceTester();
  tester.run().catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
}

module.exports = EdgePerformanceTester;