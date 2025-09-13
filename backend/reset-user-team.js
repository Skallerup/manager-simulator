const { PrismaClient } = require('@prisma/client');
const { TeamService } = require('./dist/services/team-service.js');

const prisma = new PrismaClient();

async function resetUserTeam(email) {
  try {
    console.log(`🔄 Resetting team for user: ${email}`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teams: {
          include: {
            players: true,
            stadium: {
              include: {
                facilities: true,
                upgrades: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Delete all user's teams and related data
    for (const team of user.teams) {
      console.log(`🗑️ Deleting team: ${team.name}`);
      
      // Delete team players
      await prisma.teamPlayer.deleteMany({
        where: { teamId: team.id }
      });

      // Delete transfers
      await prisma.transfer.deleteMany({
        where: {
          OR: [
            { fromTeamId: team.id },
            { toTeamId: team.id }
          ]
        }
      });

      // Delete bot matches
      await prisma.botMatch.deleteMany({
        where: { userTeamId: team.id }
      });

      // Delete stadium facilities and upgrades
      if (team.stadium) {
        await prisma.stadiumFacility.deleteMany({
          where: { stadiumId: team.stadium.id }
        });
        
        await prisma.stadiumUpgrade.deleteMany({
          where: { stadiumId: team.stadium.id }
        });
        
        await prisma.stadium.delete({
          where: { id: team.stadium.id }
        });
      }

      // Delete team
      await prisma.team.delete({
        where: { id: team.id }
      });
    }

    console.log(`✅ Deleted all teams and related data for ${user.name}`);

    // Create new team with fresh data
    console.log(`🆕 Creating new team for ${user.name}...`);
    
    // Get rookie league
    const rookieLeague = await prisma.rookieLeague.findFirst();
    if (!rookieLeague) {
      throw new Error('No rookie league found');
    }

    // Create team
    const newTeam = await prisma.team.create({
      data: {
        name: `${user.name}'s Team`,
        colors: JSON.stringify({ primary: '#3B82F6', secondary: '#FFFFFF' }),
        logo: 'team-logo-default',
        budget: BigInt(10000000000), // 10M kr
        ownerId: user.id,
        rookieLeagueId: rookieLeague.id
      }
    });

    // Generate players for the team
    const teamService = new TeamService();
    await teamService.generatePlayersForTeam(newTeam.id);

    console.log(`✅ Created new team: ${newTeam.name}`);
    console.log(`💰 New budget: ${(Number(newTeam.budget) / 100).toLocaleString('da-DK')} kr`);
    console.log(`⚽ New players: ${newTeam.players.length}`);

    console.log(`🎉 Reset complete for ${user.name}!`);
    
  } catch (error) {
    console.error('❌ Error resetting user team:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node reset-user-team.js <email>');
  process.exit(1);
}

resetUserTeam(email);
