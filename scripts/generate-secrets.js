#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate random secret
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// Read .env.local file
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  console.log('Creating .env.local file...');
  const examplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(examplePath)) {
    envContent = fs.readFileSync(examplePath, 'utf8');
  }
}

// Generate secrets
const secrets = {
  NEXTAUTH_SECRET: generateSecret(),
  JWT_SECRET: generateSecret(),
};

// Update env content
Object.entries(secrets).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'gm');
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}="${value}"`);
  } else {
    envContent += `\n${key}="${value}"`;
  }
});

// Write back to file
fs.writeFileSync(envPath, envContent);

console.log('✅ Secrets generated successfully!');
console.log('\nGenerated secrets:');
Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n⚠️  Make sure to keep these secrets safe and never commit them to version control!');