import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, 
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false } 
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["Shirt", "Pants", "Skirt", "Tie", "Blazer", "Shoes", "Sports Kit", "Other"],
      required: true,
    },
    color: { type: String },
    gender: { type: String, enum: ["Boys", "Girls", "Unisex"], default: "Unisex" },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    applicableGrades: [{ type: String }],
    price: { type: Number, required: true },
    images: [{ type: String }],
    sizes: [sizeSchema],
    isActive: { type: Boolean, default: true }, 
  },
  { timestamps: true }
);


productSchema.index({ name: "text", description: "text", category: "text", color: "text" });

export default mongoose.model("Product", productSchema);