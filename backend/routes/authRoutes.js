import express from "express";
import { registerUser, loginUser, getProfile, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { registerRules, loginRules, handleValidation } from "../middleware/validators.js";

const router = express.Router();

router.post("/register", registerRules, handleValidation, registerUser);
router.post("/login", loginRules, handleValidation, loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;