import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const [address, setAddress] = useState({ line1: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const items = cart.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity }));
      const { data } = await api.post("/orders", { items, shippingAddress: address, paymentMethod });
      clearCart();
      navigate(`/orders/${data._id}`);
    } catch (err) {
      // this surfaces real backend errors, e.g. "Insufficient stock for..."
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page form-page">
      <h2>Checkout</h2>
      <div className="checkout-summary">
        {cart.map((i) => (
          <p key={`${i.productId}-${i.size}`}>
            {i.name} (size {i.size}) x{i.quantity} — ₹{i.price * i.quantity}
          </p>
        ))}
        <h3>Total: ₹{total}</h3>
      </div>

      <form onSubmit={handlePlaceOrder} className="form">
        <h4>Shipping Address</h4>
        <input placeholder="Address Line" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} required />
        <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
        <input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
        <input placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} required />

        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option>Cash on Delivery</option>
          <option>UPI</option>
          <option>Card</option>
        </select>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" disabled={placing}>
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}