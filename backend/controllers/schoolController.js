import School from "../models/School.js";

// GET /api/schools
export const getSchools = async (req, res) => {
  try {
    const schools = await School.find({});
    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/schools/:id
export const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });
    res.json(school);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};