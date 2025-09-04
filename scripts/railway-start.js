#!/usr/bin/env node

// Railway-specific start script for backend
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CaBE Arena Backend for Railway...');

// Check if dist/index.js exists
const indexPath = path.join(__dirname, '..', 'dist', 'index.js');
const fs = require('fs');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Backend build not found. Please run build first.');
  console.error(`Expected path: ${indexPath}`);
  console.error('Available files in dist:', fs.readdirSync(path.join(__dirname, '..', 'dist')).join(', '));
  process.exit(1);
}

console.log('✅ Backend build found');

// Validate environment variables
const requiredEnvVars = ['PORT', 'NODE_ENV'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
  console.warn('Using defaults...');
  
  // Set defaults
  if (!process.env.PORT) process.env.PORT = 3000;
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
}

console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔌 Port: ${process.env.PORT}`);

// Start the backend application
const backend = spawn('node', [indexPath], {
  stdio: 'inherit',
  env: process.env
});

backend.on('error', (err) => {
  console.error('❌ Failed to start backend:', err);
  process.exit(1);
});

backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  backend.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  backend.kill('SIGINT');
});
