import express from "express";
import { chat } from "../controllers/aiController.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { aiChatLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/chat", aiChatLimiter, optionalAuth, chat);

export default router;