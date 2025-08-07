#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 SoulSync Backend Setup\n');

async function setup() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelled');
        process.exit(0);
      }
    }

    console.log('\n📝 Please provide the following configuration:\n');

    // Get configuration from user
    const port = await question('Server Port (default: 5000): ') || '5000';
    const dbHost = await question('Database Host (default: localhost): ') || 'localhost';
    const dbPort = await question('Database Port (default: 5432): ') || '5432';
    const dbName = await question('Database Name (default: soulsync_db): ') || 'soulsync_db';
    const dbUser = await question('Database User: ');
    const dbPassword = await question('Database Password: ');
    
    // Generate JWT secrets
    const jwtSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const jwtRefreshSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const corsOrigin = await question('CORS Origin (default: http://localhost:3000): ') || 'http://localhost:3000';
    const openaiKey = await question('OpenAI API Key (optional): ');
    const paypalClientId = await question('PayPal Client ID (optional): ');
    const paypalClientSecret = await question('PayPal Client Secret (optional): ');

    // Create .env content
    const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_REFRESH_EXPIRES_IN=30d

# OpenAI Configuration
OPENAI_API_KEY=${openaiKey || 'your-openai-api-key'}

# PayPal Configuration
PAYPAL_CLIENT_ID=${paypalClientId || 'your-paypal-client-id'}
PAYPAL_CLIENT_SECRET=${paypalClientSecret || 'your-paypal-client-secret'}

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=${corsOrigin}
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ .env file created successfully!');

    // Check if PostgreSQL is available
    console.log('\n🔍 Checking PostgreSQL connection...');
    
    try {
      // Try to import and test database connection
      const { query } = await import('./src/database/connection.js');
      await query('SELECT 1');
      console.log('✅ PostgreSQL connection successful!');
    } catch (error) {
      console.log('❌ PostgreSQL connection failed. Please ensure:');
      console.log('   - PostgreSQL is installed and running');
      console.log('   - Database credentials are correct');
      console.log('   - Database exists');
      console.log('\nYou can create the database manually with:');
      console.log(`   createdb ${dbName}`);
    }

    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Run database migrations: npm run migrate');
    console.log('3. Seed the database: npm run seed');
    console.log('4. Start the server: npm run dev');
    console.log('\n🎉 Setup complete!');

    // Import and seed questions
    try {
      console.log('\n🌱 Seeding questions database...');
      const { seedQuestions } = await import('./src/database/questions-seed.js');
      const { default: prisma } = await import('./src/database/connection.js');
      await seedQuestions(prisma);
      console.log('✅ Questions seeded successfully!');
    } catch (error) {
      console.log('⚠️  Failed to seed questions:', error.message);
      console.log('Please run `npm run seed` manually after setup.');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup(); 