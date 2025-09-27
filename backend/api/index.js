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