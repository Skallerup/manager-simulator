const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserTeam() {
  try {
    // Get first user
    const user = await prisma.user.findFirst();
    console.log('First user:', { id: user.id, email: user.email });
    
    // Check if user has a team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id }
    });
    
    if (team) {
      console.log('User has team:', { id: team.id, name: team.name, formation: team.formation });
      
      // Get team players
      const teamPlayers = await prisma.teamPlayer.findMany({
        where: { teamId: team.id },
        include: { player: true }
      });
      
      console.log('Team players:', teamPlayers.length);
      teamPlayers.forEach(tp => {
        console.log(`- ${tp.player.name} (${tp.position}) - Starter: ${tp.isStarter}`);
      });
    } else {
      console.log('User has NO team');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserTeam();
