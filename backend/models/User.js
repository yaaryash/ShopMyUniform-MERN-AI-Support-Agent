import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["parent", "student"], default: "parent" },
    studentName: { type: String },
    grade: { type: String },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    phone: { type: String },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);