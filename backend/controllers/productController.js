import { searchProducts, getProductById as getProductByIdService } from "../services/productService.js";
import Product from "../models/Product.js";

// GET /api/products?query=&school=&grade=&category=&color=&gender=&minPrice=&maxPrice=
export const getProducts = async (req, res) => {
  try {
    const { query, school, grade, category, color, gender, minPrice, maxPrice } = req.query;
    const products = await searchProducts({
      query,
      schoolName: school,
      grade,
      category,
      color,
      gender,
      minPrice,
      maxPrice,
      limit: 50,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};