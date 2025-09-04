#!/usr/bin/env node

/**
 * Prisma Generate Script
 * 
 * This script generates the Prisma client with the appropriate engine type
 * based on the environment (development vs production).
 */

const { execSync } = require('child_process');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

console.log(`🔧 Generating Prisma client for ${isProduction ? 'production' : 'development'} environment...`);

try {
  if (isProduction || isVercel) {
    // Use library engine for production (smaller bundle, no binary dependencies)
    console.log('📦 Using library engine type for production...');
    execSync('npx prisma generate --no-engine', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
  } else {
    // Use binary engine for development (better performance)
    console.log('⚡ Using binary engine type for development...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
  }
  
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}
