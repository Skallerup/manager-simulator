import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
  updateProfileHandler,
  updatePasswordHandler,
} from "./handlers";

const router = Router();

const authLimiter = rateLimit({ windowMs: 60_000, max: 20 });

router.post("/register", authLimiter, registerHandler);
router.post("/login", authLimiter, loginHandler);
router.post("/refresh", authLimiter, refreshHandler);
router.post("/logout", authLimiter, logoutHandler);
router.get("/me", meHandler);
router.patch("/profile", authLimiter, updateProfileHandler);
router.patch("/password", authLimiter, updatePasswordHandler);

export default router;
