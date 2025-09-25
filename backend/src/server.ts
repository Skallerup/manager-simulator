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
      "https://manager-simulator-frontend.vercel.app",
      "https://manager-simulator-frontend-oghwy3jfu.vercel.app",
      "https://manager-simulator-frontend-cwp5fptyf.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
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

// Initialize WebSocket
initializeSocket(server);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on http://localhost:${PORT}`);
});
