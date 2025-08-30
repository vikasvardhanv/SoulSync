// Database migration script for production deployment
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL
    }
  }
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Create schemas if they don't exist
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS soulsync`;
    console.log('✅ Schema "soulsync" created/verified');
    
    // Run migrations
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS soulsync.users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        age INTEGER,
        bio TEXT,
        location TEXT,
        interests TEXT[] DEFAULT '{}',
        photos TEXT[] DEFAULT '{}',
        "isVerified" BOOLEAN DEFAULT false,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Users table created/verified');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS soulsync.images (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        filename TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        size INTEGER NOT NULL,
        data TEXT NOT NULL,
        user_id TEXT REFERENCES soulsync.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Images table created/verified');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS soulsync.refresh_tokens (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES soulsync.users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Refresh tokens table created/verified');
    
    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_email ON soulsync.users(email)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_active ON soulsync.users("isActive")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_images_user_id ON soulsync.images(user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON soulsync.refresh_tokens(user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON soulsync.refresh_tokens(expires_at)`;
    console.log('✅ Database indexes created/verified');
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export default migrate;