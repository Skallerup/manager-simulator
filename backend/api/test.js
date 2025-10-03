const express = require('express');
const cors = require('cors');

const app = express();

// Simple CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://martinskallerup.dk',
    'https://www.martinskallerup.dk',
    'https://app.martinskallerup.dk'
  ],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    origin: req.headers.origin
  });
});

// Auth endpoints - mock responses
app.get('/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'test-user-1',
      email: 'skallerup+5@gmail.com',
      name: 'Test User',
      isAuthenticated: true
    }
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock login - accept any credentials
  if (email && password) {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'test-user-1',
        email: email,
        name: 'Test User',
        isAuthenticated: true
      },
      token: 'mock-token-' + Date.now()
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
});

app.post('/auth/refresh', (req, res) => {
  res.json({
    success: true,
    token: 'mock-refresh-token-' + Date.now(),
    user: {
      id: 'test-user-1',
      email: 'skallerup+5@gmail.com',
      name: 'Test User',
      isAuthenticated: true
    }
  });
});

// Teams endpoints - mock responses
app.get('/teams/my-team', (req, res) => {
  res.json({
    success: true,
    team: {
      id: 'test-team-1',
      name: 'Test Team',
      players: [
        {
          id: '1',
          name: 'Test Player 1',
          position: 'GK',
          rating: 75,
          age: 25
        },
        {
          id: '2',
          name: 'Test Player 2',
          position: 'DEF',
          rating: 80,
          age: 28
        }
      ]
    }
  });
});

// Transfers endpoints - mock responses
app.get('/transfers', (req, res) => {
  res.json({
    success: true,
    transfers: [],
    count: 0
  });
});

app.post('/transfers/list/:id', (req, res) => {
  res.json({
    success: true,
    message: `Player ${req.params.id} listed for transfer successfully`,
    playerId: req.params.id,
    askingPrice: req.body.askingPrice || 1000000
  });
});

// Leagues endpoints - mock responses
app.get('/leagues', (req, res) => {
  res.json({
    success: true,
    leagues: [
      {
        id: 'test-league-1',
        name: 'Test League',
        teams: []
      }
    ]
  });
});

app.get('/leagues/user/current', (req, res) => {
  res.json({
    success: true,
    league: {
      id: 'test-league-1',
      name: 'Test League',
      teams: []
    }
  });
});

// Catch all for other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = app;
