import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createTeamHandler,
  getTeamsHandler,
  getTeamHandler,
  updateTeamHandler,
  deleteTeamHandler,
  getMyTeamHandler,
  setCaptainHandler,
} from "./handlers";

const router = Router();

const teamLimiter = rateLimit({ windowMs: 60_000, max: 30 });

// Team management routes
router.post("/", teamLimiter, createTeamHandler);
router.get("/", teamLimiter, getTeamsHandler);
router.get("/my-team", teamLimiter, getMyTeamHandler);
router.get("/:id", teamLimiter, getTeamHandler);
router.put("/:id", teamLimiter, updateTeamHandler);
router.delete("/:id", teamLimiter, deleteTeamHandler);
router.put("/:teamId/captain/:playerId", teamLimiter, setCaptainHandler);

export default router;


