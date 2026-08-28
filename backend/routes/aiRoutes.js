import express from "express";
import { chat } from "../controllers/aiController.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

router.post("/chat", optionalAuth, chat);

export default router;
