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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
  
  // Return authenticated user
  res.json({ 
    user: {
      id: "1",
      email: "skallerup+5@gmail.com",
      name: "skallerup+5",
      createdAt: new Date().toISOString()
    }, 
    message: "User authenticated successfully",
    debug: {
      headers: req.headers,
      cookies: req.cookies,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    }
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
    // Set access token cookie
    res.cookie('access_token', 'fake-access-token-' + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      user: {
        id: "1",
        email: email,
        name: email.split('@')[0], // Use email prefix as name
        createdAt: new Date().toISOString()
      },
      message: "Login successful",
      debug: {
        headers: req.headers,
        body: req.body,
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
      }
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

// Team endpoints
app.get("/api/teams/my-team", (req, res) => {
  console.log("🔍 TEAMS/MY-TEAM - Headers:", req.headers);
  console.log("🔍 TEAMS/MY-TEAM - Origin:", req.headers.origin);
  
  res.json({
    id: "1",
    name: "Test Team",
    logo: "/avatars/default.svg",
    budget: 1000000,
    leagueId: "1",
    overallRating: 80,
    formation: "5-3-2",
    players: [
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
    ]
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

// Matches endpoints
app.get("/api/matches/bot", (req, res) => {
  res.json({
    matches: []
  });
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
  
  res.json({
    transfers: [
      {
        id: "1",
        player: {
          id: "1",
          name: "Available Player 1",
          position: "MID",
          rating: 80,
          age: 25
        },
        askingPrice: 5000000,
        seller: "Test Club"
      },
      {
        id: "2", 
        player: {
          id: "2",
          name: "Available Player 2",
          position: "FWD",
          rating: 85,
          age: 23
        },
        askingPrice: 8000000,
        seller: "Another Club"
      }
    ]
  });
});

app.get("/api/transfers/my-transfers", (req, res) => {
  console.log("🔍 TRANSFERS/MY-TRANSFERS - Headers:", req.headers);
  
  res.json({
    transfers: []
  });
});

app.get("/api/transfers/free-transfer", (req, res) => {
  console.log("🔍 TRANSFERS/FREE-TRANSFER - Headers:", req.headers);
  console.log("🔍 TRANSFERS/FREE-TRANSFER - Origin:", req.headers.origin);
  
  res.json({
    transfers: [
      {
        id: "free1",
        player: {
          id: "free1",
          name: "Erik Hansen",
          position: "MIDFIELDER",
          rating: 75,
          age: 22
        },
        askingPrice: 0,
        seller: "Free Agent"
      },
      {
        id: "free2", 
        player: {
          id: "free2",
          name: "Peter Nielsen",
          position: "DEFENDER",
          rating: 72,
          age: 24
        },
        askingPrice: 0,
        seller: "Free Agent"
      },
      {
        id: "free3",
        player: {
          id: "free3",
          name: "Anders Larsen",
          position: "ATTACKER",
          rating: 78,
          age: 21
        },
        askingPrice: 0,
        seller: "Free Agent"
      }
    ]
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