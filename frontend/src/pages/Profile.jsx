import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/auth/profile").then((res) => setProfile(res.data));
  }, []);

  const update = (field) => (e) => setProfile({ ...profile, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/auth/profile", profile);
    setProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return <div className="page">Loading...</div>;

  return (
    <div className="page form-page">
      <h2>My Profile</h2>
      <form onSubmit={handleSave} className="form">
        <label>Name</label>
        <input value={profile.name || ""} onChange={update("name")} />
        <label>Student Name</label>
        <input value={profile.studentName || ""} onChange={update("studentName")} />
        <label>Grade</label>
        <input value={profile.grade || ""} onChange={update("grade")} />
        <label>Phone</label>
        <input value={profile.phone || ""} onChange={update("phone")} />
        <button type="submit" className="btn">Save Changes</button>
        {saved && <p className="success">Saved!</p>}
      </form>
    </div>
  );
}