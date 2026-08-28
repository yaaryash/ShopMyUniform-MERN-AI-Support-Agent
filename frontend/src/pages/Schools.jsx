import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/schools").then((res) => setSchools(res.data));
  }, []);

  return (
    <div className="page">
      <h2>Select Your School</h2>
      <div className="card-grid">
        {schools.map((s) => (
          <div
            key={s._id}
            className="card"
            onClick={() => navigate(`/products?school=${encodeURIComponent(s.name)}`)}
          >
            <h3>{s.name}</h3>
            <p>{s.city}</p>
            <p className="muted">{s.grades?.length || 0} grades supported</p>
          </div>
        ))}
        {schools.length === 0 && <p>No schools found.</p>}
      </div>
    </div>
  );
}