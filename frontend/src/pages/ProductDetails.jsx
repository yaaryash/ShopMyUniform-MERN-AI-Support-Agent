import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <div className="page">Loading...</div>;

  const handleAdd = () => {
    if (!selectedSize) return; 
    addToCart(product, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500); 
  };

  return (
    <div className="page product-details">
      <h2>{product.name}</h2>
      <p className="muted">{product.category} • {product.color} • {product.gender}</p>
      <p className="price">₹{product.price}</p>
      <p>{product.description}</p>
      <p className="muted small">School: {product.school?.name}</p>
      <p className="muted small">Grades: {product.applicableGrades?.join(", ")}</p>

      <div className="size-selector">
        <h4>Select Size</h4>
        <div className="size-options">
          {product.sizes.map((s) => (
            <button
              key={s.size}
              disabled={s.stock === 0} // out-of-stock sizes can't be selected at all
              className={`size-btn ${selectedSize === s.size ? "selected" : ""}`}
              onClick={() => setSelectedSize(s.size)}
            >
              {s.size} {s.stock === 0 ? "(Out of stock)" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={handleAdd} disabled={!selectedSize}>
          Add to Cart
        </button>
        <button className="btn secondary" onClick={() => navigate("/cart")}>
          Go to Cart
        </button>
      </div>
      {added && <p className="success">Added to cart!</p>}
    </div>
  );
}