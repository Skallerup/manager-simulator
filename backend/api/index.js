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
  res.json({ 
    user: null, 
    message: "Not authenticated - please login first" 
  });
});

app.post("/auth/refresh", (req, res) => {
  res.json({ 
    message: "Refresh token endpoint - not implemented yet" 
  });
});

app.post("/auth/login", (req, res) => {
  res.json({ 
    message: "Login endpoint - not implemented yet",
    body: req.body 
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Manager Simulator Backend API", version: "4.0" });
});

module.exports = app;