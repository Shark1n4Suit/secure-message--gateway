/**
 * Test Setup File
 * 
 * Global test configuration and setup for Jest.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

// Global test timeout
jest.setTimeout(30000);

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.stdout.columns for consistent testing
Object.defineProperty(process.stdout, 'columns', {
  value: 120,
  writable: true
});

// Mock process.stdout.rows for consistent testing
Object.defineProperty(process.stdout, 'rows', {
  value: 30,
  writable: true
});
