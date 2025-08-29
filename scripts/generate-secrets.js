#!/usr/bin/env node

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('🔐 Generating secure secrets for production deployment...\n');

console.log('NEXTAUTH_SECRET=' + generateSecret());
console.log('JWT_SECRET=' + generateSecret());

console.log('\n✅ Copy these secrets to your Vercel environment variables.');
console.log('⚠️  Keep these secrets secure and never commit them to version control!');