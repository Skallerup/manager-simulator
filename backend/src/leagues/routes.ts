import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createLeagueHandler,
  getLeaguesHandler,
  browseLeaguesHandler,
  getLeagueHandler,
  updateLeagueHandler,
  deleteLeagueHandler,
  joinLeagueHandler,
  leaveLeagueHandler,
} from "./handlers";

const router = Router();

const leagueLimiter = rateLimit({ windowMs: 60_000, max: 30 });

// League management routes
router.post("/", leagueLimiter, createLeagueHandler);
router.get("/", leagueLimiter, getLeaguesHandler);
router.get("/browse", leagueLimiter, browseLeaguesHandler);
router.get("/:id", leagueLimiter, getLeagueHandler);
router.put("/:id", leagueLimiter, updateLeagueHandler);
router.delete("/:id", leagueLimiter, deleteLeagueHandler);

// League membership routes
router.post("/:id/join", leagueLimiter, joinLeagueHandler);
router.delete("/:id/leave", leagueLimiter, leaveLeagueHandler);

export default router;
