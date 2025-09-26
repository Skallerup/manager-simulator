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
  res.json({ status: "ok" });
});

// Test endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Welcome to Manager Simulator Backend!" });
});

// Import and use routes
const authRoutes = require('../dist/auth/routes');
const leagueRoutes = require('../dist/leagues/routes');
const teamRoutes = require('../dist/teams/routes');
const matchRoutes = require('../dist/matches/routes');
const transferRoutes = require('../dist/transfers/routes');
const adminRoutes = require('../dist/admin/routes');
const stadiumRoutes = require('../dist/stadium/routes');
const trainingMatchRoutes = require('../dist/training-matches/routes');
const syncRoutes = require('../dist/sync/routes');
const seedRoutes = require('../dist/seed/routes');

app.use("/auth", authRoutes);
app.use("/api/leagues", leagueRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stadium", stadiumRoutes);
app.use("/api/training-matches", trainingMatchRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/seed", seedRoutes);

module.exports = app;
