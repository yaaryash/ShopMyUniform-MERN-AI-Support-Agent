import mongoose from "mongoose";

// A school scopes both its Users (which school they belong to) and
// its Products (which uniforms are sold under that school).
const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    city: { type: String },
    grades: [{ type: String }],
    logo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("School", schoolSchema);