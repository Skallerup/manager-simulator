import { Router } from "express";
import rateLimit from "express-rate-limit";
import { seedDatabaseHandler } from "./handlers";

const router = Router();

// Very restrictive rate limit for seeding (only allow once per hour)
const seedLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only 1 request per hour
  message: "Seeding is rate limited to once per hour",
});

// Seed database route
router.post("/", seedLimiter, seedDatabaseHandler);

export default router;
