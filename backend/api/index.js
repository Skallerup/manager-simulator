const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();

// CORS configuration
app.use((req, res, next) => {
  console.log("🔍 CORS MIDDLEWARE - Request Origin:", req.headers.origin);
  console.log("🔍 CORS MIDDLEWARE - Request Method:", req.method);
  console.log("🔍 CORS MIDDLEWARE - Request Headers:", req.headers);
  console.log("🔍 CORS MIDDLEWARE - FRONTEND_ORIGIN env:", process.env.FRONTEND_ORIGIN);
  next();
});

app.use(
  cors({
    origin: [
      process.env.FRONTEND_ORIGIN || "http://localhost:3001",
      "http://localhost:3001",
      "https://app.martinskallerup.dk",
      "https://martinskallerup.dk",
      /^https:\/\/.*\.vercel\.app$/
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "Cookie",
      "Accept",
      "Origin",
      "X-Requested-With",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
  })
);

app.use(cookieParser());
app.use(helmet());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  console.log("🔍 HEALTH CHECK - Headers:", req.headers);
  console.log("🔍 HEALTH CHECK - Origin:", req.headers.origin);
  console.log("🔍 HEALTH CHECK - User-Agent:", req.headers['user-agent']);
  res.json({ 
    status: "ok", 
    version: "6.0",
    timestamp: new Date().toISOString(),
    headers: req.headers,
    origin: req.headers.origin
  });
});

// Test endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Welcome to Manager Simulator Backend!" });
});

// Simple auth test endpoint
app.post("/auth/test", (req, res) => {
  res.json({ message: "Auth test endpoint working", body: req.body });
});

