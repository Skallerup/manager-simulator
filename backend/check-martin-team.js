const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMartinTeam() {
  try {
    const userId = 'cmfco1o7z0006vky3456lmox1';
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    console.log('User:', user.email);
    
    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: userId },
      include: {
        players: {
          include: { player: true }
        }
      }
    });
    
    if (team) {
      console.log('Team found:', team.name, 'Formation:', team.formation);
      console.log('Total players:', team.players.length);
      console.log('Starters:', team.players.filter(tp => tp.isStarter).length);
      
      // Show starters
      const starters = team.players.filter(tp => tp.isStarter);
      console.log('\nStarters:');
      starters.forEach(tp => {
        console.log(`- ${tp.player.name} (${tp.position}) - Formation: ${tp.formationPosition || 'None'}`);
      });
    } else {
      console.log('No team found for user');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMartinTeam();
