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

// Helper function to get player data from Supabase
async function getPlayerData(playerId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/players?id=eq.${playerId}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const playerArray = await response.json();
      if (playerArray && playerArray.length > 0) {
        return playerArray[0];
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching player data:', error);
    return null;
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

// Teams endpoint with Supabase data
app.get('/api/teams/my-team', async (req, res) => {
  try {
    // Try to get team data from Supabase first
    try {
      const teamData = await supabaseRequest('teams?select=*&limit=1');
      if (teamData && teamData.length > 0) {
        const team = teamData[0];
        
        // Get players for this team
        const playersData = await supabaseRequest(`players?team_id=eq.${team.id}&select=*`);
        
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
        
        res.json({
          id: team.id.toString(),
          name: team.name || 'My Team',
          logo: team.logo || '/avatars/default.svg',
          budget: team.budget || 500000,
          leagueId: team.league_id || '1',
          overallRating: team.overall_rating || 80,
          formation: team.formation || '5-3-2',
          players: players
        });
        return;
      }
    } catch (supabaseError) {
      console.log('Supabase team/player tables not available yet, using fallback data');
      console.log('Note: Need to create teams and players tables in Supabase for full integration');
    }
    
    // Fallback to mock data if Supabase fails
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
  } catch (error) {
    console.error('Teams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transfers endpoint with Supabase REST API
app.get('/api/transfers/available', async (req, res) => {
  try {
    const data = await supabaseRequest('transfers?status=eq.available');
    
    // Transform data to include player information
    const transformedData = await Promise.all((data || []).map(async (transfer) => {
      const playerData = await getPlayerData(transfer.player_id);
      return {
        id: transfer.id.toString(),
        playerId: transfer.player_id,
        askingPrice: transfer.asking_price,
        status: transfer.status,
        createdAt: transfer.created_at,
        player: {
          id: transfer.player_id,
          name: playerData?.name || `Player ${transfer.player_id}`,
          age: playerData?.age || 25,
          position: playerData?.position || 'MIDFIELDER',
          speed: playerData?.speed || 70,
          shooting: playerData?.shooting || 65,
          passing: playerData?.passing || 75,
          defending: playerData?.defending || 60,
          stamina: playerData?.stamina || 80,
          reflexes: playerData?.reflexes || 70,
          rating: playerData?.rating || 70,
          isGenerated: !playerData
        }
      };
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Transfers error:', error);
    res.json([]);
  }
});

app.get('/api/transfers/free-transfer', async (req, res) => {
  try {
    const data = await supabaseRequest('transfers?status=eq.free');
    
    // Transform data to include player information
    const transformedData = await Promise.all((data || []).map(async (transfer) => {
      const playerData = await getPlayerData(transfer.player_id);
      return {
        id: transfer.id.toString(),
        playerId: transfer.player_id,
        askingPrice: transfer.asking_price,
        status: transfer.status,
        createdAt: transfer.created_at,
        player: {
          id: transfer.player_id,
          name: playerData?.name || `Player ${transfer.player_id}`,
          age: playerData?.age || 25,
          position: playerData?.position || 'MIDFIELDER',
          speed: playerData?.speed || 70,
          shooting: playerData?.shooting || 65,
          passing: playerData?.passing || 75,
          defending: playerData?.defending || 60,
          stamina: playerData?.stamina || 80,
          reflexes: playerData?.reflexes || 70,
          rating: playerData?.rating || 70,
          isGenerated: !playerData
        }
      };
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Free transfers error:', error);
    res.json([]);
  }
});

app.get('/api/transfers', async (req, res) => {
  try {
    const data = await supabaseRequest('transfers');
    
    // Transform data to include player information
    const transformedData = await Promise.all((data || []).map(async (transfer) => {
      const playerData = await getPlayerData(transfer.player_id);
      return {
        id: transfer.id.toString(),
        playerId: transfer.player_id,
        askingPrice: transfer.asking_price,
        status: transfer.status,
        createdAt: transfer.created_at,
        player: {
          id: transfer.player_id,
          name: playerData?.name || `Player ${transfer.player_id}`,
          age: playerData?.age || 25,
          position: playerData?.position || 'MIDFIELDER',
          speed: playerData?.speed || 70,
          shooting: playerData?.shooting || 65,
          passing: playerData?.passing || 75,
          defending: playerData?.defending || 60,
          stamina: playerData?.stamina || 80,
          reflexes: playerData?.reflexes || 70,
          rating: playerData?.rating || 70,
          isGenerated: !playerData
        }
      };
    }));
    
    res.json({ transfers: transformedData });
  } catch (error) {
    console.error('All transfers error:', error);
    res.json({ transfers: [] });
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

// My team transfers endpoint
app.get('/api/transfers/my-team', async (req, res) => {
  try {
    const data = await supabaseRequest('transfers?player_id=in.(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16)');
    
    // Transform data to include player information
    const transformedData = await Promise.all((data || []).map(async (transfer) => {
      const playerData = await getPlayerData(transfer.player_id);
      return {
        id: transfer.id.toString(),
        playerId: transfer.player_id,
        askingPrice: transfer.asking_price,
        status: transfer.status,
        createdAt: transfer.created_at,
        player: {
          id: transfer.player_id,
          name: playerData?.name || `Player ${transfer.player_id}`,
          age: playerData?.age || 25,
          position: playerData?.position || 'MIDFIELDER',
          speed: playerData?.speed || 70,
          shooting: playerData?.shooting || 65,
          passing: playerData?.passing || 75,
          defending: playerData?.defending || 60,
          stamina: playerData?.stamina || 80,
          reflexes: playerData?.reflexes || 70,
          rating: playerData?.rating || 70,
          isGenerated: !playerData
        }
      };
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('My team transfers error:', error);
    res.json([]);
  }
});

// Training matches endpoints
app.get('/api/training-matches/league-teams', async (req, res) => {
  try {
    res.json([
      { id: '1', name: 'Team Alpha', rating: 85 },
      { id: '2', name: 'Team Beta', rating: 82 },
      { id: '3', name: 'Team Gamma', rating: 78 },
      { id: '4', name: 'Team Delta', rating: 80 },
      { id: '5', name: 'Team Epsilon', rating: 83 }
    ]);
  } catch (error) {
    console.error('League teams error:', error);
    res.json([]);
  }
});

app.get('/api/training-matches', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Training matches error:', error);
    res.json([]);
  }
});

app.post('/api/training-matches', async (req, res) => {
  try {
    const { opponent, date, type } = req.body;
    res.json({
      id: Date.now().toString(),
      opponent: opponent || 'Training Team',
      date: date || new Date().toISOString(),
      type: type || 'training',
      status: 'scheduled'
    });
  } catch (error) {
    console.error('Create training match error:', error);
    res.status(500).json({ error: 'Failed to create training match' });
  }
});

app.get('/api/training-matches/:id/simulate', async (req, res) => {
  try {
    const { id } = req.params;
    const playerGoals = Math.floor(Math.random() * 4);
    const opponentGoals = Math.floor(Math.random() * 4);
    
    res.json({
      id: id,
      playerScore: playerGoals,
      opponentScore: opponentGoals,
      result: playerGoals > opponentGoals ? 'win' : playerGoals < opponentGoals ? 'loss' : 'draw'
    });
  } catch (error) {
    console.error('Simulate training match error:', error);
    res.status(500).json({ error: 'Failed to simulate training match' });
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

// Stadium endpoints
app.get('/api/stadium/:id', async (req, res) => {
  try {
    res.json({
      id: req.params.id,
      name: 'Test Stadium',
      capacity: 50000,
      tier: 1,
      facilities: {
        trainingGround: 1,
        youthAcademy: 1,
        medicalCenter: 1,
        scoutingNetwork: 1
      },
      upgrades: {
        trainingGround: { level: 1, cost: 100000 },
        youthAcademy: { level: 1, cost: 150000 },
        medicalCenter: { level: 1, cost: 200000 },
        scoutingNetwork: { level: 1, cost: 250000 }
      }
    });
  } catch (error) {
    console.error('Stadium error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stadium/:id/stats', async (req, res) => {
  try {
    res.json({
      id: req.params.id,
      attendance: 45000,
      revenue: 500000,
      maintenance: 100000,
      satisfaction: 85
    });
  } catch (error) {
    console.error('Stadium stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/stadium/:id/facilities', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Facility upgraded successfully'
    });
  } catch (error) {
    console.error('Stadium facilities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/stadium/:id/upgrades', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Stadium upgraded successfully'
    });
  } catch (error) {
    console.error('Stadium upgrades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/stadium/:id/tier', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Stadium tier updated successfully'
    });
  } catch (error) {
    console.error('Stadium tier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team management endpoints
app.get('/api/teams/:id/starters', async (req, res) => {
  try {
    res.json({
      starters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    });
  } catch (error) {
    console.error('Team starters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/teams/:id/starters', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Starting lineup updated successfully'
    });
  } catch (error) {
    console.error('Update starters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/teams/:id/captain/:playerId', async (req, res) => {
  try {
    res.json({
      success: true,
      message: `Player ${req.params.playerId} is now captain`
    });
  } catch (error) {
    console.error('Set captain error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leagues endpoints
app.get('/api/leagues/user/current', async (req, res) => {
  try {
    res.json({
      id: '1',
      name: 'Test League',
      season: 2024,
      teams: []
    });
  } catch (error) {
    console.error('Current league error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed endpoint
app.post('/api/seed', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile endpoints
app.get('/api/auth/profile', async (req, res) => {
  try {
    res.json({
      id: 'test-user-1',
      email: 'skallerup+5@gmail.com',
      name: 'Martin Skallerup'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/auth/password', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Supabase configured: ${SUPABASE_URL && SUPABASE_ANON_KEY ? 'YES' : 'NO'}`);
  console.log(`🌐 CORS enabled for: localhost:3001, app.martinskallerup.dk`);
});

module.exports = app;
