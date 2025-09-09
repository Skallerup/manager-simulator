import { Router } from "express";
import {
  syncDanishSuperligaData,
  getSyncStatus,
  cleanupOldData,
} from "./handlers";

const router = Router();

/**
 * POST /sync/danish-superliga
 * Sync alle spillere og klubber fra dansk superliga
 */
router.post("/danish-superliga", syncDanishSuperligaData);

/**
 * GET /sync/status
 * Hent status over synced data
 */
router.get("/status", getSyncStatus);

/**
 * DELETE /sync/cleanup
 * Ryd op i gamle data
 */
router.delete("/cleanup", cleanupOldData);

export { router as syncRoutes };