// Auth endpoints for frontend
app.get("/auth/me", (req, res) => {
  console.log("🔍 AUTH/ME - Headers:", req.headers);
  console.log("🔍 AUTH/ME - Cookies:", req.cookies);
  console.log("🔍 AUTH/ME - Origin:", req.headers.origin);
  console.log("🔍 AUTH/ME - User-Agent:", req.headers['user-agent']);
  
  // Check if user has valid authentication
  const hasValidAuth = req.cookies && req.cookies.access_token;
  
  if (!hasValidAuth) {
    console.log("🔍 AUTH/ME - No valid authentication, returning 401");
    return res.status(401).json({ 
      message: "Unauthenticated",
      debug: {
        headers: req.headers,
        cookies: req.cookies,
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Build user from cookies (so profile updates persist)
  const cookieName = req.cookies.user_name || "Martin Skallerup";
  const cookieEmail = req.cookies.user_email || "skallerup+5@gmail.com";

  // Return user object directly (frontend expects the raw user object)
  res.json({
    id: "1",
    email: cookieEmail,
    name: cookieName,
    createdAt: new Date().toISOString(),
  });
});

app.post("/auth/refresh", (req, res) => {
  res.json({ 
    message: "Refresh token endpoint - not implemented yet" 
  });
});

app.post("/auth/login", (req, res) => {
  console.log("🔍 AUTH/LOGIN - Headers:", req.headers);
  console.log("🔍 AUTH/LOGIN - Body:", req.body);
  console.log("🔍 AUTH/LOGIN - Origin:", req.headers.origin);
  console.log("🔍 AUTH/LOGIN - User-Agent:", req.headers['user-agent']);
  
  // Simple login implementation for testing
  const { email, password } = req.body;
  
  // Accept any email/password for testing
  if (email && password) {
    // Set access token cookie and basic user cookies
    res.cookie('access_token', 'fake-access-token-' + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.cookie('user_email', email, { sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
    // Derive a friendly name from email if no profile yet
    const derivedName = (email.split('@')[0] || 'Martin').replace(/\W+/g, ' ');
    res.cookie('user_name', derivedName, { sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
    
    res.json({
      id: "1",
      email,
      name: derivedName,
      createdAt: new Date().toISOString(),
    });
  } else {
    res.status(401).json({ 
      message: "Invalid credentials",
      debug: {
        headers: req.headers,
        body: req.body,
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
      }
    });
  }
});

app.post("/auth/logout", (req, res) => {
  res.json({ 
    message: "Logout successful" 
  });
});

app.post("/auth/register", (req, res) => {
  // Simple registration implementation for testing
  const { email, password, name } = req.body;
  
  if (email && password && name) {
    res.json({ 
      user: {
        id: "2",
        email: email,
        name: name,
        createdAt: new Date().toISOString()
      },
      message: "Registration successful"
    });
  } else {
    res.status(400).json({ 
      message: "Missing required fields" 
    });
  }
});

// Profile endpoints
app.patch("/auth/profile", (req, res) => {
  console.log("🔍 AUTH/PROFILE (PATCH) - Headers:", req.headers);
  console.log("🔍 AUTH/PROFILE (PATCH) - Body:", req.body);
  console.log("🔍 AUTH/PROFILE (PATCH) - Origin:", req.headers.origin);

  const { name, email } = req.body || {};

  // Persist to simple cookies so subsequent /auth/me reflects changes
  if (name) res.cookie('user_name', name, { sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
  if (email) res.cookie('user_email', email, { sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.json({ success: true });
});

// League endpoints
app.get("/api/leagues/user/current", (req, res) => {
  res.json({
    leagues: [
      {
        id: "1",
        name: "Test League",
        description: "A test league for development"
      }
    ]
  });
});

// Store fired players in memory (in real app this would be in database)
let firedPlayers = new Set();

// Team endpoints
app.get("/api/teams/my-team", (req, res) => {
  console.log("🔍 TEAMS/MY-TEAM - Headers:", req.headers);
  console.log("🔍 TEAMS/MY-TEAM - Origin:", req.headers.origin);
  console.log("🔍 TEAMS/MY-TEAM - Fired players:", Array.from(firedPlayers));
  
  const allPlayers = [
    // Starters (11 players)
    {
      id: "1",
      name: "Lars Andersen",
      position: "GOALKEEPER",
      rating: 75,
      age: 25,
      isStarter: true,
      isCaptain: true,
      formationPosition: "gk",
      speed: 60,
      shooting: 40,
      passing: 70,
      defending: 80,
      stamina: 85,
      reflexes: 90
    },
    {
      id: "2", 
      name: "Mikkel Hansen",
      position: "DEFENDER",
      rating: 80,
      age: 27,
      isStarter: true,
      isCaptain: false,
      formationPosition: "cb1",
      speed: 70,
      shooting: 50,
      passing: 75,
      defending: 90,
      stamina: 80,
      reflexes: 60
    },
    {
      id: "3",
      name: "Jesper Nielsen", 
      position: "DEFENDER",
      rating: 78,
      age: 24,
      isStarter: true,
      isCaptain: false,
      formationPosition: "cb2",
      speed: 72,
      shooting: 45,
      passing: 70,
      defending: 85,
      stamina: 82,
      reflexes: 65
    },
    {
      id: "4",
      name: "Christian Larsen",
      position: "DEFENDER", 
      rating: 76,
      age: 26,
      isStarter: true,
      isCaptain: false,
      formationPosition: "lb",
      speed: 75,
      shooting: 55,
      passing: 80,
      defending: 82,
      stamina: 85,
      reflexes: 70
    },
    {
      id: "5",
      name: "Thomas Møller",
      position: "DEFENDER", 
      rating: 74,
      age: 28,
      isStarter: true,
      isCaptain: false,
      formationPosition: "rb",
      speed: 73,
      shooting: 50,
      passing: 75,
      defending: 80,
      stamina: 83,
      reflexes: 68
    },
    {
      id: "6",
      name: "Michael Sørensen",
      position: "MIDFIELDER", 
      rating: 85,
      age: 24,
      isStarter: true,
      isCaptain: false,
      formationPosition: "cm1",
      speed: 80,
      shooting: 70,
      passing: 90,
      defending: 75,
      stamina: 85,
      reflexes: 65
    },
    {
      id: "7",
      name: "Henrik Madsen",
      position: "MIDFIELDER", 
      rating: 82,
      age: 25,
      isStarter: true,
      isCaptain: false,
      formationPosition: "cm2",
      speed: 78,
      shooting: 75,
      passing: 85,
      defending: 70,
      stamina: 88,
      reflexes: 62
    },
    {
      id: "8",
      name: "Steen Christensen",
      position: "MIDFIELDER", 
      rating: 79,
      age: 26,
      isStarter: true,
      isCaptain: false,
      formationPosition: "cm3",
      speed: 76,
      shooting: 68,
      passing: 82,
      defending: 72,
      stamina: 86,
      reflexes: 67
    },
    {
      id: "9",
      name: "Flemming Jørgensen",
      position: "ATTACKER", 
      rating: 90,
      age: 26,
      isStarter: true,
      isCaptain: false,
      formationPosition: "st1",
      speed: 90,
      shooting: 95,
      passing: 80,
      defending: 40,
      stamina: 85,
      reflexes: 70
    },
    {
      id: "10",
      name: "Rasmus Poulsen",
      position: "ATTACKER", 
      rating: 87,
      age: 23,
      isStarter: true,
      isCaptain: false,
      formationPosition: "st2",
      speed: 88,
      shooting: 92,
      passing: 75,
      defending: 35,
      stamina: 87,
      reflexes: 72
    },
    {
      id: "11",
      name: "Daniel Simonsen",
      position: "ATTACKER", 
      rating: 84,
      age: 24,
      isStarter: true,
      isCaptain: false,
      formationPosition: "st3",
      speed: 85,
      shooting: 88,
      passing: 78,
      defending: 38,
      stamina: 84,
      reflexes: 68
    },
    // Substitutes (5 players)
    {
      id: "12",
      name: "Nikolaj Andersen",
      position: "DEFENDER", 
      rating: 72,
      age: 22,
      isStarter: false,
      isCaptain: false,
      formationPosition: null,
      speed: 70,
      shooting: 45,
      passing: 68,
      defending: 75,
      stamina: 80,
      reflexes: 60
    },
    {
      id: "13",
      name: "Mads Larsen",
      position: "MIDFIELDER", 
      rating: 76,
      age: 21,
      isStarter: false,
      isCaptain: false,
      formationPosition: null,
      speed: 75,
      shooting: 65,
      passing: 80,
      defending: 68,
      stamina: 82,
      reflexes: 63
    },
    {
      id: "14",
      name: "Simon Hansen",
      position: "ATTACKER", 
      rating: 81,
      age: 20,
      isStarter: false,
      isCaptain: false,
      formationPosition: null,
      speed: 82,
      shooting: 85,
      passing: 72,
      defending: 32,
      stamina: 83,
      reflexes: 65
    },
    {
      id: "15",
      name: "Claus Nielsen",
      position: "GOALKEEPER", 
      rating: 68,
      age: 19,
      isStarter: false,
      isCaptain: false,
      formationPosition: null,
      speed: 55,
      shooting: 30,
      passing: 65,
      defending: 70,
      stamina: 75,
      reflexes: 85
    },
    {
      id: "16",
      name: "Ole Møller",
      position: "DEFENDER", 
      rating: 70,
      age: 23,
      isStarter: false,
      isCaptain: false,
      formationPosition: null,
      speed: 68,
      shooting: 42,
      passing: 70,
      defending: 78,
      stamina: 79,
      reflexes: 62
    }
  ];
  
  // Filter out fired players
  const activePlayers = allPlayers.filter(player => !firedPlayers.has(player.id));
  
        res.json({
          id: "1",
          name: "Test Team",
          logo: "/avatars/default.svg",
          budget: 500000, // Reduced budget to show facility purchases
          leagueId: "1",
          overallRating: 80,
          formation: "5-3-2",
          players: activePlayers
        });
});

app.post("/api/teams", (req, res) => {
  res.json({
    team: {
      id: "2",
      name: req.body.name || "New Team",
      logo: "/avatars/default.svg",
      budget: 1000000,
      leagueId: req.body.leagueId || "1"
    },
    message: "Team created successfully"
  });
});

// Set team captain endpoint
app.put("/api/teams/:teamId/captain/:playerId", (req, res) => {
  console.log("🔍 TEAMS/CAPTAIN - Headers:", req.headers);
  console.log("🔍 TEAMS/CAPTAIN - Team ID:", req.params.teamId);
  console.log("🔍 TEAMS/CAPTAIN - Player ID:", req.params.playerId);
  console.log("🔍 TEAMS/CAPTAIN - Origin:", req.headers.origin);
  
  const { teamId, playerId } = req.params;
  
  // For now, just return success - in real implementation would update database
  res.json({
    success: true,
    message: `Player ${playerId} set as captain for team ${teamId}`,
    teamId: teamId,
    captainId: playerId
  });
});

// Stadium endpoints
app.get("/api/stadium/:teamId", (req, res) => {
  console.log("🔍 STADIUM - Headers:", req.headers);
  console.log("🔍 STADIUM - Team ID:", req.params.teamId);
  console.log("🔍 STADIUM - Origin:", req.headers.origin);
  
  const { teamId } = req.params;
  
  res.json({
    id: teamId,
    name: "Test Stadium",
    capacity: 50000,
    level: 1,
    facilities: [
      {
        id: "1",
        name: "Training Ground",
        level: 1,
        type: "TRAINING",
        cost: 1000000,
        benefits: ["+5% Player Development"]
      },
      {
        id: "2", 
        name: "Youth Academy",
        level: 1,
        type: "YOUTH",
        cost: 2000000,
        benefits: ["+10% Youth Player Quality"]
      }
    ],
    upgrades: [
      {
        id: "1",
        name: "Stadium Expansion",
        level: 2,
        cost: 5000000,
        benefits: ["+10000 Capacity"]
      }
    ]
  });
});

app.get("/api/stadium/:teamId/stats", (req, res) => {
  console.log("🔍 STADIUM/STATS - Headers:", req.headers);
  console.log("🔍 STADIUM/STATS - Team ID:", req.params.teamId);
  console.log("🔍 STADIUM/STATS - Origin:", req.headers.origin);
  
  const { teamId } = req.params;
  
  res.json({
    teamId: teamId,
    attendance: {
      average: 35000,
      capacity: 50000,
      percentage: 70
    },
    revenue: {
      matchday: 150000,
      season: 3000000
    },
    facilities: {
      total: 2,
      level: 1
    }
  });
});

// Stadium facilities endpoints
app.get("/api/stadium/:teamId/facilities", (req, res) => {
  console.log("🔍 STADIUM/FACILITIES - Headers:", req.headers);
  console.log("🔍 STADIUM/FACILITIES - Team ID:", req.params.teamId);
  console.log("🔍 STADIUM/FACILITIES - Origin:", req.headers.origin);
  
  const { teamId } = req.params;
  
  res.json({
    facilities: [
      {
        id: "1",
        name: "Training Ground",
        type: "TRAINING",
        level: 1,
        cost: 1000000,
        benefits: ["+5% Player Development"]
      },
      {
        id: "2",
        name: "Youth Academy", 
        type: "YOUTH",
        level: 1,
        cost: 2000000,
        benefits: ["+10% Youth Player Quality"]
      }
    ]
  });
});

app.post("/api/stadium/:teamId/facilities", (req, res) => {
  console.log("🔍 STADIUM/FACILITIES (POST) - Headers:", req.headers);
  console.log("🔍 STADIUM/FACILITIES (POST) - Team ID:", req.params.teamId);
  console.log("🔍 STADIUM/FACILITIES (POST) - Body:", req.body);
  console.log("🔍 STADIUM/FACILITIES (POST) - Origin:", req.headers.origin);
  
  const { teamId } = req.params;
  const { name, type, level, cost } = req.body;
  
  // Update team budget (subtract cost)
  const facilityCost = cost || 1000000;
  
  res.json({
    success: true,
    facility: {
      id: "facility-" + Date.now(),
      name: name || "New Facility",
      type: type || "GENERAL",
      level: level || 1,
      cost: facilityCost,
      benefits: ["+5% Stadium Value"]
    },
    budgetUpdate: {
      newBudget: 1000000 - facilityCost, // Subtract cost from budget
      cost: facilityCost
    },
    message: "Facility created successfully"
  });
});

app.put("/api/stadium/:teamId/facilities/:facilityId", (req, res) => {
  console.log("🔍 STADIUM/FACILITIES (PUT) - Headers:", req.headers);
  console.log("🔍 STADIUM/FACILITIES (PUT) - Team ID:", req.params.teamId);
  console.log("🔍 STADIUM/FACILITIES (PUT) - Facility ID:", req.params.facilityId);
  console.log("🔍 STADIUM/FACILITIES (PUT) - Body:", req.body);
  console.log("🔍 STADIUM/FACILITIES (PUT) - Origin:", req.headers.origin);
  
  const { teamId, facilityId } = req.params;
  const { level } = req.body;
  
  res.json({
    success: true,
    facility: {
      id: facilityId,
      level: level || 2,
      cost: 2000000
    },
    message: "Facility upgraded successfully"
  });
});

app.delete("/api/stadium/:teamId/facilities/:facilityId", (req, res) => {
  console.log("🔍 STADIUM/FACILITIES (DELETE) - Headers:", req.headers);
  console.log("🔍 STADIUM/FACILITIES (DELETE) - Team ID:", req.params.teamId);
  console.log("🔍 STADIUM/FACILITIES (DELETE) - Facility ID:", req.params.facilityId);
  console.log("🔍 STADIUM/FACILITIES (DELETE) - Origin:", req.headers.origin);
  
  const { teamId, facilityId } = req.params;
  
  res.json({
    success: true,
    message: `Facility ${facilityId} removed successfully`
  });
});

// Matches endpoints (bot matches)
let botMatchStore = {
  matches: [], // { id, createdAt, opponentName, result }
  highlightsById: {}, // id -> highlights array
};

// History
app.get("/api/matches/bot", (req, res) => {
  res.json({ matches: botMatchStore.matches });
});

// Create a new bot match
app.post("/api/matches/bot", (req, res) => {
  const id = Date.now().toString();
  // Create a placeholder match entry; result decided on simulate
  botMatchStore.matches.unshift({
    id,
    createdAt: new Date().toISOString(),
    opponentName: "Bot United",
    result: "pending",
  });
  botMatchStore.highlightsById[id] = [];
  res.json({ id });
});

// Simulate a bot match and store result + highlights
app.post("/api/matches/bot/:id/simulate", (req, res) => {
  const { id } = req.params;
  const match = botMatchStore.matches.find((m) => m.id === id);
  if (!match) return res.status(404).json({ error: "Match not found" });

  // Simple simulation
  const playerGoals = Math.floor(Math.random() * 5);
  const botGoals = Math.floor(Math.random() * 5);
  match.result = playerGoals >= botGoals ? (playerGoals === botGoals ? "draw" : "win") : "loss";

  const highlights = [
    { minute: 5, team: "player", player: "Flemming Jørgensen", description: "Skud på mål" },
    { minute: 28, team: "bot", player: "Bot Spiller", description: "Stor chance" },
    { minute: 67, team: "player", player: "Rasmus Poulsen", description: "Mål!" },
  ];
  botMatchStore.highlightsById[id] = highlights;

  res.json({ id, playerScore: playerGoals, botScore: botGoals, highlights });
});

// Highlights for a specific match
app.get("/api/matches/bot/:id/highlights", (req, res) => {
  const { id } = req.params;
  const highlights = botMatchStore.highlightsById[id] || [];
  res.json({ highlights });
});

// Dashboard data endpoint
app.get("/api/dashboard", (req, res) => {
  console.log("🔍 DASHBOARD - Headers:", req.headers);
  console.log("🔍 DASHBOARD - Origin:", req.headers.origin);
  console.log("🔍 DASHBOARD - User-Agent:", req.headers['user-agent']);
  
  res.json({
    stats: {
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      winRate: 0
    },
    recentActivity: [],
    upcomingEvents: [],
    debug: {
      headers: req.headers,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    }
  });
});

// Transfers endpoints
app.get("/api/transfers/available", (req, res) => {
  console.log("🔍 TRANSFERS/AVAILABLE - Headers:", req.headers);
  console.log("🔍 TRANSFERS/AVAILABLE - Origin:", req.headers.origin);
  
  // Return empty array - no available transfers
  res.json([]);
});

// Frontend expects "/api/transfers/my-team" returning an array
app.get("/api/transfers/my-team", (req, res) => {
  console.log("🔍 TRANSFERS/MY-TRANSFERS - Headers:", req.headers);
  res.json([]);
});

app.get("/api/transfers/free-transfer", (req, res) => {
  console.log("🔍 TRANSFERS/FREE-TRANSFER - Headers:", req.headers);
  console.log("🔍 TRANSFERS/FREE-TRANSFER - Origin:", req.headers.origin);
  
  // Return empty array - no free transfers
  res.json([]);
});

// Fire player endpoint
app.delete("/api/transfers/fire/:id", (req, res) => {
  console.log("🔍 TRANSFERS/FIRE - Headers:", req.headers);
  console.log("🔍 TRANSFERS/FIRE - Player ID:", req.params.id);
  console.log("🔍 TRANSFERS/FIRE - Origin:", req.headers.origin);
  
  const playerId = req.params.id;
  
  // Add player to fired players set
  firedPlayers.add(playerId);
  
  console.log("🔍 TRANSFERS/FIRE - Player fired, fired players now:", Array.from(firedPlayers));
  
  res.json({
    success: true,
    message: `Player ${playerId} fired successfully`,
    playerId: playerId
  });
});

// Root endpoint
app.get("/", (req, res) => {
  console.log("🔍 ROOT - Headers:", req.headers);
  console.log("🔍 ROOT - Origin:", req.headers.origin);
  console.log("🔍 ROOT - User-Agent:", req.headers['user-agent']);
  
  res.json({ 
    message: "Manager Simulator Backend API", 
    version: "6.0",
    debug: {
      headers: req.headers,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = app;