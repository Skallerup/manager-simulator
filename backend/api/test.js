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
    id: '1',
    name: 'Test Team',
    logo: '/avatars/default.svg',
    budget: 500000,
    leagueId: '1',
    overallRating: 80,
    formation: '5-3-2',
    players: [
      {
        id: '1',
        name: 'Lars Andersen',
        position: 'GOALKEEPER',
        rating: 75,
        age: 25,
        isStarter: true,
        isCaptain: true,
        formationPosition: 'gk',
        speed: 60,
        shooting: 40,
        passing: 70,
        defending: 80,
        stamina: 85,
        reflexes: 90
      },
      {
        id: '2',
        name: 'Mikkel Hansen',
        position: 'DEFENDER',
        rating: 80,
        age: 27,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'cb1',
        speed: 70,
        shooting: 50,
        passing: 75,
        defending: 90,
        stamina: 80,
        reflexes: 60
      },
      {
        id: '3',
        name: 'Jesper Nielsen',
        position: 'DEFENDER',
        rating: 78,
        age: 24,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'cb2',
        speed: 72,
        shooting: 45,
        passing: 70,
        defending: 85,
        stamina: 82,
        reflexes: 65
      },
      {
        id: '4',
        name: 'Christian Larsen',
        position: 'DEFENDER',
        rating: 76,
        age: 26,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'lb',
        speed: 75,
        shooting: 55,
        passing: 80,
        defending: 82,
        stamina: 85,
        reflexes: 70
      },
      {
        id: '5',
        name: 'Thomas Møller',
        position: 'DEFENDER',
        rating: 74,
        age: 28,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'rb',
        speed: 73,
        shooting: 50,
        passing: 75,
        defending: 80,
        stamina: 83,
        reflexes: 68
      },
      {
        id: '6',
        name: 'Michael Sørensen',
        position: 'MIDFIELDER',
        rating: 85,
        age: 24,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'cm1',
        speed: 80,
        shooting: 70,
        passing: 90,
        defending: 75,
        stamina: 85,
        reflexes: 65
      },
      {
        id: '7',
        name: 'Henrik Madsen',
        position: 'MIDFIELDER',
        rating: 82,
        age: 25,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'cm2',
        speed: 78,
        shooting: 75,
        passing: 85,
        defending: 70,
        stamina: 88,
        reflexes: 62
      },
      {
        id: '8',
        name: 'Steen Christensen',
        position: 'MIDFIELDER',
        rating: 79,
        age: 26,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'cm3',
        speed: 76,
        shooting: 68,
        passing: 82,
        defending: 72,
        stamina: 86,
        reflexes: 67
      },
      {
        id: '9',
        name: 'Flemming Jørgensen',
        position: 'ATTACKER',
        rating: 90,
        age: 26,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'st1',
        speed: 90,
        shooting: 95,
        passing: 80,
        defending: 40,
        stamina: 85,
        reflexes: 70
      },
      {
        id: '10',
        name: 'Rasmus Poulsen',
        position: 'ATTACKER',
        rating: 87,
        age: 23,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'st2',
        speed: 88,
        shooting: 92,
        passing: 75,
        defending: 35,
        stamina: 87,
        reflexes: 72
      },
      {
        id: '11',
        name: 'Daniel Simonsen',
        position: 'ATTACKER',
        rating: 84,
        age: 24,
        isStarter: true,
        isCaptain: false,
        formationPosition: 'st3',
        speed: 85,
        shooting: 88,
        passing: 78,
        defending: 38,
        stamina: 84,
        reflexes: 68
      },
      {
        id: '12',
        name: 'Nikolaj Andersen',
        position: 'DEFENDER',
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
        id: '13',
        name: 'Mads Larsen',
        position: 'MIDFIELDER',
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
        id: '14',
        name: 'Simon Hansen',
        position: 'ATTACKER',
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
        id: '15',
        name: 'Claus Nielsen',
        position: 'GOALKEEPER',
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
        id: '16',
        name: 'Ole Møller',
        position: 'DEFENDER',
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

// Transfers endpoints - mock responses (both with and without /api prefix)
app.get('/transfers', (req, res) => {
  res.json([]);
});

app.get('/api/transfers', (req, res) => {
  res.json([]);
});

app.get('/api/transfers/available', (req, res) => {
  res.json([]);
});

app.get('/api/transfers/free-transfer', (req, res) => {
  res.json([]);
});

app.get('/transfers/free-transfer', (req, res) => {
  res.json([]);
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

// Additional missing endpoints
app.get('/api/transfers/my-team', (req, res) => {
  res.json([]);
});

app.get('/api/matches/bot', (req, res) => {
  res.json([]);
});

app.post('/api/matches/bot', (req, res) => {
  res.json({
    success: true,
    match: {
      id: 'match-1',
      userTeam: {
        id: '1',
        name: 'Test Team',
        rating: 80
      },
      botTeam: {
        id: 'bot-1',
        name: 'Bot United',
        rating: 75
      },
      status: 'in_progress',
      currentMinute: 0,
      userScore: 0,
      botScore: 0
    }
  });
});

app.get('/api/matches/bot/:id/simulate', (req, res) => {
  res.json({
    success: true,
    match: {
      id: req.params.id,
      status: 'completed',
      userScore: 2,
      botScore: 1,
      events: [
        { minute: 15, type: 'goal', team: 'user', player: 'Flemming Jørgensen' },
        { minute: 45, type: 'goal', team: 'bot', player: 'Bot Player' },
        { minute: 78, type: 'goal', team: 'user', player: 'Rasmus Poulsen' }
      ],
      highlights: [
        { minute: 15, type: 'goal', description: 'Flemming Jørgensen scores!' },
        { minute: 78, type: 'goal', description: 'Rasmus Poulsen scores the winner!' }
      ]
    }
  });
});

app.get('/api/matches/bot/:id/highlights', (req, res) => {
  res.json({
    success: true,
    highlights: [
      { minute: 15, type: 'goal', description: 'Flemming Jørgensen scores!' },
      { minute: 78, type: 'goal', description: 'Rasmus Poulsen scores the winner!' }
    ]
  });
});

app.get('/api/training-matches/league-teams', (req, res) => {
  res.json([]);
});

app.get('/api/training-matches', (req, res) => {
  res.json([]);
});

app.post('/api/training-matches', (req, res) => {
  res.json({
    success: true,
    match: {
      id: 'training-1',
      opponent: req.body.opponent || 'Training Team',
      status: 'scheduled'
    }
  });
});

app.post('/api/training-matches/:id/simulate', (req, res) => {
  res.json({
    success: true,
    match: {
      id: req.params.id,
      status: 'completed',
      userScore: 3,
      opponentScore: 1,
      events: [
        { minute: 20, type: 'goal', team: 'user', player: 'Flemming Jørgensen' },
        { minute: 35, type: 'goal', team: 'user', player: 'Rasmus Poulsen' },
        { minute: 60, type: 'goal', team: 'opponent', player: 'Opponent Player' },
        { minute: 85, type: 'goal', team: 'user', player: 'Daniel Simonsen' }
      ]
    }
  });
});

app.get('/api/stadium/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'Test Stadium',
    capacity: 25000,
    tier: 1,
    facilities: {
      trainingGround: 1,
      youthAcademy: 1,
      medicalCenter: 1,
      scoutingNetwork: 1
    }
  });
});

app.get('/api/stadium/:id/stats', (req, res) => {
  res.json({
    id: req.params.id,
    attendance: 22000,
    revenue: 150000,
    maintenance: 50000,
    upgrades: 0
  });
});

app.post('/api/stadium/:id/facilities', (req, res) => {
  res.json({
    success: true,
    message: 'Facility upgraded successfully'
  });
});

app.post('/api/stadium/:id/upgrades', (req, res) => {
  res.json({
    success: true,
    message: 'Stadium upgraded successfully'
  });
});

app.post('/api/stadium/:id/tier', (req, res) => {
  res.json({
    success: true,
    message: 'Stadium tier upgraded successfully'
  });
});

app.get('/api/teams/:id/starters', (req, res) => {
  res.json({
    success: true,
    message: 'Formation retrieved successfully'
  });
});

app.post('/api/teams/:id/starters', (req, res) => {
  res.json({
    success: true,
    message: 'Formation saved successfully'
  });
});

app.post('/api/teams/:id/captain/:playerId', (req, res) => {
  res.json({
    success: true,
    message: 'Captain changed successfully'
  });
});

app.get('/api/transfers/minimum-price/:id', (req, res) => {
  res.json({
    success: true,
    minimumPrice: 1000000
  });
});

app.post('/api/transfers/buy/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Player purchased successfully'
  });
});

