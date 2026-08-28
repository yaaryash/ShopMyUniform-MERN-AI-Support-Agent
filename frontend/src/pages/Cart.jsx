import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="page">
        <h2>Your Cart</h2>
        <p>Your cart is empty. <Link to="/products">Browse the catalog</Link>.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Your Cart</h2>
      <div className="cart-list">
        {cart.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="cart-item">
            <div>
              <strong>{item.name}</strong>
              <p className="muted small">Size: {item.size}</p>
            </div>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, item.size, Number(e.target.value))}
            />
            <p>₹{item.price * item.quantity}</p>
            <button className="link-btn" onClick={() => removeFromCart(item.productId, item.size)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: ₹{total}</h3>
        <button
          className="btn"
          onClick={() => (user ? navigate("/checkout") : navigate("/login"))}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}