const { PrismaClient } = require('@prisma/client');
const { createAvatar } = require('@dicebear/collection');

const prisma = new PrismaClient();

// Danish male names for teams
const danishNames = [
  'Lars', 'Jens', 'Peter', 'Michael', 'Anders', 'Morten', 'Thomas', 'Henrik', 'Søren', 'Niels',
  'Christian', 'Martin', 'Jakob', 'Mads', 'Rasmus', 'Daniel', 'Kristian', 'Simon', 'Emil', 'Magnus',
  'Frederik', 'Nikolaj', 'Alexander', 'Sebastian', 'Jonas', 'Lucas', 'Oliver', 'William', 'Noah', 'Elias'
];

// Team names
const teamNames = [
  'FC København', 'Brøndby IF', 'AGF', 'FC Midtjylland', 'OB', 'Randers FC', 'Viborg FF', 'Silkeborg IF',
  'Lyngby BK', 'AC Horsens', 'Vejle BK', 'Esbjerg fB', 'Aalborg BK', 'SønderjyskE', 'Hobro IK', 'FC Nordsjælland'
];

async function createTeamsForLeagues() {
  try {
    console.log('Creating teams for all leagues...');
    
    // Get all leagues
    const leagues = await prisma.league.findMany({
      orderBy: { level: 'asc' }
    });

    console.log(`Found ${leagues.length} leagues`);

    for (const league of leagues) {
      console.log(`\nProcessing ${league.name} (Level ${league.level})`);
      
      // Check how many teams already exist in this league
      const existingTeams = await prisma.team.count({
        where: { leagueId: league.id }
      });
      
      console.log(`  Existing teams: ${existingTeams}`);
      
      if (existingTeams >= league.maxTeams) {
        console.log(`  League is full (${existingTeams}/${league.maxTeams}), skipping...`);
        continue;
      }
      
      const teamsToCreate = league.maxTeams - existingTeams;
      console.log(`  Creating ${teamsToCreate} teams...`);
      
      for (let i = 0; i < teamsToCreate; i++) {
        const teamName = teamNames[i % teamNames.length];
        const isBot = true; // All teams in leagues are bots initially
        
        // Create team
        const team = await prisma.team.create({
          data: {
            name: teamName,
            leagueId: league.id,
            isBot: isBot,
            budget: 10000000, // 10M budget
            logo: '⚽' // Simple emoji logo
          }
        });
        
        console.log(`    Created team: ${team.name} (${team.id})`);
        
        // Create 11 players for this team
        for (let j = 0; j < 11; j++) {
          const firstName = danishNames[Math.floor(Math.random() * danishNames.length)];
          const lastName = danishNames[Math.floor(Math.random() * danishNames.length)];
          const fullName = `${firstName} ${lastName}`;
          
          // Generate avatar
          const avatar = createAvatar('avataaars', {
            seed: `${team.id}-${j}`,
            backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
            skinColor: ['edb98a', 'fdbcb4', 'fd9841', 'f8d25c', 'afafaf'],
            hairColor: ['auburn', 'black', 'blonde', 'brown', 'pastelPink', 'red', 'gray'],
            facialHair: ['beard', 'beardLight', 'beardMagestic', 'moustacheFancy', 'moustacheMagnum'],
            facialHairColor: ['auburn', 'black', 'blonde', 'brown', 'pastelPink', 'red', 'gray'],
            top: ['hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4'],
            topColor: ['black', 'blue', 'blue01', 'blue02', 'blue03', 'gray01', 'gray02', 'heather', 'pastelBlue', 'pastelGreen', 'pastelOrange', 'pastelRed', 'pastelYellow', 'pink', 'red', 'white'],
            accessories: ['blank', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'],
            accessoriesColor: ['black', 'blue01', 'blue02', 'blue03', 'gray01', 'gray02', 'heather', 'pastelBlue', 'pastelGreen', 'pastelOrange', 'pastelRed', 'pastelYellow', 'pink', 'red', 'white'],
            hatColor: ['black', 'blue', 'blue01', 'blue02', 'blue03', 'gray01', 'gray02', 'heather', 'pastelBlue', 'pastelGreen', 'pastelOrange', 'pastelRed', 'pastelYellow', 'pink', 'red', 'white'],
            clothe: ['blazer', 'blazerShirt', 'blazerSweater', 'collarSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'],
            clotheColor: ['black', 'blue', 'blue01', 'blue02', 'blue03', 'gray01', 'gray02', 'heather', 'pastelBlue', 'pastelGreen', 'pastelOrange', 'pastelRed', 'pastelYellow', 'pink', 'red', 'white'],
            eyes: ['close', 'cry', 'default', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
            eyebrow: ['angry', 'angryNatural', 'default', 'defaultNatural', 'flatNatural', 'frownNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadConcerned', 'sadConcernedNatural', 'unibrowNatural', 'upDown', 'upDownNatural'],
            mouth: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'],
            skin: ['tanned', 'yellow', 'pale', 'light', 'brown', 'darkBrown', 'black']
          });
          
          // Determine position based on player number
          let position;
          if (j === 0) position = 'GOALKEEPER';
          else if (j >= 1 && j <= 4) position = 'DEFENDER';
          else if (j >= 5 && j <= 8) position = 'MIDFIELDER';
          else position = 'ATTACKER';
          
          // Generate stats (higher for higher level leagues)
          const baseStats = league.level === 1 ? 80 : league.level === 2 ? 70 : 60;
          const variation = 15;
          
          const speed = Math.max(1, Math.min(100, baseStats + Math.floor(Math.random() * variation) - Math.floor(variation/2)));
          const shooting = Math.max(1, Math.min(100, baseStats + Math.floor(Math.random() * variation) - Math.floor(variation/2)));
          const passing = Math.max(1, Math.min(100, baseStats + Math.floor(Math.random() * variation) - Math.floor(variation/2)));
          const defending = Math.max(1, Math.min(100, baseStats + Math.floor(Math.random() * variation) - Math.floor(variation/2)));
          const stamina = Math.max(1, Math.min(100, baseStats + Math.floor(Math.random() * variation) - Math.floor(variation/2)));
          const reflexes = Math.max(1, Math.min(100, baseStats + Math.floor(Math.random() * variation) - Math.floor(variation/2)));
          
          // Age between 18-35
          const age = 18 + Math.floor(Math.random() * 18);
          
          await prisma.player.create({
            data: {
              name: fullName,
              age: age,
              position: position,
              speed: speed,
              shooting: shooting,
              passing: passing,
              defending: defending,
              stamina: stamina,
              reflexes: reflexes,
              teamId: team.id,
              avatar: avatar.toString()
            }
          });
        }
        
        console.log(`    Created 11 players for ${team.name}`);
      }
    }
    
    console.log('\n✅ All teams and players created successfully!');
  } catch (error) {
    console.error('Error creating teams:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTeamsForLeagues();
