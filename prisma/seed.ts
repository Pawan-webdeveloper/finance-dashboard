import { PrismaClient, RecordType } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = ['Salary', 'Rent', 'Marketing', 'Office Supplies', 'Utilities', 'Consulting', 'Travel', 'Software', 'Insurance', 'Revenue'];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const analystPassword = await bcrypt.hash('analyst123', 12);
  const viewerPassword = await bcrypt.hash('viewer123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@finance.dev',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Alice Analyst',
      email: 'alice@finance.dev',
      password: analystPassword,
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Victor Viewer',
      email: 'victor@finance.dev',
      password: viewerPassword,
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Users created:');
  console.log(`   Admin: admin@finance.dev / admin123`);
  console.log(`   Analyst: alice@finance.dev / analyst123`);
  console.log(`   Viewer: victor@finance.dev / viewer123`);

  // Create ~50 sample financial records
  const users = [admin, analyst, viewer];
  const records = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2025-12-31');

  for (let i = 0; i < 50; i++) {
    const type: RecordType = Math.random() > 0.4 ? 'INCOME' : 'EXPENSE';
    const category = categories[Math.floor(Math.random() * categories.length)];
    const creator = users[Math.floor(Math.random() * users.length)];

    let amount: number;
    if (type === 'INCOME') {
      amount = randomAmount(1000, 50000);
    } else {
      amount = randomAmount(100, 15000);
    }

    records.push({
      userId: creator.id,
      amount,
      type,
      category,
      date: randomDate(startDate, endDate),
      notes: `${type === 'INCOME' ? 'Revenue from' : 'Payment for'} ${category.toLowerCase()} - Record #${i + 1}`,
      isDeleted: false,
    });
  }

  await prisma.financialRecord.createMany({
    data: records,
  });

  console.log(`✅ Created ${records.length} financial records`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
