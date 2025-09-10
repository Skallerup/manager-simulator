const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    
    const teams = await prisma.team.findMany();
    console.log('Teams:', teams.length);
    
    if (teams.length > 0) {
      const team = teams[0];
      console.log('First team:', team);
      
      const teamPlayers = await prisma.teamPlayer.findMany({
        where: { teamId: team.id },
        include: { player: true }
      });
      console.log('Team players:', teamPlayers.length);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
