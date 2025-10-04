require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
app.get("/api/leagues", (req, res) => {
  console.log("🔍 LEAGUES - Headers:", req.headers);
  console.log("🔍 LEAGUES - Origin:", req.headers.origin);
  
  res.json([
    {
      id: "1",
      name: "Test League",
      description: "A test league for development",
      level: 1,
      maxTeams: 16,
      status: "active",
      teams: [
        { id: "1", name: "Team Alpha", isBot: false },
        { id: "2", name: "Team Beta", isBot: false },
        { id: "3", name: "Team Gamma", isBot: true },
        { id: "4", name: "Team Delta", isBot: true },
        { id: "5", name: "Team Echo", isBot: true },
        { id: "6", name: "Team Foxtrot", isBot: true }
      ],
      seasons: [
        { id: "1", year: 2024, status: "active" }
      ]
    },
    {
      id: "2", 
      name: "Championship League",
      description: "The main championship league",
      level: 2,
      maxTeams: 20,
      status: "active",
      teams: [
        { id: "7", name: "Championship A", isBot: false },
        { id: "8", name: "Championship B", isBot: false },
        { id: "9", name: "Championship C", isBot: true },
        { id: "10", name: "Championship D", isBot: true },
        { id: "11", name: "Championship E", isBot: true },
        { id: "12", name: "Championship F", isBot: true },
        { id: "13", name: "Championship G", isBot: true },
        { id: "14", name: "Championship H", isBot: true }
      ],
      seasons: [
        { id: "2", year: 2024, status: "active" }
      ]
    },
    {
      id: "3",
      name: "Premier League",
      description: "The premier division",
      level: 3,
      maxTeams: 12,
      status: "active",
      teams: [
        { id: "15", name: "Premier A", isBot: false },
        { id: "16", name: "Premier B", isBot: true },
        { id: "17", name: "Premier C", isBot: true },
        { id: "18", name: "Premier D", isBot: true },
        { id: "19", name: "Premier E", isBot: true },
        { id: "20", name: "Premier F", isBot: true }
      ],
      seasons: [
        { id: "3", year: 2024, status: "active" }
      ]
    }
  ]);
});

app.get("/api/leagues/browse", (req, res) => {
  console.log("🔍 LEAGUES/BROWSE - Headers:", req.headers);
  console.log("🔍 LEAGUES/BROWSE - Origin:", req.headers.origin);
  
  res.json([
    {
      id: "1",
      name: "Test League",
      description: "A test league for development",
      level: 1,
      maxTeams: 16,
      status: "active",
      teams: [
        { id: "1", name: "Team Alpha", isBot: false },
        { id: "2", name: "Team Beta", isBot: false },
        { id: "3", name: "Team Gamma", isBot: true },
        { id: "4", name: "Team Delta", isBot: true },
        { id: "5", name: "Team Echo", isBot: true },
        { id: "6", name: "Team Foxtrot", isBot: true }
      ],
      seasons: [
        { id: "1", year: 2024, status: "active" }
      ]
    },
    {
      id: "2", 
      name: "Championship League",
      description: "The main championship league",
      level: 2,
      maxTeams: 20,
      status: "active",
      teams: [
        { id: "7", name: "Championship A", isBot: false },
        { id: "8", name: "Championship B", isBot: false },
        { id: "9", name: "Championship C", isBot: true },
        { id: "10", name: "Championship D", isBot: true },
        { id: "11", name: "Championship E", isBot: true },
        { id: "12", name: "Championship F", isBot: true },
        { id: "13", name: "Championship G", isBot: true },
        { id: "14", name: "Championship H", isBot: true }
      ],
      seasons: [
        { id: "2", year: 2024, status: "active" }
      ]
    },
    {
      id: "3",
      name: "Premier League",
      description: "The premier division",
      level: 3,
      maxTeams: 12,
      status: "active",
      teams: [
        { id: "15", name: "Premier A", isBot: false },
        { id: "16", name: "Premier B", isBot: true },
        { id: "17", name: "Premier C", isBot: true },
        { id: "18", name: "Premier D", isBot: true },
        { id: "19", name: "Premier E", isBot: true },
        { id: "20", name: "Premier F", isBot: true }
      ],
      seasons: [
        { id: "3", year: 2024, status: "active" }
      ]
    }
  ]);
});

