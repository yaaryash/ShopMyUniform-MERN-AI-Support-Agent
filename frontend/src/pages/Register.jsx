import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "parent",
    studentName: "",
    grade: "",
    school: "",
    phone: "",
  });
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/schools").then((res) => setSchools(res.data)).catch(() => {});
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="page form-page">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="form">
        <input placeholder="Your Name" value={form.name} onChange={update("name")} required />
        <input type="email" placeholder="Email" value={form.email} onChange={update("email")} required />
        <input type="password" placeholder="Password" value={form.password} onChange={update("password")} required />
        <input placeholder="Phone" value={form.phone} onChange={update("phone")} />

        <select value={form.role} onChange={update("role")}>
          <option value="parent">Parent</option>
          <option value="student">Student</option>
        </select>

        <input placeholder="Student Name" value={form.studentName} onChange={update("studentName")} />

        <select value={form.school} onChange={update("school")}>
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <select value={form.grade} onChange={update("grade")}>
          <option value="">Select Grade</option>
          {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}