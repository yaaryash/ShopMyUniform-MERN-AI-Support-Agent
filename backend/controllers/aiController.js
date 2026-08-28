import { runAgent } from "../services/aiService.js";

// POST /api/ai/chat
// body: { message: string, history: [{role, content}] }
export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: "message is required" });

    // req.user is set by optionalAuth — null for guests, a real user object if logged in
    const userId = req.user ? req.user._id.toString() : null;
    const result = await runAgent(message, history || [], userId);

    res.json(result);
  } catch (err) {
    console.error("AI agent error:", err);
    res.status(500).json({ message: "AI agent failed to respond", error: err.message });
  }
};