app.get("/api/leagues/:id", (req, res) => {
  console.log("🔍 LEAGUES/:ID - Headers:", req.headers);
  console.log("🔍 LEAGUES/:ID - League ID:", req.params.id);
  console.log("🔍 LEAGUES/:ID - Origin:", req.headers.origin);
  
  const { id } = req.params;
  
  // Return different data based on league ID
  const leagueData = {
    "1": {
      id: "1",
      name: "Test League",
      description: "A test league for development",
      level: 1,
      maxTeams: 16,
      status: "active",
      teams: [
        { id: "1", name: "Team Alpha", isBot: false },
        { id: "2", name: "Team Beta", isBot: false },
        { id: "3", name: "Team Gamma", isBot: true },
        { id: "4", name: "Team Delta", isBot: true },
        { id: "5", name: "Team Echo", isBot: true },
        { id: "6", name: "Team Foxtrot", isBot: true }
      ],
      seasons: [
        { id: "1", year: 2024, status: "active" }
      ],
      standings: [
        { position: 1, team: "Team Alpha", points: 30, played: 10, won: 9, drawn: 3, lost: 0 },
        { position: 2, team: "Team Beta", points: 25, played: 10, won: 8, drawn: 1, lost: 1 },
        { position: 3, team: "Team Gamma", points: 22, played: 10, won: 7, drawn: 1, lost: 2 }
      ]
    },
    "2": {
      id: "2",
      name: "Championship League",
      description: "The main championship league",
      level: 2,
      maxTeams: 20,
      status: "active",
      teams: [
        { id: "7", name: "Championship A", isBot: false },
        { id: "8", name: "Championship B", isBot: false },
        { id: "9", name: "Championship C", isBot: true },
        { id: "10", name: "Championship D", isBot: true },
        { id: "11", name: "Championship E", isBot: true },
        { id: "12", name: "Championship F", isBot: true },
        { id: "13", name: "Championship G", isBot: true },
        { id: "14", name: "Championship H", isBot: true }
      ],
      seasons: [
        { id: "2", year: 2024, status: "active" }
      ],
      standings: [
        { position: 1, team: "Championship A", points: 28, played: 10, won: 8, drawn: 4, lost: 0 },
        { position: 2, team: "Championship B", points: 24, played: 10, won: 7, drawn: 3, lost: 1 },
        { position: 3, team: "Championship C", points: 21, played: 10, won: 6, drawn: 3, lost: 2 }
      ]
    },
    "3": {
      id: "3",
      name: "Premier League",
      description: "The premier division",
      level: 3,
      maxTeams: 12,
      status: "active",
      teams: [
        { id: "15", name: "Premier A", isBot: false },
        { id: "16", name: "Premier B", isBot: true },
        { id: "17", name: "Premier C", isBot: true },
        { id: "18", name: "Premier D", isBot: true },
        { id: "19", name: "Premier E", isBot: true },
        { id: "20", name: "Premier F", isBot: true }
      ],
      seasons: [
        { id: "3", year: 2024, status: "active" }
      ],
      standings: [
        { position: 1, team: "Premier A", points: 26, played: 10, won: 8, drawn: 2, lost: 0 },
        { position: 2, team: "Premier B", points: 22, played: 10, won: 7, drawn: 1, lost: 2 },
        { position: 3, team: "Premier C", points: 19, played: 10, won: 6, drawn: 1, lost: 3 }
      ]
    }
  };
  
  const league = leagueData[id] || {
    id: id,
    name: `League ${id}`,
    description: `Description for league ${id}`,
    level: 1,
    maxTeams: 16,
    status: "active",
    teams: [],
    seasons: [],
    standings: []
  };
  
  res.json(league);
});

