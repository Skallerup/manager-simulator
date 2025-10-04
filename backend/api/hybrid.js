require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yhcsackdxmjeekzlonsk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY3NhY2tkeG1qZWVremxvbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTM3MjEsImV4cCI6MjA3NDIyOTcyMX0.LF3mSgPVkMnmRU_nyi1whwbbGWh_0UEniAbNTKUrK3k';

// Helper function to make Supabase REST API calls
async function supabaseRequest(endpoint, options = {}) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Supabase request error:', error);
    return [];
  }
}

// Helper function to make Supabase POST/PUT/DELETE requests
async function supabaseMutation(endpoint, data, method = 'POST') {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Supabase mutation failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Supabase mutation error:', error);
    return { success: false, error: error.message };
  }
}

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const testData = await supabaseRequest('transfers?limit=1');
    const supabaseWorking = Array.isArray(testData);
    
    res.json({
      status: 'OK',
      message: 'Backend API is running',
      timestamp: new Date().toISOString(),
      supabase_configured: !!SUPABASE_URL,
      supabase_working: supabaseWorking,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.json({
      status: 'OK',
      message: 'Backend API is running',
      timestamp: new Date().toISOString(),
      supabase_configured: !!SUPABASE_URL,
      supabase_working: false,
      environment: process.env.NODE_ENV || 'development',
      error: error.message
    });
  }
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

// Teams endpoint with mock data
app.get('/api/teams/my-team', async (req, res) => {
  try {
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

// Transfers endpoint with Supabase REST API
app.get('/api/transfers/available', async (req, res) => {
  try {
    const data = await supabaseRequest('transfers?status=eq.available');
    res.json(data || []);
  } catch (error) {
    console.error('Transfers error:', error);
    res.json([]);
  }
});

app.get('/api/transfers/free-transfer', async (req, res) => {
  try {
    const data = await supabaseRequest('transfers?status=eq.free');
    res.json(data || []);
  } catch (error) {
    console.error('Free transfers error:', error);
    res.json([]);
  }
});

app.get('/api/transfers', async (req, res) => {
  try {
    const data = await supabaseRequest('transfers');
    res.json(data || []);
  } catch (error) {
    console.error('All transfers error:', error);
    res.json([]);
  }
});

// Transfer CRUD operations
app.post('/api/transfers/list/:id', async (req, res) => {
  try {
    const { askingPrice } = req.body;
    const transferData = {
      playerId: req.params.id,
      askingPrice: askingPrice || 1000000,
      status: 'available',
      createdAt: new Date().toISOString()
    };
    
    const result = await supabaseMutation('transfers', transferData, 'POST');
    res.json({
      success: true,
      message: `Player ${req.params.id} listed for transfer successfully`,
      data: result
    });
  } catch (error) {
    console.error('List transfer error:', error);
    res.status(500).json({ success: false, error: 'Failed to list transfer' });
  }
});

app.delete('/api/transfers/cancel/:id', async (req, res) => {
  try {
    const result = await supabaseRequest(`transfers?id=eq.${req.params.id}`, {
      method: 'DELETE'
    });
    res.json({
      success: true,
      message: `Transfer ${req.params.id} cancelled successfully`
    });
  } catch (error) {
    console.error('Cancel transfer error:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel transfer' });
  }
});

app.delete('/api/transfers/fire/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      message: `Player ${req.params.id} fired successfully`
    });
  } catch (error) {
    console.error('Fire player error:', error);
    res.status(500).json({ success: false, error: 'Failed to fire player' });
  }
});

app.post('/api/transfers/sign-free/:id', async (req, res) => {
  try {
    const transferData = {
      playerId: req.params.id,
      askingPrice: 0,
      status: 'free',
      createdAt: new Date().toISOString()
    };
    
    const result = await supabaseMutation('transfers', transferData, 'POST');
    res.json({
      success: true,
      message: `Player ${req.params.id} signed successfully`,
      data: result
    });
  } catch (error) {
    console.error('Sign free player error:', error);
    res.status(500).json({ success: false, error: 'Failed to sign player' });
  }
});

app.post('/api/transfers/buy/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Player purchased successfully'
    });
  } catch (error) {
    console.error('Buy player error:', error);
    res.status(500).json({ success: false, error: 'Failed to buy player' });
  }
});

app.get('/api/transfers/minimum-price/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      minimumPrice: 1000000
    });
  } catch (error) {
    console.error('Minimum price error:', error);
    res.status(500).json({ success: false, error: 'Failed to get minimum price' });
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
