import { createOrder, getOrdersByUser, getOrderById } from "../services/orderService.js";

// POST /api/orders
export const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    // req.user comes from the `protect` middleware — this is what scopes
    // the order to whoever is actually logged in, not whatever the client claims
    const order = await createOrder({ userId: req.user._id, items, shippingAddress, paymentMethod });
    res.status(201).json(order);
  } catch (err) {
    // 400, not 500 — these are expected failures (bad stock, bad product id),
    // not server bugs
    res.status(400).json({ message: err.message });
  }
};

// GET /api/orders/my
export const myOrders = async (req, res) => {
  try {
    const orders = await getOrdersByUser(req.user._id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
export const orderDetails = async (req, res) => {
  try {
    const order = await getOrderById(req.params.id, req.user._id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};