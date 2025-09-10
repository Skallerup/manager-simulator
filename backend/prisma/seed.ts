import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

// Helper function to get formation position based on player index and formation
function getFormationPosition(playerIndex: number, formation: string): string {
  const formations = {
    '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'],
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    '5-3-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LWB', 'CM', 'CM', 'RWB', 'ST', 'ST']
  };
  
  const positions = formations[formation as keyof typeof formations] || formations['4-4-2'];
  return positions[playerIndex] || 'SUB';
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const testUser1 = await prisma.user.upsert({
    where: { email: 'skallerup+3@gmail.com' },
    update: {},
    create: {
      email: 'skallerup+3@gmail.com',
      name: 'Test User 1',
      passwordHash: await hash('12345678'),
      isAdmin: true
    }
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: 'skallerup+4@gmail.com' },
    update: {},
    create: {
      email: 'skallerup+4@gmail.com',
      name: 'Test User 2',
      passwordHash: await hash('12345678'),
      isAdmin: false
    }
  });

  const testUser3 = await prisma.user.upsert({
    where: { email: 'skallerup+5@gmail.com' },
    update: {},
    create: {
      email: 'skallerup+5@gmail.com',
      name: 'Test User 3',
      passwordHash: await hash('12345678'),
      isAdmin: false
    }
  });

  console.log('✅ Test users created');

  // Create leagues
  const superliga = await prisma.league.upsert({
    where: { id: 'superliga' },
    update: {},
    create: {
      id: 'superliga',
      name: 'Superliga',
      description: 'Den bedste danske fodboldliga',
      level: 1,
      maxTeams: 12,
      status: 'ACTIVE',
      adminId: testUser1.id
    }
  });

  const division1 = await prisma.league.upsert({
    where: { id: 'division1' },
    update: {},
    create: {
      id: 'division1',
      name: '1. Division',
      description: 'Anden bedste danske fodboldliga',
      level: 2,
      maxTeams: 12,
      status: 'ACTIVE',
      adminId: testUser1.id
    }
  });

  const division2 = await prisma.league.upsert({
    where: { id: 'division2' },
    update: {},
    create: {
      id: 'division2',
      name: '2. Division',
      description: 'Tredje bedste danske fodboldliga',
      level: 3,
      maxTeams: 12,
      status: 'ACTIVE',
      adminId: testUser1.id
    }
  });

  console.log('✅ Leagues created');

  // Create bot teams for each league
  const leagues = [superliga, division1, division2];
  
  for (const league of leagues) {
    const existingTeams = await prisma.team.count({
      where: { leagueId: league.id }
    });

    if (existingTeams < 12) {
      const botTeamNames = [
        'Bot United', 'Bot City', 'Bot FC', 'Bot Athletic',
        'Bot Rovers', 'Bot Wanderers', 'Bot Town', 'Bot Villa',
        'Bot Rangers', 'Bot Albion', 'Bot Hotspur', 'Bot Palace'
      ];

      for (let i = existingTeams; i < 12; i++) {
        const teamName = botTeamNames[i] || `Bot Team ${i + 1}`;
        
        await prisma.team.create({
          data: {
            name: teamName,
            formation: '4-4-2',
            colors: JSON.stringify({ primary: '#000000', secondary: '#FFFFFF' }),
            logo: 'bot-logo',
            budget: 1000000,
            leagueId: league.id,
            isBot: true
          }
        });
      }
    }
  }

  console.log('✅ Bot teams created');

  // Create players for bot teams
  const botTeams = await prisma.team.findMany({
    where: { isBot: true },
    include: { players: true }
  });

  for (const team of botTeams) {
    if (team.players.length === 0) {
      // Create 16 players for bot teams
      const botPlayerNames = [
        'Bot Player 1', 'Bot Player 2', 'Bot Player 3', 'Bot Player 4',
        'Bot Player 5', 'Bot Player 6', 'Bot Player 7', 'Bot Player 8',
        'Bot Player 9', 'Bot Player 10', 'Bot Player 11', 'Bot Player 12',
        'Bot Player 13', 'Bot Player 14', 'Bot Player 15', 'Bot Player 16'
      ];

      // Position distribution: 2 GK, 5 DEF, 5 MID, 4 ATT
      const positions = [
        'GOALKEEPER', 'GOALKEEPER', // 2 goalkeepers
        'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER', // 5 defenders
        'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', // 5 midfielders
        'ATTACKER', 'ATTACKER', 'ATTACKER', 'ATTACKER' // 4 attackers
      ];

      for (let i = 0; i < 16; i++) {
        const player = await prisma.player.create({
          data: {
            name: botPlayerNames[i],
            age: Math.floor(Math.random() * 10) + 20, // 20-29 years old
            position: positions[i] as any,
            speed: Math.floor(Math.random() * 40) + 60,
            shooting: Math.floor(Math.random() * 40) + 60,
            passing: Math.floor(Math.random() * 40) + 60,
            defending: Math.floor(Math.random() * 40) + 60,
            stamina: Math.floor(Math.random() * 40) + 60,
            reflexes: Math.floor(Math.random() * 40) + 60,
            photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botPlayerNames[i]}&backgroundColor=transparent&backgroundType=gradientLinear&gradientDirection=45`
          }
        });

        // First 11 players are starters, rest are substitutes
        await prisma.teamPlayer.create({
          data: {
            teamId: team.id,
            playerId: player.id,
            position: player.position,
            isStarter: i < 11,
            formationPosition: i < 11 ? getFormationPosition(i, team.formation) : null
          }
        });
      }
    }
  }

  console.log('✅ Players created for bot teams');

  // Create user teams if they don't exist
  const user1Team = await prisma.team.findFirst({
    where: { ownerId: testUser1.id }
  });

  if (!user1Team) {
    // Remove a bot team from division2 to make room for user team
    const botTeamToRemove = await prisma.team.findFirst({
      where: { 
        leagueId: division2.id,
        isBot: true
      }
    });
    
    if (botTeamToRemove) {
      // Delete team players first
      await prisma.teamPlayer.deleteMany({
        where: { teamId: botTeamToRemove.id }
      });
      
      // Delete players associated with this team
      await prisma.player.deleteMany({
        where: { 
          teamPlayers: {
            some: { teamId: botTeamToRemove.id }
          }
        }
      });
      
      // Delete the team
      await prisma.team.delete({
        where: { id: botTeamToRemove.id }
      });
    }

    await prisma.team.create({
      data: {
        name: 'Test Team 1',
        formation: '4-4-2',
        colors: JSON.stringify({ primary: '#FF0000', secondary: '#FFFFFF' }),
        logo: 'team-logo-1',
        budget: 1000000,
        leagueId: division2.id,
        ownerId: testUser1.id,
        isBot: false
      }
    });
  }

  const user2Team = await prisma.team.findFirst({
    where: { ownerId: testUser2.id }
  });

  if (!user2Team) {
    // Remove a bot team from division2 to make room for user team
    const botTeamToRemove = await prisma.team.findFirst({
      where: { 
        leagueId: division2.id,
        isBot: true
      }
    });
    
    if (botTeamToRemove) {
      // Delete team players first
      await prisma.teamPlayer.deleteMany({
        where: { teamId: botTeamToRemove.id }
      });
      
      // Delete players associated with this team
      await prisma.player.deleteMany({
        where: { 
          teamPlayers: {
            some: { teamId: botTeamToRemove.id }
          }
        }
      });
      
      // Delete the team
      await prisma.team.delete({
        where: { id: botTeamToRemove.id }
      });
    }

    await prisma.team.create({
      data: {
        name: 'Test Team 2',
        formation: '4-4-2',
        colors: JSON.stringify({ primary: '#0000FF', secondary: '#FFFFFF' }),
        logo: 'team-logo-2',
        budget: 1000000,
        leagueId: division2.id,
        ownerId: testUser2.id,
        isBot: false
      }
    });
  }

  const user3Team = await prisma.team.findFirst({
    where: { ownerId: testUser3.id }
  });

  if (!user3Team) {
    // Remove a bot team from division2 to make room for user team
    const botTeamToRemove = await prisma.team.findFirst({
      where: { 
        leagueId: division2.id,
        isBot: true
      }
    });
    
    if (botTeamToRemove) {
      // Delete team players first
      await prisma.teamPlayer.deleteMany({
        where: { teamId: botTeamToRemove.id }
      });
      
      // Delete players associated with this team
      await prisma.player.deleteMany({
        where: { 
          teamPlayers: {
            some: { teamId: botTeamToRemove.id }
          }
        }
      });
      
      // Delete the team
      await prisma.team.delete({
        where: { id: botTeamToRemove.id }
      });
    }

    await prisma.team.create({
      data: {
        name: 'Test Team 3',
        formation: '4-4-2',
        colors: JSON.stringify({ primary: '#00FF00', secondary: '#000000' }),
        logo: 'team-logo-3',
        budget: 1000000,
        leagueId: division2.id,
        ownerId: testUser3.id,
        isBot: false
      }
    });
  }

  console.log('✅ User teams created');

  // Create players for user teams
  const userTeams = await prisma.team.findMany({
    where: { isBot: false },
    include: { players: true }
  });

  for (const team of userTeams) {
    if (team.players.length === 0) {
      // Create 16 players for the team (11 starters + 5 substitutes)
      const playerNames = [
        'Lars Nielsen', 'Mikkel Hansen', 'Anders Andersen', 'Thomas Larsen',
        'Michael Christensen', 'Jesper Sørensen', 'Martin Pedersen', 'Nikolaj Madsen',
        'Daniel Rasmussen', 'Christian Jørgensen', 'Simon Poulsen', 'Emil Hansen',
        'Frederik Nielsen', 'Magnus Andersen', 'Oliver Larsen', 'Victor Christensen'
      ];

      // Position distribution: 2 GK, 5 DEF, 5 MID, 4 ATT
      const positions = [
        'GOALKEEPER', 'GOALKEEPER', // 2 goalkeepers
        'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER', // 5 defenders
        'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', // 5 midfielders
        'ATTACKER', 'ATTACKER', 'ATTACKER', 'ATTACKER' // 4 attackers
      ];

      for (let i = 0; i < 16; i++) {
        const player = await prisma.player.create({
          data: {
            name: playerNames[i],
            age: Math.floor(Math.random() * 10) + 20, // 20-29 years old
            position: positions[i] as any,
            speed: Math.floor(Math.random() * 40) + 60,
            shooting: Math.floor(Math.random() * 40) + 60,
            passing: Math.floor(Math.random() * 40) + 60,
            defending: Math.floor(Math.random() * 40) + 60,
            stamina: Math.floor(Math.random() * 40) + 60,
            reflexes: Math.floor(Math.random() * 40) + 60,
            photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerNames[i]}&backgroundColor=transparent&backgroundType=gradientLinear&gradientDirection=45`
          }
        });

        // First 11 players are starters, rest are substitutes
        await prisma.teamPlayer.create({
          data: {
            teamId: team.id,
            playerId: player.id,
            position: player.position,
            isStarter: i < 11,
            formationPosition: i < 11 ? getFormationPosition(i, team.formation) : null
          }
        });
      }
    }
  }

  console.log('✅ Players created for user teams');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
