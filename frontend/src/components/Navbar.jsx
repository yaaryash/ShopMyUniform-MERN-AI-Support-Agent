import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        ShopMyUniform
      </Link>
      <Link to="/schools" className="link-btn">
        Schools
      </Link>
      <Link to="/products" className="link-btn">
        Catalog
      </Link>
      <div className="nav-links">
        <Link to="/cart">Cart ({itemCount})</Link>
        {user ? (
          <>
            <Link to="/orders" className="link-btn">
              My Orders
            </Link>
            <Link to="/profile" className="link-btn">
              {user.name}
            </Link>
            <button
              className="link-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
