import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample data
const users = [
  {
    email: "john.doe@example.com",
    name: "John Doe",
    password: "password123",
  },
  {
    email: "jane.smith@example.com",
    name: "Jane Smith",
    password: "password123",
  },
  {
    email: "mike.johnson@example.com",
    name: "Mike Johnson",
    password: "password123",
  },
  {
    email: "sarah.wilson@example.com",
    name: "Sarah Wilson",
    password: "password123",
  },
  {
    email: "david.brown@example.com",
    name: "David Brown",
    password: "password123",
  },
  {
    email: "lisa.davis@example.com",
    name: "Lisa Davis",
    password: "password123",
  },
];

const leagues = [
  {
    name: "Premier League Fantasy",
    description:
      "The ultimate fantasy football experience with Premier League players",
    maxTeams: 8,
    // draftMethod: "SNAKE" as const, // Removed - no longer exists
    status: "ACTIVE" as const,
  },
  {
    name: "Champions League Draft",
    description: "Draft your dream team from Champions League players",
    maxTeams: 6,
    // draftMethod: "LINEAR" as const, // Removed - no longer exists
    status: "ACTIVE" as const,
  },
  {
    name: "World Cup Fantasy",
    description: "Build your team with the best World Cup players",
    maxTeams: 10,
    // draftMethod: "SNAKE" as const, // Removed - no longer exists
    status: "ACTIVE" as const,
  },
  {
    name: "La Liga Masters",
    description: "Spanish league fantasy draft with top La Liga talent",
    maxTeams: 8,
    // draftMethod: "SNAKE" as const, // Removed - no longer exists
    status: "ACTIVE" as const,
  },
  {
    name: "Serie A Champions",
    description: "Italian league fantasy with Serie A superstars",
    maxTeams: 6,
    // draftMethod: "LINEAR" as const, // Removed - no longer exists
    status: "ACTIVE" as const,
  },
];

const clubs = [
  {
    externalId: 1,
    name: "Manchester United",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png",
    country: "England",
  },
  {
    externalId: 2,
    name: "Liverpool",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png",
    country: "England",
  },
  {
    externalId: 3,
    name: "Real Madrid",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png",
    country: "Spain",
  },
  {
    externalId: 4,
    name: "Barcelona",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png",
    country: "Spain",
  },
  {
    externalId: 5,
    name: "Bayern Munich",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png",
    country: "Germany",
  },
  {
    externalId: 6,
    name: "Juventus",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png",
    country: "Italy",
  },
];

