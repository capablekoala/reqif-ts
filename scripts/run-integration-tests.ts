#!/usr/bin/env ts-node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Integration test runner for the reqif-ts package.
 * Runs test files in the test/integration directory that match the .itest format.
 */

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Parse directives from a .itest file.
 */
function parseTestFile(content: string): { runLines: string[], checkLines: string[] } {
  const runLines: string[] = [];
  const checkLines: string[] = [];

  const runMatches = content.match(/RUN:(.+)$/gm) || [];
  const checkMatches = content.match(/CHECK:(.+)$/gm) || [];

  for (const match of runMatches) {
    runLines.push(match.replace('RUN:', '').trim());
  }

  for (const match of checkMatches) {
    checkLines.push(match.replace('CHECK:', '').trim());
  }

  return { runLines, checkLines };
}

/**
 * Verify that the output matches the check directives.
 */
function verifyOutput(output: string, checkLines: string[]): boolean {
  for (const check of checkLines) {
    const regex = new RegExp(check, 'm');
    if (!regex.test(output)) {
      console.error(`${colors.red}CHECK failed: ${check}${colors.reset}`);
      console.error(`Output was: ${output}`);
      return false;
    }
  }
  return true;
}

/**
 * Run a single integration test.
 */
function runTest(testFile: string): boolean {
  console.log(`${colors.blue}Running test: ${testFile}${colors.reset}`);
  
  try {
    const content = fs.readFileSync(testFile, 'utf8');
    const { runLines, checkLines } = parseTestFile(content);
    
    if (runLines.length === 0) {
      console.error(`${colors.red}No RUN directives found in ${testFile}${colors.reset}`);
      return false;
    }
    
    // Execute each RUN command
    for (const command of runLines) {
      console.log(`${colors.cyan}Executing: ${command}${colors.reset}`);
      
      // Replace %s with the path to the script
      // Use absolute path to the CLI
      const cliPath = path.resolve(__dirname, '../dist/cjs/cli/index.js');
      const finalCommand = command.replace(/%s/g, `node ${cliPath}`);
      
      // Execute in the directory of the test file
      const output = execSync(finalCommand, { 
        cwd: path.dirname(testFile),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Verify against CHECK directives
      if (checkLines.length > 0 && !verifyOutput(output, checkLines)) {
        return false;
      }
    }
    
    console.log(`${colors.green}Test passed: ${testFile}${colors.reset}`);
    return true;
  } catch (error: any) {
    console.error(`${colors.red}Test failed: ${testFile}${colors.reset}`);
    console.error(error.message);
    if (error.stdout) console.error(`stdout: ${error.stdout}`);
    if (error.stderr) console.error(`stderr: ${error.stderr}`);
    return false;
  }
}

/**
 * Run all integration tests.
 */
function runAllTests() {
  glob('tests/integration/**/*.itest', (err: Error | null, testFiles: string[]) => {
    if (err) {
      console.error(`${colors.red}Error finding test files:${colors.reset}`, err);
      process.exit(1);
      return;
    }
    
    if (testFiles.length === 0) {
      console.warn(`${colors.yellow}No integration tests found.${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}Found ${testFiles.length} integration tests.${colors.reset}`);
    
    let passed = 0;
    let failed = 0;
    
    for (const testFile of testFiles) {
      if (runTest(testFile)) {
        passed++;
      } else {
        failed++;
      }
    }
    
    console.log(`\n${colors.blue}Test Results:${colors.reset}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.blue}Total: ${passed + failed}${colors.reset}`);
    
    if (failed > 0) {
      process.exit(1);
    }
  });
}

// Run the tests
runAllTests();