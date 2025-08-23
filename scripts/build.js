#!/usr/bin/env node

/**
 * Build Script
 * 
 * Builds the Secure Mesh CLI application for production.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Building Secure Mesh CLI...');

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
    console.log('✅ Cleaned previous build');
  }

  // Create dist directory
  fs.mkdirSync('dist', { recursive: true });

  // Copy source files
  execSync('cp -r src dist/', { stdio: 'inherit' });
  console.log('✅ Copied source files');

  // Copy package.json
  execSync('cp package.json dist/', { stdio: 'inherit' });
  console.log('✅ Copied package.json');

  // Copy README
  execSync('cp README.md dist/', { stdio: 'inherit' });
  console.log('✅ Copied README.md');

  // Install production dependencies
  console.log('📦 Installing production dependencies...');
  execSync('cd dist && npm install --production', { stdio: 'inherit' });

  console.log('🎉 Build completed successfully!');
  console.log('📁 Output directory: dist/');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
