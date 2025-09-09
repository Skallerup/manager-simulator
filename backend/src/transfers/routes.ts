import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getAvailableTransfersHandler,
  getTeamTransfersHandler,
  listPlayerForTransferHandler,
  buyPlayerHandler,
  cancelTransferHandler,
  firePlayerHandler,
  getFreeTransferPlayersHandler,
  signFreeTransferPlayerHandler,
  generateFreeAgentsHandler,
  getPlayerMinimumPriceHandler,
} from "./handlers";

const router = Router();

// Rate limiting
const transferLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many transfer requests, please try again later.",
});

// Apply rate limiting to all routes
router.use(transferLimiter);

// Get all available transfers
router.get("/available", getAvailableTransfersHandler);

// Get team's transfers
router.get("/my-team", getTeamTransfersHandler);

// Get minimum price for a player
router.get("/minimum-price/:playerId", getPlayerMinimumPriceHandler);

// List a player for transfer
router.post("/list/:playerId", listPlayerForTransferHandler);

// Buy a player
router.post("/buy/:transferId", buyPlayerHandler);

// Cancel a transfer
router.delete("/cancel/:transferId", cancelTransferHandler);

// Fire a player (remove from team and make available for free transfer)
router.delete("/fire/:playerId", firePlayerHandler);

// Get free transfer players (fired players available for free)
router.get("/free-transfer", getFreeTransferPlayersHandler);

// Sign a free transfer player (no cost)
router.post("/sign-free/:playerId", signFreeTransferPlayerHandler);

// Generate free agents (admin function)
router.post("/generate-free-agents", generateFreeAgentsHandler);

export default router;
