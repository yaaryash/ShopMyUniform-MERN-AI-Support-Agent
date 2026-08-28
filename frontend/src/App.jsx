import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Schools from "./pages/Schools";
import Products from "./pages/Products";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
