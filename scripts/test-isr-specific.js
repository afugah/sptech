#!/usr/bin/env node

/**
 * ISR-Specific Testing Script
 * Tests the specific fixes: ISR demo page location and viewport parameter removal
 */

const { execSync } = require('child_process');
const fs = require('fs');

class ISRTester {
  constructor() {
    this.results = {};
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  async testISRDemoLocation() {
    this.log('Testing ISR demo page location...');
    
    // Check if old location exists (should not)
    const oldPath = './src/app/isr-demo/page.tsx';
    const oldExists = fs.existsSync(oldPath);
    
    // Check if new location exists (should exist)
    const newPath = './src/app/[locale]/(pages)/isr-demo/page.tsx';
    const newExists = fs.existsSync(newPath);
    
    this.log(`Old ISR demo path (${oldPath}): ${oldExists ? '❌ Still exists' : '✅ Removed'}`);
    this.log(`New ISR demo path (${newPath}): ${newExists ? '✅ Created' : '❌ Missing'}`);
    
    return {
      oldPathRemoved: !oldExists,
      newPathExists: newExists,
      success: !oldExists && newExists
    };
  }

  async testViewportParameterRemoval() {
    this.log('Testing viewport parameter removal from middleware...');
    
    try {
      const middlewareContent = fs.readFileSync('./src/middleware.ts', 'utf8');
      
      // Check for viewport parameter logic
      const hasViewportLogic = middlewareContent.includes('viewport') || 
                               middlewareContent.includes('device.type') ||
                               middlewareContent.includes('mobile');
      
      // Check for userAgent import (should be removed)
      const hasUserAgentImport = middlewareContent.includes('userAgent');
      
      this.log(`Middleware viewport logic: ${hasViewportLogic ? '❌ Still present' : '✅ Removed'}`);
      this.log(`Middleware userAgent import: ${hasUserAgentImport ? '❌ Still present' : '✅ Removed'}`);
      
      return {
        viewportLogicRemoved: !hasViewportLogic,
        userAgentImportRemoved: !hasUserAgentImport,
        success: !hasViewportLogic && !hasUserAgentImport
      };
      
    } catch (error) {
      this.log(`Error reading middleware: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testISRConfiguration() {
    this.log('Testing ISR configuration files...');
    
    const requiredFiles = [
      './src/lib/isr/isr-config.ts',
      './src/lib/isr/static-generation-service.ts',
      './src/app/api/webhooks/revalidate/route.ts'
    ];
    
    const results = {};
    
    for (const file of requiredFiles) {
      const exists = fs.existsSync(file);
      results[file] = exists;
      this.log(`${file}: ${exists ? '✅ Present' : '❌ Missing'}`);
    }
    
    const allPresent = Object.values(results).every(Boolean);
    
    return {
      files: results,
      success: allPresent
    };
  }

  async runAllTests() {
    this.log('🔍 Running ISR-specific tests...');
    this.log('='.repeat(50));
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test ISR demo location
    results.tests.isrDemoLocation = await this.testISRDemoLocation();
    
    // Test viewport parameter removal
    results.tests.viewportParameterRemoval = await this.testViewportParameterRemoval();
    
    // Test ISR configuration
    results.tests.isrConfiguration = await this.testISRConfiguration();
    
    // Overall success
    results.overallSuccess = Object.values(results.tests).every(test => test.success);
    
    // Generate report
    this.generateReport(results);
    
    return results;
  }

  generateReport(results) {
    this.log('\n📊 ISR TESTING REPORT');
    this.log('='.repeat(50));
    
    this.log(`ISR Demo Location: ${results.tests.isrDemoLocation.success ? '✅ PASS' : '❌ FAIL'}`);
    this.log(`Viewport Parameter: ${results.tests.viewportParameterRemoval.success ? '✅ PASS' : '❌ FAIL'}`);
    this.log(`ISR Configuration: ${results.tests.isrConfiguration.success ? '✅ PASS' : '❌ FAIL'}`);
    
    this.log(`\nOverall Result: ${results.overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    // Save results
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results', { recursive: true });
    }
    
    fs.writeFileSync('./test-results/isr-specific-tests.json', JSON.stringify(results, null, 2));
    this.log('\n📁 Results saved to: ./test-results/isr-specific-tests.json');
  }
}

// Main execution
async function main() {
  const tester = new ISRTester();
  
  try {
    const results = await tester.runAllTests();
    process.exit(results.overallSuccess ? 0 : 1);
  } catch (error) {
    console.error('ISR testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ISRTester };