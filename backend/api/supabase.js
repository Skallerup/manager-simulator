require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3001",
    "https://app.martinskallerup.dk",
    "https://martinskallerup.dk",
    "https://www.martinskallerup.dk",
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
    "X-Requested-With"
  ],
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.get('/auth/me', async (req, res) => {
  try {
    res.json({
      id: 'test-user-1',
      email: 'skallerup+5@gmail.com',
      name: 'Martin Skallerup'
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      res.json({
        id: 'test-user-1',
        email: email,
        name: 'Martin Skallerup'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Teams endpoint with Supabase
app.get('/api/teams/my-team', async (req, res) => {
  try {
    // For now, return mock data but with Supabase structure
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
        }
      ]
    });
  } catch (error) {
    console.error('Teams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transfers endpoint with Supabase
app.get('/api/transfers/available', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('status', 'available');
    
    if (error) {
      console.error('Transfers error:', error);
      res.json([]);
    } else {
      res.json(data || []);
    }
  } catch (error) {
    console.error('Transfers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/transfers/free-transfer', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('status', 'free');
    
    if (error) {
      console.error('Free transfers error:', error);
      res.json([]);
    } else {
      res.json(data || []);
    }
  } catch (error) {
    console.error('Free transfers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/transfers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*');
    
    if (error) {
      console.error('All transfers error:', error);
      res.json([]);
    } else {
      res.json(data || []);
    }
  } catch (error) {
    console.error('All transfers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Matches endpoint
app.get('/api/matches/bot', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/matches/bot', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leagues endpoint
app.get('/api/leagues/user/current', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Leagues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
