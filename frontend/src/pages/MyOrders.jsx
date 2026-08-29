import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my").then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>My Orders</h2>
      {orders.length === 0 && <p>You haven't placed any orders yet.</p>}
      <div className="order-list">
        {orders.map((o) => (
          <Link to={`/orders/${o._id}`} key={o._id} className="card order-card">
            <div>
              <strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
              <p className="muted small">{new Date(o.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`status-badge status-${o.status.replace(/\s/g, "")}`}>{o.status}</span>
            <p>₹{o.totalAmount}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}