app.get('/api/leagues/user/current', (req, res) => {
  res.json({
    id: '1',
    name: 'Test League',
    tier: 1,
    teams: [
      { id: '1', name: 'Test Team', points: 15, played: 5, won: 5, drawn: 0, lost: 0 },
      { id: '2', name: 'Team 2', points: 12, played: 5, won: 4, drawn: 0, lost: 1 },
      { id: '3', name: 'Team 3', points: 9, played: 5, won: 3, drawn: 0, lost: 2 }
    ]
  });
});

app.post('/api/seed', (req, res) => {
  res.json({
    success: true,
    message: 'Database seeded successfully'
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'test-user-1',
      email: 'skallerup+5@gmail.com',
      name: 'Test User'
    }
  });
});

app.put('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully'
  });
});

app.put('/api/auth/password', (req, res) => {
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Additional missing auth endpoints
app.patch('/auth/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully'
  });
});

app.patch('/auth/password', (req, res) => {
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Additional missing team endpoints
app.put('/api/teams/:id/starters', (req, res) => {
  res.json({
    success: true,
    message: 'Formation saved successfully'
  });
});

app.put('/api/teams/:id/captain/:playerId', (req, res) => {
  res.json({
    success: true,
    message: 'Captain changed successfully'
  });
});

// Additional missing transfer endpoints
app.post('/api/transfers/list/:id', (req, res) => {
  res.json({
    success: true,
    message: `Player ${req.params.id} listed for transfer successfully`
  });
});

app.post('/api/transfers/sign-free/:id', (req, res) => {
  res.json({
    success: true,
    message: `Player ${req.params.id} signed successfully`
  });
});

// Additional missing stadium endpoints
app.post('/api/stadium/:id/facilities', (req, res) => {
  res.json({
    success: true,
    message: 'Facility upgraded successfully'
  });
});

app.post('/api/stadium/:id/upgrades', (req, res) => {
  res.json({
    success: true,
    message: 'Stadium upgraded successfully'
  });
});

app.put('/api/stadium/:id/tier', (req, res) => {
  res.json({
    success: true,
    message: 'Stadium tier upgraded successfully'
  });
});

// Additional missing match endpoints
app.post('/api/matches/bot/:id/simulate', (req, res) => {
  res.json({
    success: true,
    match: {
      id: req.params.id,
      status: 'completed',
      userScore: 2,
      botScore: 1,
      events: [
        { minute: 15, type: 'goal', team: 'user', player: 'Flemming Jørgensen' },
        { minute: 45, type: 'goal', team: 'bot', player: 'Bot Player' },
        { minute: 78, type: 'goal', team: 'user', player: 'Rasmus Poulsen' }
      ],
      highlights: [
        { minute: 15, type: 'goal', description: 'Flemming Jørgensen scores!' },
        { minute: 78, type: 'goal', description: 'Rasmus Poulsen scores the winner!' }
      ]
    }
  });
});

// Additional missing training endpoints
app.post('/api/training-matches/:id/simulate', (req, res) => {
  res.json({
    success: true,
    match: {
      id: req.params.id,
      status: 'completed',
      userScore: 3,
      opponentScore: 1,
      events: [
        { minute: 20, type: 'goal', team: 'user', player: 'Flemming Jørgensen' },
        { minute: 35, type: 'goal', team: 'user', player: 'Rasmus Poulsen' },
        { minute: 60, type: 'goal', team: 'opponent', player: 'Opponent Player' },
        { minute: 85, type: 'goal', team: 'user', player: 'Daniel Simonsen' }
      ]
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
