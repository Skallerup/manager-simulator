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

// Auth endpoints - mock responses (both with and without /api prefix)
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

app.get('/api/auth/me', (req, res) => {
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

app.post('/api/auth/login', (req, res) => {
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

app.post('/api/auth/refresh', (req, res) => {
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

// Teams endpoints - mock responses (both with and without /api prefix)
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

app.get('/api/teams/my-team', (req, res) => {
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

// Transfers endpoints - mock responses (both with and without /api prefix)
app.get('/transfers', (req, res) => {
  res.json({
    success: true,
    transfers: [],
    count: 0
  });
});

app.get('/api/transfers', (req, res) => {
  res.json({
    success: true,
    transfers: [],
    count: 0
  });
});

app.get('/api/transfers/available', (req, res) => {
  res.json({
    success: true,
    transfers: [],
    count: 0
  });
});

app.get('/api/transfers/free-transfer', (req, res) => {
  res.json({
    success: true,
    transfers: [],
    count: 0
  });
});

app.get('/transfers/free-transfer', (req, res) => {
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

app.post('/api/transfers/list/:id', (req, res) => {
  res.json({
    success: true,
    message: `Player ${req.params.id} listed for transfer successfully`,
    playerId: req.params.id,
    askingPrice: req.body.askingPrice || 1000000
  });
});

// Additional transfer endpoints
app.delete('/api/transfers/cancel/:id', (req, res) => {
  res.json({
    success: true,
    message: `Transfer ${req.params.id} cancelled successfully`
  });
});

app.delete('/api/transfers/fire/:id', (req, res) => {
  res.json({
    success: true,
    message: `Player ${req.params.id} fired successfully`
  });
});

app.post('/api/transfers/sign-free/:id', (req, res) => {
  res.json({
    success: true,
    message: `Player ${req.params.id} signed successfully`
  });
});

app.post('/api/transfers/buy/:id', (req, res) => {
  res.json({
    success: true,
    message: `Player ${req.params.id} bought successfully`
  });
});

// Leagues endpoints - mock responses (both with and without /api prefix)
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

app.get('/api/leagues', (req, res) => {
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

app.get('/api/leagues/user/current', (req, res) => {
  res.json({
    success: true,
    league: {
      id: 'test-league-1',
      name: 'Test League',
      teams: []
    }
  });
});

// Teams endpoints
app.get('/api/teams', (req, res) => {
  res.json({
    success: true,
    teams: [
      {
        id: 'test-team-1',
        name: 'Test Team 1',
        leagueId: 'test-league-1'
      },
      {
        id: 'test-team-2',
        name: 'Test Team 2',
        leagueId: 'test-league-1'
      }
    ]
  });
});

app.get('/api/teams/:id', (req, res) => {
  res.json({
    success: true,
    team: {
      id: req.params.id,
      name: 'Test Team',
      leagueId: 'test-league-1',
      players: []
    }
  });
});

app.post('/api/teams', (req, res) => {
  res.json({
    success: true,
    team: {
      id: 'new-team-' + Date.now(),
      name: req.body.name || 'New Team',
      leagueId: req.body.leagueId || 'test-league-1'
    }
  });
});

app.put('/api/teams/:id', (req, res) => {
  res.json({
    success: true,
    team: {
      id: req.params.id,
      name: req.body.name || 'Updated Team',
      leagueId: req.body.leagueId || 'test-league-1'
    }
  });
});

app.delete('/api/teams/:id', (req, res) => {
  res.json({
    success: true,
    message: `Team ${req.params.id} deleted successfully`
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
