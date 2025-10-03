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

module.exports = app;
