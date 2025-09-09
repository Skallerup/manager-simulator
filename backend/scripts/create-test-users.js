const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('Creating test users...');
    
    // Create test users
    const users = [
      {
        email: 'skallerup+3@gmail.com',
        password: '12345678',
        name: 'Test User 1'
      },
      {
        email: 'skallerup+4@gmail.com',
        password: '12345678',
        name: 'Test User 2'
      }
    ];

    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists`);
        continue;
      }

      const passwordHash = await argon2.hash(userData.password);
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: passwordHash,
          name: userData.name,
          isAdmin: userData.email === 'skallerup+3@gmail.com'
        }
      });

      console.log(`Created user: ${user.email}`);
    }

    console.log('Test users created successfully!');
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
