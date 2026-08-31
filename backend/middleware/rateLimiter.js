import rateLimit from "express-rate-limit";

export const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute per IP
  message: { message: "Too many requests to the support assistant. Please wait a moment and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});