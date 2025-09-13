const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetUserTeam(email) {
  try {
    console.log(`🔄 Resetting team for user: ${email}`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Delete all user's teams and related data using raw SQL for efficiency
    console.log(`🗑️ Deleting all team data...`);
    
    await prisma.$executeRaw`
      DELETE FROM "TeamPlayer" 
      WHERE "teamId" IN (
        SELECT id FROM "Team" WHERE "ownerId" = ${user.id}
      )
    `;

    await prisma.$executeRaw`
      DELETE FROM "Transfer" 
      WHERE "fromTeamId" IN (
        SELECT id FROM "Team" WHERE "ownerId" = ${user.id}
      ) OR "toTeamId" IN (
        SELECT id FROM "Team" WHERE "ownerId" = ${user.id}
      )
    `;

    await prisma.$executeRaw`
      DELETE FROM "BotMatch" 
      WHERE "userTeamId" IN (
        SELECT id FROM "Team" WHERE "ownerId" = ${user.id}
      )
    `;

    await prisma.$executeRaw`
      DELETE FROM "StadiumFacility" 
      WHERE "stadiumId" IN (
        SELECT id FROM "Stadium" WHERE "teamId" IN (
          SELECT id FROM "Team" WHERE "ownerId" = ${user.id}
        )
      )
    `;

    await prisma.$executeRaw`
      DELETE FROM "StadiumUpgrade" 
      WHERE "stadiumId" IN (
        SELECT id FROM "Stadium" WHERE "teamId" IN (
          SELECT id FROM "Team" WHERE "ownerId" = ${user.id}
        )
      )
    `;

    await prisma.$executeRaw`
      DELETE FROM "Stadium" 
      WHERE "teamId" IN (
        SELECT id FROM "Team" WHERE "ownerId" = ${user.id}
      )
    `;

    await prisma.$executeRaw`
      DELETE FROM "Team" WHERE "ownerId" = ${user.id}
    `;

    console.log(`✅ Deleted all teams and related data for ${user.name}`);

    // Get rookie league
    const rookieLeague = await prisma.rookieLeague.findFirst();
    if (!rookieLeague) {
      throw new Error('No rookie league found');
    }

    // Create new team
    console.log(`🆕 Creating new team...`);
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

    console.log(`✅ Created new team: ${newTeam.name}`);
    console.log(`💰 New budget: ${(Number(newTeam.budget) / 100).toLocaleString('da-DK')} kr`);

    // Generate basic players using raw SQL
    console.log(`⚽ Generating players...`);
    
    const positions = ['GOALKEEPER', 'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER', 
                      'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 
                      'ATTACKER', 'ATTACKER', 'ATTACKER', 'ATTACKER', 'ATTACKER', 'ATTACKER', 'ATTACKER'];
    
    const playerNames = [
      'Lars Nielsen', 'Anders Hansen', 'Mikkel Pedersen', 'Thomas Andersen', 'Jesper Larsen',
      'Michael Christensen', 'Daniel Rasmussen', 'Nikolaj Madsen', 'Sebastian Jørgensen', 'Emil Sørensen',
      'Magnus Olsen', 'Frederik Knudsen', 'Alexander Møller', 'William Thomsen', 'Oliver Poulsen',
      'Noah Jakobsen', 'Lucas Henriksen', 'Elias Mortensen', 'Felix Kristensen', 'Viktor Svendsen'
    ];

    // Formation positions for 4-4-2: 1 GK, 4 DEF, 4 MID, 2 ATT
    const formationMap = [
      'gk',           // 0: Goalkeeper
      'lb',           // 1: Left Back
      'cb1',          // 2: Center Back 1
      'cb2',          // 3: Center Back 2
      'rb',           // 4: Right Back
      'lm',           // 5: Left Midfielder
      'cm1',          // 6: Center Midfielder 1
      'cm2',          // 7: Center Midfielder 2
      'rm',           // 8: Right Midfielder
      'st1',          // 9: Striker 1
      'st2'           // 10: Striker 2
    ];

    for (let i = 0; i < 16; i++) {
      const position = positions[i];
      const name = playerNames[i] || `Player ${i + 1}`;
      
      // Generate random stats (50-80 range)
      const speed = 50 + Math.floor(Math.random() * 30);
      const shooting = 50 + Math.floor(Math.random() * 30);
      const passing = 50 + Math.floor(Math.random() * 30);
      const defending = 50 + Math.floor(Math.random() * 30);
      const stamina = 50 + Math.floor(Math.random() * 30);
      const reflexes = 50 + Math.floor(Math.random() * 30);
      const age = 18 + Math.floor(Math.random() * 15); // 18-32 years old
      
      const player = await prisma.player.create({
        data: {
          name,
          age,
          position,
          speed,
          shooting,
          passing,
          defending,
          stamina,
          reflexes,
          isCaptain: i === 0 // First player is captain
        }
      });

      // Get formation position for first 11 players
      const formationPosition = i < 11 && i < formationMap.length ? formationMap[i] : null;

      // Add player to team
      await prisma.teamPlayer.create({
        data: {
          playerId: player.id,
          teamId: newTeam.id,
          position,
          formationPosition: formationPosition,
          isStarter: i < 11 // First 11 are starters
        }
      });
    }

    console.log(`✅ Generated 16 players for the team`);
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
  console.log('Usage: node reset-user-simple.js <email>');
  process.exit(1);
}

resetUserTeam(email);