app.get("/api/leagues/user/current", (req, res) => {
  console.log("🔍 LEAGUES/USER/CURRENT - Headers:", req.headers);
  console.log("🔍 LEAGUES/USER/CURRENT - Origin:", req.headers.origin);
  
  res.json({
    league: {
      id: "1",
      name: "Test League",
      description: "A test league for development",
      level: 1,
      maxTeams: 16,
      status: "active",
      teams: [
        { id: "1", name: "Team Alpha", isBot: false },
        { id: "2", name: "Team Beta", isBot: false },
        { id: "3", name: "Team Gamma", isBot: true },
        { id: "4", name: "Team Delta", isBot: true },
        { id: "5", name: "Team Echo", isBot: true },
        { id: "6", name: "Team Foxtrot", isBot: true }
      ],
      seasons: [
        { id: "1", year: 2024, status: "active" }
      ]
    },
    userTeam: {
      id: "1",
      name: "Team Alpha",
      isBot: false
    }
  });
});

// Store fired players in memory (in real app this would be in database)
let firedPlayers = new Set();

// Transfer list is now stored in Supabase database

// Team endpoints
app.get("/api/teams/my-team", async (req, res) => {
  console.log("🔍 TEAMS/MY-TEAM - Headers:", req.headers);
  console.log("🔍 TEAMS/MY-TEAM - Origin:", req.headers.origin);
  console.log("🔍 TEAMS/MY-TEAM - Fired players:", Array.from(firedPlayers));
  
  try {
    // Try to get team data from Supabase first
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .limit(1)
      .single();
    
    if (teamError) {
      console.log('Supabase team error:', teamError);
      throw new Error('Team data not available');
    }
    
    // Get players for this team
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamData.id);
    
    if (playersError) {
      console.log('Supabase players error:', playersError);
      throw new Error('Players data not available');
    }
    
    // Transform players data to match frontend expectations
    const players = (playersData || []).map(player => ({
      id: player.id.toString(),
      name: player.name || `Player ${player.id}`,
      position: player.position || 'MIDFIELDER',
      rating: player.rating || 70,
      age: player.age || 25,
      isStarter: player.is_starter || false,
      isCaptain: player.is_captain || false,
      formationPosition: player.formation_position || null,
      speed: player.speed || 70,
      shooting: player.shooting || 65,
      passing: player.passing || 75,
      defending: player.defending || 60,
      stamina: player.stamina || 80,
      reflexes: player.reflexes || 70
    }));
    
    // Filter out fired players
    const activePlayers = players.filter(player => !firedPlayers.has(player.id));
    
    res.json({
      id: teamData.id.toString(),
      name: teamData.name || 'Test Team',
      logo: teamData.logo || '/avatars/default.svg',
      budget: teamData.budget || 500000,
      leagueId: teamData.league_id || '1',
      overallRating: teamData.overall_rating || 80,
      formation: teamData.formation || '5-3-2',
      players: activePlayers
    });
    
  } catch (error) {
    console.log('Supabase data not available, using fallback:', error.message);
    
    // Fallback to mock data if Supabase fails
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
      budget: 500000,
      leagueId: "1",
      overallRating: 80,
      formation: "5-3-2",
      players: activePlayers
    });
  }
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

// Training matches endpoints
app.get("/api/training-matches", (req, res) => {
  console.log("🔍 TRAINING-MATCHES - Headers:", req.headers);
  console.log("🔍 TRAINING-MATCHES - Origin:", req.headers.origin);
  
  res.json([
    {
      id: "1",
      opponent: "Training Team A",
      date: new Date().toISOString(),
      status: "scheduled",
      type: "friendly"
    },
    {
      id: "2",
      opponent: "Training Team B", 
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      type: "friendly"
    }
  ]);
});

app.get("/api/training-matches/league-teams", (req, res) => {
  console.log("🔍 TRAINING-MATCHES/LEAGUE-TEAMS - Headers:", req.headers);
  console.log("🔍 TRAINING-MATCHES/LEAGUE-TEAMS - Origin:", req.headers.origin);
  
  res.json([
    { id: "1", name: "Team Alpha", rating: 85 },
    { id: "2", name: "Team Beta", rating: 82 },
    { id: "3", name: "Team Gamma", rating: 78 },
    { id: "4", name: "Team Delta", rating: 75 }
  ]);
});

app.post("/api/training-matches", (req, res) => {
  console.log("🔍 TRAINING-MATCHES (POST) - Headers:", req.headers);
  console.log("🔍 TRAINING-MATCHES (POST) - Body:", req.body);
  console.log("🔍 TRAINING-MATCHES (POST) - Origin:", req.headers.origin);
  
  const { opponent, date, type } = req.body;
  
  res.json({
    id: Date.now().toString(),
    opponent: opponent || "Training Team",
    date: date || new Date().toISOString(),
    status: "scheduled",
    type: type || "friendly"
  });
});

