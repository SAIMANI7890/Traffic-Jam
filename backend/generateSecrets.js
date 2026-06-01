import crypto from 'crypto';

console.log('🔐 Generating Strong Secrets for Production\n');
console.log('=' .repeat(60));

// Generate JWT Secret (256-bit)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET (copy this to your .env file):');
console.log('-'.repeat(60));
console.log(jwtSecret);
console.log('-'.repeat(60));

// Generate Session Secret (optional, for future use)
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 SESSION_SECRET (optional, for future use):');
console.log('-'.repeat(60));
console.log(sessionSecret);
console.log('-'.repeat(60));

console.log('\n✅ Secrets generated successfully!');
console.log('\n📋 Add these to your .env file:');
console.log('=' .repeat(60));
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('=' .repeat(60));

console.log('\n⚠️  IMPORTANT:');
console.log('  1. Never commit these secrets to Git');
console.log('  2. Use different secrets for development and production');
console.log('  3. Store production secrets securely');
console.log('  4. Rotate secrets periodically\n');
