import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
    },
    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
    estimatedDelivery: { type: Date },
    paymentMethod: { type: String, default: "Cash on Delivery" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);