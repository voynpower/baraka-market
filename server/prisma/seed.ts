// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Start Seeding ---');

  // 1. Create Admin Account
  const adminEmail = 'admin@barakamarket.uz';
  // Use a fixed salt rounds for consistency
  const hashedPassword = await bcrypt.hash('admin1234', 10);

  // Upsert ensures we don't create duplicates but update the password if it exists
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'VoynPower Admin',
    },
  });
  console.log('✅ Admin user ready:', admin.email);
  console.log('🔑 Password is: admin1234');

  // 2. Sample Products (Optional but good for testing)
  const productCount = await prisma.product.count();
  if (productCount === 0) {
      await prisma.product.create({
        data: {
          name: 'iPhone 15 Pro',
          category: 'phones',
          price: 999,
          mainImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800',
          description: 'Premium smartphone from Apple.',
          updatedAt: new Date()
        }
      });
      console.log('✅ Sample product created');
  }

  console.log('--- Seeding Finished ---');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
