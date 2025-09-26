const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();

// CORS configuration
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
  res.json({ status: "ok", version: "4.0" });
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
  // Always return authenticated user for testing
  res.json({ 
    user: {
      id: "1",
      email: "skallerup+5@gmail.com",
      name: "skallerup+5",
      createdAt: new Date().toISOString()
    }, 
    message: "User authenticated successfully" 
  });
});

app.post("/auth/refresh", (req, res) => {
  res.json({ 
    message: "Refresh token endpoint - not implemented yet" 
  });
});

app.post("/auth/login", (req, res) => {
  // Simple login implementation for testing
  const { email, password } = req.body;
  
  // Accept any email/password for testing
  if (email && password) {
    res.json({ 
      user: {
        id: "1",
        email: email,
        name: email.split('@')[0], // Use email prefix as name
        createdAt: new Date().toISOString()
      },
      message: "Login successful"
    });
  } else {
    res.status(401).json({ 
      message: "Invalid credentials" 
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
  res.json({
    team: {
      id: "1",
      name: "Test Team",
      logo: "/avatars/default.svg",
      budget: 1000000,
      leagueId: "1"
    }
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
    matches: [
      {
        id: "1",
        opponent: "Bot Team 1",
        result: "W",
        score: "2-1",
        date: new Date().toISOString()
      }
    ]
  });
});

// Dashboard data endpoint
app.get("/api/dashboard", (req, res) => {
  res.json({
    stats: {
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      winRate: 0
    },
    recentActivity: [],
    upcomingEvents: [
      {
        id: "1",
        title: "Næste ligakamp",
        date: "Snart",
        type: "match"
      }
    ]
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Manager Simulator Backend API", version: "4.0" });
});

module.exports = app;