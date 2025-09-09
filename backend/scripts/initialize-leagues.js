const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeLeagues() {
  try {
    console.log('Starting league system initialization...');
    
    // Check if leagues already exist
    const existingLeagues = await prisma.league.count();
    if (existingLeagues > 0) {
      console.log('League system already initialized, skipping...');
      return;
    }

    // Find or create admin user
    let adminUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    });

    if (!adminUser) {
      console.log('Creating admin user...');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@manager-simulator.com',
          passwordHash: '$2a$10$dummy.hash.for.admin.user',
          name: 'Admin User',
          isAdmin: true
        }
      });
    }

    // Create 3 leagues
    const leagues = await Promise.all([
      prisma.league.create({
        data: {
          name: 'Superliga',
          description: 'Den bedste liga i spillet',
          level: 1,
          maxTeams: 12,
          adminId: adminUser.id,
          status: 'ACTIVE'
        }
      }),
      prisma.league.create({
        data: {
          name: '1. Division',
          description: 'Anden bedste liga',
          level: 2,
          maxTeams: 12,
          adminId: adminUser.id,
          status: 'ACTIVE'
        }
      }),
      prisma.league.create({
        data: {
          name: '2. Division',
          description: 'Laveste liga - alle starter her',
          level: 3,
          maxTeams: 12,
          adminId: adminUser.id,
          status: 'ACTIVE'
        }
      })
    ]);

    console.log(`Created ${leagues.length} leagues`);

    // Create bot teams for each league
    for (const league of leagues) {
      await createBotTeamsForLeague(league.id, league.level);
    }

    // Create current season for each league
    const currentYear = new Date().getFullYear();
    for (const league of leagues) {
      await prisma.season.create({
        data: {
          year: currentYear,
          status: 'ACTIVE',
          startDate: new Date(),
          leagueId: league.id
        }
      });
    }

    console.log('League system initialized successfully!');
  } catch (error) {
    console.error('Error initializing league system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createBotTeamsForLeague(leagueId, level) {
  const botTeamNames = generateBotTeamNames(level);
  
  for (let i = 0; i < 12; i++) {
    const team = await prisma.team.create({
      data: {
        name: botTeamNames[i],
        isBot: true,
        leagueId: leagueId,
        budget: calculateBotBudget(level),
        colors: JSON.stringify({
          primary: generateRandomColor(),
          secondary: generateRandomColor()
        }),
        logo: generateRandomLogo()
      }
    });

    // Create players for bot team
    await createBotPlayersForTeam(team.id, level);
  }

  console.log(`Created 12 bot teams for league level ${level}`);
}

function generateBotTeamNames(level) {
  const baseNames = [
    'United', 'City', 'Arsenal', 'Chelsea', 'Liverpool', 'Tottenham',
    'West Ham', 'Leicester', 'Everton', 'Newcastle', 'Aston Villa', 'Brighton'
  ];

  const prefixes = level === 1 ? 
    ['FC', 'AC', 'SC', 'AS', 'Real', 'Atletico', 'Barcelona', 'Juventus', 'Bayern', 'Dortmund', 'PSG', 'Marseille'] :
    level === 2 ?
    ['Athletic', 'Sporting', 'Racing', 'Olympic', 'Dynamo', 'Spartak', 'Lokomotiv', 'Zenit', 'CSKA', 'Shakhtar', 'Benfica', 'Porto'] :
    ['Rovers', 'Wanderers', 'Athletic', 'Town', 'United', 'City', 'Albion', 'Rangers', 'Celtic', 'Hearts', 'Hibs', 'Aberdeen'];

  return baseNames.map((name, index) => `${prefixes[index]} ${name}`);
}

function calculateBotBudget(level) {
  const baseBudget = 10000000; // 10M øre
  const multiplier = level === 1 ? 2.0 : level === 2 ? 1.5 : 1.0;
  return Math.floor(baseBudget * multiplier);
}

function generateRandomColor() {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateRandomLogo() {
  const logos = ['logo1', 'logo2', 'logo3', 'logo4', 'logo5', 'logo6', 'logo7', 'logo8', 'logo9', 'logo10'];
  return logos[Math.floor(Math.random() * logos.length)];
}

async function createBotPlayersForTeam(teamId, level) {
  const positions = ['GOALKEEPER', 'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER', 'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 'ATTACKER', 'ATTACKER', 'ATTACKER'];
  const danishNames = [
    'Lars', 'Anders', 'Mikkel', 'Jesper', 'Christian', 'Thomas', 'Michael', 'Henrik', 'Søren', 'Niels',
    'Peter', 'Jan', 'Ole', 'Erik', 'Kjeld', 'Bent', 'Poul', 'Svend', 'Knud', 'Vagn'
  ];

  for (let i = 0; i < 11; i++) {
    const position = positions[i];
    const baseStats = calculateBotPlayerStats(level, position);
    
    const player = await prisma.player.create({
      data: {
        name: danishNames[Math.floor(Math.random() * danishNames.length)],
        age: Math.floor(Math.random() * 15) + 18, // 18-32
        position: position,
        speed: baseStats.speed,
        shooting: baseStats.shooting,
        passing: baseStats.passing,
        defending: baseStats.defending,
        stamina: baseStats.stamina,
        reflexes: baseStats.reflexes,
        marketValue: baseStats.marketValue,
        isGenerated: true,
        isCaptain: i === 0 // First player is captain
      }
    });

    // Add player to team
    await prisma.teamPlayer.create({
      data: {
        teamId: teamId,
        playerId: player.id,
        position: position,
        isStarter: true
      }
    });

    // Set captain if first player
    if (i === 0) {
      await prisma.team.update({
        where: { id: teamId },
        data: { captainId: player.id }
      });
    }
  }
}

function calculateBotPlayerStats(level, position) {
  const baseRating = level === 1 ? 75 : level === 2 ? 65 : 55;
  const variation = 10; // ±10 points variation
  
  let speed = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
  let shooting = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
  let passing = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
  let defending = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
  let stamina = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
  let reflexes = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));

  // Position-specific bonuses
  if (position === 'GOALKEEPER') {
    reflexes = Math.min(100, reflexes + 15);
    defending = Math.min(100, defending + 10);
  } else if (position === 'DEFENDER') {
    defending = Math.min(100, defending + 15);
    speed = Math.min(100, speed + 5);
  } else if (position === 'MIDFIELDER') {
    passing = Math.min(100, passing + 15);
    stamina = Math.min(100, stamina + 10);
  } else if (position === 'ATTACKER') {
    shooting = Math.min(100, shooting + 15);
    speed = Math.min(100, speed + 10);
  }

  const overallRating = Math.floor((speed + shooting + passing + defending + stamina + reflexes) / 6);
  const marketValue = Math.floor(overallRating * 100000); // 100k øre per rating point

  return {
    speed,
    shooting,
    passing,
    defending,
    stamina,
    reflexes,
    marketValue
  };
}

// Run the initialization
initializeLeagues();
