import Product from "../models/Product.js";
import School from "../models/School.js";

export const searchProducts = async ({
  query,
  schoolName,
  grade,
  category,
  color,
  gender,
  minPrice,
  maxPrice,
  limit = 10,
}) => {
  const filter = { isActive: true };

  if (schoolName) {
    // look up school by name since the frontend/AI deal in names, not IDs
    const school = await School.findOne({ name: new RegExp(schoolName, "i") });
    if (school) filter.school = school._id;
  }
  if (grade) filter.applicableGrades = new RegExp(grade, "i");
  if (category) filter.category = new RegExp(category, "i");
  if (color) filter.color = new RegExp(color, "i");
  if (gender) filter.gender = new RegExp(`^${gender}$`, "i");
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (query) {
    filter.$text = { $search: query }; // uses the text index defined on Product
  }

  return Product.find(filter).populate("school", "name").limit(limit);
};

export const getProductById = async (id) => {
  return Product.findById(id).populate("school", "name");
};

export const getSizeAvailability = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return null;
  return product.sizes.map((s) => ({ size: s.size, inStock: s.stock > 0, stock: s.stock }));
};