app.post("/api/training-matches/:id/simulate", (req, res) => {
  console.log("🔍 TRAINING-MATCHES/SIMULATE - Headers:", req.headers);
  console.log("🔍 TRAINING-MATCHES/SIMULATE - Match ID:", req.params.id);
  console.log("🔍 TRAINING-MATCHES/SIMULATE - Origin:", req.headers.origin);
  
  const { id } = req.params;
  
  // Simple simulation
  const playerGoals = Math.floor(Math.random() * 4);
  const opponentGoals = Math.floor(Math.random() * 4);
  
  res.json({
    id: id,
    playerScore: playerGoals,
    opponentScore: opponentGoals,
    result: playerGoals > opponentGoals ? "win" : playerGoals < opponentGoals ? "loss" : "draw",
    highlights: [
      { minute: 15, team: "player", player: "Flemming Jørgensen", description: "Skud på mål" },
      { minute: 45, team: "opponent", player: "Opponent Player", description: "Stor chance" },
      { minute: 67, team: "player", player: "Rasmus Poulsen", description: "Mål!" }
    ]
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
app.get("/api/transfers/available", async (req, res) => {
  console.log("🔍 TRANSFERS/AVAILABLE - Headers:", req.headers);
  console.log("🔍 TRANSFERS/AVAILABLE - Origin:", req.headers.origin);
  
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('status', 'available');
    
    if (error) {
      console.log('Supabase transfers error:', error);
      res.json([]);
      return;
    }
    
    // Transform data to include player information
    const transformedData = (data || []).map(transfer => ({
      id: transfer.id.toString(),
      playerId: transfer.player_id,
      askingPrice: transfer.asking_price,
      status: transfer.status,
      createdAt: transfer.created_at,
      player: {
        id: transfer.player_id,
        name: `Player ${transfer.player_id}`,
        age: 25,
        position: 'MIDFIELDER',
        speed: 70,
        shooting: 65,
        passing: 75,
        defending: 60,
        stamina: 80,
        reflexes: 70,
        rating: 70,
        isGenerated: true
      }
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.log('Transfer data not available:', error.message);
    res.json([]);
  }
});

// Frontend expects "/api/transfers/my-team" returning an array
app.get("/api/transfers/my-team", async (req, res) => {
  console.log("🔍 TRANSFERS/MY-TRANSFERS - Headers:", req.headers);
  
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .in('player_id', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']);
    
    if (error) {
      console.log('Supabase my-team transfers error:', error);
      res.json([]);
      return;
    }
    
    // Transform data to include player information
    const transformedData = (data || []).map(transfer => ({
      id: transfer.id.toString(),
      playerId: transfer.player_id,
      askingPrice: transfer.asking_price,
      status: transfer.status,
      createdAt: transfer.created_at,
      player: {
        id: transfer.player_id,
        name: `Player ${transfer.player_id}`,
        age: 25,
        position: 'MIDFIELDER',
        speed: 70,
        shooting: 65,
        passing: 75,
        defending: 60,
        stamina: 80,
        reflexes: 70,
        rating: 70,
        isGenerated: true
      }
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.log('My-team transfer data not available:', error.message);
    res.json([]);
  }
});

app.get("/api/transfers/free-transfer", async (req, res) => {
  console.log("🔍 TRANSFERS/FREE-TRANSFER - Headers:", req.headers);
  console.log("🔍 TRANSFERS/FREE-TRANSFER - Origin:", req.headers.origin);
  
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('status', 'free');
    
    if (error) {
      console.log('Supabase free transfers error:', error);
      res.json([]);
      return;
    }
    
    // Transform data to include player information
    const transformedData = (data || []).map(transfer => ({
      id: transfer.id.toString(),
      playerId: transfer.player_id,
      askingPrice: transfer.asking_price,
      status: transfer.status,
      createdAt: transfer.created_at,
      player: {
        id: transfer.player_id,
        name: `Player ${transfer.player_id}`,
        age: 25,
        position: 'MIDFIELDER',
        speed: 70,
        shooting: 65,
        passing: 75,
        defending: 60,
        stamina: 80,
        reflexes: 70,
        rating: 70,
        isGenerated: true
      }
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.log('Free transfer data not available:', error.message);
    res.json([]);
  }
});

// Get minimum price for a player
app.get("/api/transfers/minimum-price/:id", (req, res) => {
  console.log("🔍 TRANSFERS/MINIMUM-PRICE - Headers:", req.headers);
  console.log("🔍 TRANSFERS/MINIMUM-PRICE - Player ID:", req.params.id);
  console.log("🔍 TRANSFERS/MINIMUM-PRICE - Origin:", req.headers.origin);
  
  const playerId = req.params.id;
  
  // Calculate minimum price based on player rating and age
  // This is a simple calculation - in a real app this would be more complex
  const basePrice = 100000; // Base price
  const ratingMultiplier = 1.5; // Price increases with rating
  const agePenalty = 0.1; // Price decreases with age
  
  // Mock player data for calculation
  const playerRating = 75 + (parseInt(playerId) % 25); // 75-99 rating
  const playerAge = 20 + (parseInt(playerId) % 15); // 20-34 age
  
  const minimumPrice = Math.round(
    basePrice * 
    (1 + (playerRating - 50) * ratingMultiplier / 100) * 
    (1 - (playerAge - 20) * agePenalty / 100)
  );
  
  res.json({
    playerId: playerId,
    minimumPrice: minimumPrice,
    currency: "DKK",
    calculation: {
      basePrice: basePrice,
      playerRating: playerRating,
      playerAge: playerAge,
      ratingMultiplier: ratingMultiplier,
      agePenalty: agePenalty
    }
  });
});

// Get transfer list endpoint
app.get("/api/transfers", async (req, res) => {
  console.log("🔍 TRANSFERS/GET - Headers:", req.headers);
  console.log("🔍 TRANSFERS/GET - Origin:", req.headers.origin);
  
  try {
    // Get transfers from Supabase
    const { data: transfers, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("🔍 TRANSFERS/GET - Supabase error:", error);
      return res.status(500).json({ error: 'Failed to fetch transfers' });
    }
    
    // Find player details from team data
    const allPlayers = [
      // Starters (11 players)
      { id: "1", name: "Lars Andersen", age: 28, position: "GK", rating: 85, speed: 70, shooting: 45, passing: 60, defending: 90, stamina: 80, reflexes: 88, isCaptain: true, isStarter: true },
      { id: "2", name: "Erik Nielsen", age: 26, position: "DEF", rating: 82, speed: 75, shooting: 50, passing: 70, defending: 85, stamina: 85, reflexes: 60, isCaptain: false, isStarter: true },
      { id: "3", name: "Mikkel Hansen", age: 24, position: "DEF", rating: 78, speed: 80, shooting: 45, passing: 65, defending: 80, stamina: 90, reflexes: 55, isCaptain: false, isStarter: true },
      { id: "4", name: "Anders Larsen", age: 29, position: "DEF", rating: 80, speed: 70, shooting: 40, passing: 75, defending: 85, stamina: 80, reflexes: 60, isCaptain: false, isStarter: true },
      { id: "5", name: "Thomas Sørensen", age: 27, position: "DEF", rating: 76, speed: 75, shooting: 50, passing: 70, defending: 78, stamina: 85, reflexes: 55, isCaptain: false, isStarter: true },
      { id: "6", name: "Jesper Madsen", age: 25, position: "MID", rating: 84, speed: 80, shooting: 75, passing: 85, defending: 70, stamina: 90, reflexes: 60, isCaptain: false, isStarter: true },
      { id: "7", name: "Nikolaj Christensen", age: 23, position: "MID", rating: 82, speed: 85, shooting: 80, passing: 80, defending: 65, stamina: 85, reflexes: 55, isCaptain: false, isStarter: true },
      { id: "8", name: "Rasmus Poulsen", age: 26, position: "MID", rating: 79, speed: 75, shooting: 70, passing: 75, defending: 75, stamina: 80, reflexes: 60, isCaptain: false, isStarter: true },
      { id: "9", name: "Flemming Jørgensen", age: 30, position: "MID", rating: 81, speed: 70, shooting: 85, passing: 80, defending: 60, stamina: 75, reflexes: 55, isCaptain: false, isStarter: true },
      { id: "10", name: "Henrik Møller", age: 22, position: "FWD", rating: 83, speed: 90, shooting: 85, passing: 70, defending: 50, stamina: 80, reflexes: 60, isCaptain: false, isStarter: true },
      { id: "11", name: "Ole Mortensen", age: 24, position: "FWD", rating: 80, speed: 85, shooting: 80, passing: 65, defending: 45, stamina: 85, reflexes: 55, isCaptain: false, isStarter: true },
      // Substitutes (5 players)
      { id: "12", name: "Peter Jensen", age: 31, position: "GK", rating: 75, speed: 65, shooting: 40, passing: 55, defending: 80, stamina: 70, reflexes: 82, isCaptain: false, isStarter: false },
      { id: "13", name: "Michael Andersen", age: 28, position: "DEF", rating: 72, speed: 70, shooting: 45, passing: 60, defending: 75, stamina: 75, reflexes: 55, isCaptain: false, isStarter: false },
      { id: "14", name: "Daniel Nielsen", age: 25, position: "MID", rating: 74, speed: 75, shooting: 65, passing: 70, defending: 65, stamina: 80, reflexes: 55, isCaptain: false, isStarter: false },
      { id: "15", name: "Simon Larsen", age: 23, position: "FWD", rating: 76, speed: 80, shooting: 75, passing: 60, defending: 40, stamina: 75, reflexes: 55, isCaptain: false, isStarter: false },
      { id: "16", name: "Christian Hansen", age: 27, position: "MID", rating: 73, speed: 70, shooting: 70, passing: 75, defending: 60, stamina: 75, reflexes: 55, isCaptain: false, isStarter: false }
    ];
    
    // Enrich with player details
    const enrichedTransfers = transfers.map(transfer => {
      const player = allPlayers.find(p => p.id === transfer.player_id);
      
      return {
        id: transfer.id,
        playerId: transfer.player_id,
        askingPrice: transfer.asking_price,
        status: transfer.status,
        createdAt: transfer.created_at,
        player: player || { id: transfer.player_id, name: "Unknown Player", age: 25, position: "UNK", rating: 50 }
      };
    });
    
    console.log("🔍 TRANSFERS/GET - Transfer list with player details:", enrichedTransfers);
    
    res.json({
      success: true,
      transfers: enrichedTransfers,
      count: enrichedTransfers.length
    });
  } catch (error) {
    console.error("🔍 TRANSFERS/GET - Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List player for transfer endpoint
app.post("/api/transfers/list/:id", async (req, res) => {
  console.log("🔍 TRANSFERS/LIST - Headers:", req.headers);
  console.log("🔍 TRANSFERS/LIST - Player ID:", req.params.id);
  console.log("🔍 TRANSFERS/LIST - Body:", req.body);
  console.log("🔍 TRANSFERS/LIST - Origin:", req.headers.origin);
  
  const playerId = req.params.id;
  const { askingPrice } = req.body;
  
  try {
    // Add player to transfer list in Supabase
    const { data, error } = await supabase
      .from('transfers')
      .insert([
        {
          player_id: playerId,
          asking_price: askingPrice || 1000000,
          status: 'available',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error("🔍 TRANSFERS/LIST - Supabase error:", error);
      return res.status(500).json({ error: 'Failed to list player for transfer' });
    }
    
    console.log("🔍 TRANSFERS/LIST - Player listed successfully:", data);
    
    res.json({
      success: true,
      message: `Player ${playerId} listed for transfer successfully`,
      playerId: playerId,
      askingPrice: askingPrice || 1000000,
      listedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("🔍 TRANSFERS/LIST - Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// Seed endpoint
app.post("/api/seed", (req, res) => {
  console.log("🔍 SEED - Headers:", req.headers);
  console.log("🔍 SEED - Body:", req.body);
  console.log("🔍 SEED - Origin:", req.headers.origin);
  
  res.json({
    success: true,
    message: "Database seeded successfully",
    data: {
      leagues: 3,
      teams: 12,
      players: 144
    }
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

module.exports = app;