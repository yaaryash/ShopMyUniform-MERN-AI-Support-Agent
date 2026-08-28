import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async ({ userId, items, shippingAddress, paymentMethod }) => {
  let totalAmount = 0;
  const finalItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    const sizeEntry = product.sizes.find((s) => s.size === item.size);
    if (!sizeEntry || sizeEntry.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name} (size ${item.size})`);
    }

    finalItems.push({
      product: product._id,
      name: product.name,
      size: item.size,
      quantity: item.quantity,
      price: product.price,
    });
    totalAmount += product.price * item.quantity;

    sizeEntry.stock -= item.quantity;
    await product.save();
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const order = await Order.create({
    user: userId,
    items: finalItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    status: "Placed",
    statusHistory: [{ status: "Placed", note: "Order placed successfully" }],
    estimatedDelivery,
  });

  return order;
};

export const getOrdersByUser = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getOrderById = async (orderId, userId) => {
  const filter = userId ? { _id: orderId, user: userId } : { _id: orderId };
  return Order.findOne(filter).populate("items.product", "name images");
};

export const getLatestOrderForUser = async (userId) => {
  return Order.findOne({ user: userId }).sort({ createdAt: -1 });
};