const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    
    console.log('Users in database:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name || 'No name'}) - ID: ${user.id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
