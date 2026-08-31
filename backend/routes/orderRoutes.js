import express from "express";
import { placeOrder, myOrders, orderDetails } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { orderRules, handleValidation } from "../middleware/validators.js";

const router = express.Router();

router.post("/", protect, orderRules, handleValidation, placeOrder);
router.get("/my", protect, myOrders);
router.get("/:id", protect, orderDetails);

export default router;