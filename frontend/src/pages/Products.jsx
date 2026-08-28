import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    school: searchParams.get("school") || "",
    grade: searchParams.get("grade") || "",
    category: searchParams.get("category") || "",
  });

  const fetchProducts = async (f) => {
    setLoading(true);
    // drop empty filter values so we don't send ?query=&school=&... clutter
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
    const { data } = await api.get("/products", { params });
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    fetchProducts(filters);
  };

  return (
    <div className="page">
      <h2>Product Catalog</h2>
      <form onSubmit={handleSearch} className="filter-bar">
        <input
          placeholder="Search products..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
        <input
          placeholder="School"
          value={filters.school}
          onChange={(e) => setFilters({ ...filters, school: e.target.value })}
        />
        <input
          placeholder="Grade (e.g. Grade 7)"
          value={filters.grade}
          onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {["Shirt", "Pants", "Skirt", "Tie", "Blazer", "Shoes", "Sports Kit"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" className="btn">Search</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card-grid">
          {products.map((p) => (
            <Link to={`/products/${p._id}`} key={p._id} className="card product-card">
              <h3>{p.name}</h3>
              <p className="muted">{p.category} • {p.color}</p>
              <p className="price">₹{p.price}</p>
              <p className="muted small">{p.school?.name}</p>
            </Link>
          ))}
          {products.length === 0 && <p>No products match your search.</p>}
        </div>
      )}
    </div>
  );
}