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
  updateFormationHandler,
  updateStartersHandler,
  swapPlayersHandler,
} from "./handlers";

const router = Router();

const teamLimiter = rateLimit({ windowMs: 60_000, max: 100 });
const teamUpdateLimiter = rateLimit({ windowMs: 60_000, max: 200 });

// Team management routes
router.post("/", teamLimiter, createTeamHandler);
router.get("/", teamLimiter, getTeamsHandler);
router.get("/my-team", teamLimiter, getMyTeamHandler);
router.get("/:id", teamLimiter, getTeamHandler);
router.put("/:id", teamUpdateLimiter, updateTeamHandler);
router.delete("/:id", teamLimiter, deleteTeamHandler);
router.put("/:teamId/captain/:playerId", teamUpdateLimiter, setCaptainHandler);
router.put("/:teamId/formation", teamUpdateLimiter, updateFormationHandler);
router.put("/:teamId/starters", teamUpdateLimiter, updateStartersHandler);
router.put("/:teamId/swap-players", teamUpdateLimiter, swapPlayersHandler);

export default router;


