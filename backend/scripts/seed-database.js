// backend/scripts/seed-database.js - Seed database with sample data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Check if database is accessible
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Check existing tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'soulsync'
    `;
    console.log('📊 Tables in soulsync schema:', tables);

    // Seed Questions
    console.log('🎯 Creating sample questions...');
    
    const questions = [
      {
        question: "How important is physical fitness to you?",
        category: "lifestyle",
        type: "scale",
        minValue: 1,
        maxValue: 10,
        weight: 3,
        emoji: "💪"
      },
      {
        question: "What's your ideal weekend?",
        category: "lifestyle",
        type: "multiple",
        options: ["Staying home and relaxing", "Going out and socializing", "Outdoor adventures", "Learning something new"],
        weight: 2,
        emoji: "🌟"
      },
      {
        question: "How do you handle conflicts in relationships?",
        category: "communication",
        type: "multiple",
        options: ["Talk it out immediately", "Take time to think first", "Avoid confrontation", "Seek compromise"],
        weight: 5,
        emoji: "💬"
      },
      {
        question: "What's most important in a relationship?",
        category: "values",
        type: "multiple",
        options: ["Trust and honesty", "Fun and adventure", "Emotional support", "Shared goals"],
        weight: 5,
        emoji: "❤️"
      },
      {
        question: "How often do you prefer to communicate with your partner?",
        category: "communication",
        type: "multiple",
        options: ["Throughout the day", "A few times daily", "Once a day", "Every few days"],
        weight: 4,
        emoji: "📱"
      }
    ];

    for (const questionData of questions) {
      try {
        await prisma.question.upsert({
          where: { question: questionData.question },
          update: questionData,
          create: questionData
        });
        console.log(`✅ Created question: ${questionData.question.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Error creating question: ${error.message}`);
      }
    }

    // Check if Images table exists
    try {
      const imageCount = await prisma.image.count();
      console.log(`📸 Images table exists with ${imageCount} images`);
    } catch (error) {
      console.error('❌ Images table not found:', error.message);
    }

    // Check if Users table exists and show count
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Users table exists with ${userCount} users`);
    } catch (error) {
      console.error('❌ Users table not found:', error.message);
    }

    console.log('🎉 Database seed completed successfully!');

  } catch (error) {
    console.error('💥 Database seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });