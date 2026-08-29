import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>
      <p className="muted">Placed on {new Date(order.createdAt).toLocaleString()}</p>
      <span className={`status-badge status-${order.status.replace(/\s/g, "")}`}>{order.status}</span>
      <p className="muted small">
        Estimated delivery: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "TBD"}
      </p>

      <h4>Items</h4>
      {order.items.map((i, idx) => (
        <p key={idx}>{i.name} (size {i.size}) x{i.quantity} — ₹{i.price * i.quantity}</p>
      ))}
      <h3>Total: ₹{order.totalAmount}</h3>

      <h4>Tracking History</h4>
      <ul className="timeline">
        {order.statusHistory?.map((h, idx) => (
          <li key={idx}>
            <strong>{h.status}</strong> — {new Date(h.date).toLocaleString()}
            {h.note && <p className="muted small">{h.note}</p>}
          </li>
        ))}
      </ul>

      <h4>Shipping Address</h4>
      <p>
        {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
      </p>
    </div>
  );
}