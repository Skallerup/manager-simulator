import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { config } from "./config";
import authRoutes from "./auth/routes";
import leagueRoutes from "./leagues/routes";
import teamRoutes from "./teams/routes";
import matchRoutes from "./matches/routes";
import transferRoutes from "./transfers/routes";
import adminRoutes from "./admin/routes";
import stadiumRoutes from "./stadium/routes";
import trainingMatchRoutes from "./training-matches/routes";
import { syncRoutes } from "./sync/routes";
import seedRoutes from "./seed/routes";
import { initializeSocket } from "./websocket/socket";

const app = express();
const server = createServer(app);
const PORT = config.port;

app.use(
  cors({
    origin: [
      config.frontendOrigin,
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

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Manager Simulator Backend!" });
});

app.get("/api/test", (_req: Request, res: Response) => {
  console.log("=== TEST ENDPOINT HIT ===");
  res.json({ message: "Test endpoint working", timestamp: new Date().toISOString() });
});

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

// Initialize WebSocket (only in development)
if (process.env.NODE_ENV !== 'production') {
  initializeSocket(server);
}

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
  // Export for Vercel
  module.exports = app;
} else {
  // For local development
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}
