#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Vercel build process...');

try {
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Check if vite is available
  console.log('Checking Vite installation...');
  try {
    execSync('npx vite --version', { stdio: 'inherit' });
  } catch (viteError) {
    console.log('Vite not found in PATH, trying local installation...');
    const localVitePath = path.join(process.cwd(), 'node_modules', '.bin', 'vite');
    execSync(`"${localVitePath}" --version`, { stdio: 'inherit' });
  }
  
  // Run build using npx to ensure we use the local vite
  console.log('Running build with npx vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
