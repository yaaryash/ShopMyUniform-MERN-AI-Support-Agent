import express from "express";
import { placeOrder, myOrders, orderDetails } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/my", protect, myOrders);
router.get("/:id", protect, orderDetails);

export default router;