const players = [
  // Manchester United players
  {
    externalId: 101,
    name: "Marcus Rashford",
    age: 25,
    number: 10,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/258923-1671435885.jpg",
  },
  {
    externalId: 102,
    name: "Bruno Fernandes",
    age: 28,
    number: 18,
    position: "MIDFIELDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/240306-1671435885.jpg",
  },
  {
    externalId: 103,
    name: "Harry Maguire",
    age: 30,
    number: 5,
    position: "DEFENDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/177907-1671435885.jpg",
  },
  {
    externalId: 104,
    name: "David de Gea",
    age: 32,
    number: 1,
    position: "GOALKEEPER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/59377-1671435885.jpg",
  },

  // Liverpool players
  {
    externalId: 201,
    name: "Mohamed Salah",
    age: 31,
    number: 11,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/148455-1671435885.jpg",
  },
  {
    externalId: 202,
    name: "Virgil van Dijk",
    age: 32,
    number: 4,
    position: "DEFENDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/134425-1671435885.jpg",
  },
  {
    externalId: 203,
    name: "Alisson",
    age: 30,
    number: 1,
    position: "GOALKEEPER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/121455-1671435885.jpg",
  },
  {
    externalId: 204,
    name: "Sadio Mané",
    age: 31,
    number: 10,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/200512-1671435885.jpg",
  },

  // Real Madrid players
  {
    externalId: 301,
    name: "Karim Benzema",
    age: 35,
    number: 9,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/18944-1671435885.jpg",
  },
  {
    externalId: 302,
    name: "Luka Modrić",
    age: 37,
    number: 10,
    position: "MIDFIELDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/35285-1671435885.jpg",
  },
  {
    externalId: 303,
    name: "Sergio Ramos",
    age: 37,
    number: 4,
    position: "DEFENDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/25557-1671435885.jpg",
  },
  {
    externalId: 304,
    name: "Thibaut Courtois",
    age: 31,
    number: 1,
    position: "GOALKEEPER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/108390-1671435885.jpg",
  },

  // Barcelona players
  {
    externalId: 401,
    name: "Robert Lewandowski",
    age: 34,
    number: 9,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/38253-1671435885.jpg",
  },
  {
    externalId: 402,
    name: "Pedri",
    age: 20,
    number: 8,
    position: "MIDFIELDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/581678-1671435885.jpg",
  },
  {
    externalId: 403,
    name: "Gerard Piqué",
    age: 36,
    number: 3,
    position: "DEFENDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/18944-1671435885.jpg",
  },
  {
    externalId: 404,
    name: "Marc-André ter Stegen",
    age: 31,
    number: 1,
    position: "GOALKEEPER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/74857-1671435885.jpg",
  },

  // Bayern Munich players
  {
    externalId: 501,
    name: "Thomas Müller",
    age: 33,
    number: 25,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/59202-1671435885.jpg",
  },
  {
    externalId: 502,
    name: "Joshua Kimmich",
    age: 28,
    number: 6,
    position: "MIDFIELDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/189044-1671435885.jpg",
  },
  {
    externalId: 503,
    name: "Manuel Neuer",
    age: 37,
    number: 1,
    position: "GOALKEEPER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/17259-1671435885.jpg",
  },
  {
    externalId: 504,
    name: "Alphonso Davies",
    age: 22,
    number: 19,
    position: "DEFENDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/357662-1671435885.jpg",
  },

  // Juventus players
  {
    externalId: 601,
    name: "Cristiano Ronaldo",
    age: 38,
    number: 7,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/8198-1671435885.jpg",
  },
  {
    externalId: 602,
    name: "Paulo Dybala",
    age: 29,
    number: 10,
    position: "ATTACKER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/189044-1671435885.jpg",
  },
  {
    externalId: 603,
    name: "Giorgio Chiellini",
    age: 38,
    number: 3,
    position: "DEFENDER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/18944-1671435885.jpg",
  },
  {
    externalId: 604,
    name: "Wojciech Szczęsny",
    age: 33,
    number: 1,
    position: "GOALKEEPER" as const,
    photo:
      "https://img.a.transfermarkt.technology/portrait/header/18944-1671435885.jpg",
  },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  // await prisma.draftPick.deleteMany(); // Removed - no longer exists
  await prisma.teamPlayer.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.botMatch.deleteMany();
  await prisma.team.deleteMany();
  await prisma.leagueMember.deleteMany();
  await prisma.league.deleteMany();
  await prisma.player.deleteMany();
  await prisma.club.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👥 Creating users...");
  const createdUsers = [];
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash: hashedPassword,
      },
    });
    createdUsers.push(user);
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  // Create clubs
  console.log("🏟️ Creating clubs...");
  const createdClubs = [];
  for (const clubData of clubs) {
    const club = await prisma.club.create({
      data: clubData,
    });
    createdClubs.push(club);
    console.log(`✅ Created club: ${club.name}`);
  }

  // Create players
  console.log("⚽ Creating players...");
  const createdPlayers = [];
  let playerIndex = 0;
  for (let i = 0; i < clubs.length; i++) {
    const club = createdClubs[i];
    const clubPlayers = players.slice(i * 4, (i + 1) * 4); // 4 players per club

    for (const playerData of clubPlayers) {
      const player = await prisma.player.create({
        data: {
          ...playerData,
          clubId: club.id,
        },
      });
      createdPlayers.push(player);
      console.log(`✅ Created player: ${player.name} (${club.name})`);
    }
  }

  // Create leagues
  console.log("🏆 Creating leagues...");
  const createdLeagues = [];
  for (let i = 0; i < leagues.length; i++) {
    const leagueData = leagues[i];
    const admin = createdUsers[i % createdUsers.length]; // Distribute admin roles

    const league = await prisma.league.create({
      data: {
        ...leagueData,
        adminId: admin.id,
      },
    });
    createdLeagues.push(league);
    console.log(`✅ Created league: ${league.name} (Admin: ${admin.name})`);
  }

  // Create league members and teams
  console.log("👥 Creating league members and teams...");
  for (let i = 0; i < createdLeagues.length; i++) {
    const league = createdLeagues[i];
    const admin = await prisma.user.findUnique({
      where: { id: league.adminId },
    });

    // Add admin as league member
    await prisma.leagueMember.create({
      data: {
        userId: admin!.id,
        leagueId: league.id,
        role: "ADMIN",
      },
    });

    // Create teams for this league
    const teamCount = Math.min(4, league.maxTeams); // Create 4 teams or maxTeams, whichever is smaller
    for (let j = 0; j < teamCount; j++) {
      const owner = createdUsers[(i + j + 1) % createdUsers.length]; // Different owner for each team

      // Add owner as league member if not already
      const existingMember = await prisma.leagueMember.findFirst({
        where: {
          userId: owner.id,
          leagueId: league.id,
        },
      });

      if (!existingMember) {
        await prisma.leagueMember.create({
          data: {
            userId: owner.id,
            leagueId: league.id,
            role: "MEMBER",
          },
        });
      }

      // Create team
      const team = await prisma.team.create({
        data: {
          name: `${owner.name}'s Team`,
          ownerId: owner.id,
          leagueId: league.id,
          // draftPosition: j + 1, // Removed - no longer exists
        },
      });

      console.log(`✅ Created team: ${team.name} in ${league.name}`);
    }
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log(`📊 Created:`);
  console.log(`   - ${createdUsers.length} users`);
  console.log(`   - ${createdClubs.length} clubs`);
  console.log(`   - ${createdPlayers.length} players`);
  console.log(`   - ${createdLeagues.length} leagues`);
  console.log(`   - Multiple teams and league members`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
