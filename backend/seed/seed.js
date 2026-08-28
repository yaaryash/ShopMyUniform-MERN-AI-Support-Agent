import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import School from "../models/School.js";
import Product from "../models/Product.js";

dotenv.config();

const run = async () => {
  await connectDB();

  await School.deleteMany({});
  await Product.deleteMany({});

  const school = await School.create({
    name: "Greenwood High School",
    city: "Hyderabad",
    grades: Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`),
  });

  const products = [
    {
      name: "White Half-Sleeve Shirt",
      description: "Standard school white shirt, breathable cotton blend.",
      category: "Shirt",
      color: "White",
      gender: "Unisex",
      school: school._id,
      applicableGrades: ["Grade 6", "Grade 7", "Grade 8"],
      price: 449,
      images: [],
      sizes: [
        { size: "26", stock: 12 },
        { size: "28", stock: 8 },
        { size: "30", stock: 0 },
        { size: "32", stock: 15 },
      ],
    },
    {
      name: "Navy Blue Trousers",
      description: "Formal navy trousers, part of the standard uniform.",
      category: "Pants",
      color: "Navy Blue",
      gender: "Boys",
      school: school._id,
      applicableGrades: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"],
      price: 549,
      images: [],
      sizes: [
        { size: "28", stock: 10 },
        { size: "30", stock: 6 },
        { size: "32", stock: 9 },
      ],
    },
    {
      name: "Pleated Grey Skirt",
      description: "Standard pleated skirt for the girls' uniform.",
      category: "Skirt",
      color: "Grey",
      gender: "Girls",
      school: school._id,
      applicableGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
      price: 499,
      images: [],
      sizes: [
        { size: "S", stock: 5 },
        { size: "M", stock: 7 },
        { size: "L", stock: 0 },
      ],
    },
    {
      name: "House Tie",
      description: "Striped house tie, color varies by house.",
      category: "Tie",
      color: "Multicolor",
      gender: "Unisex",
      school: school._id,
      applicableGrades: Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`),
      price: 149,
      images: [],
      sizes: [{ size: "Free Size", stock: 40 }],
    },
    {
      name: "School Blazer",
      description: "Navy blazer with embroidered crest, worn during winter/formal events.",
      category: "Blazer",
      color: "Navy Blue",
      gender: "Unisex",
      school: school._id,
      applicableGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"],
      price: 1299,
      images: [],
      sizes: [
        { size: "34", stock: 4 },
        { size: "36", stock: 3 },
        { size: "38", stock: 0 },
      ],
    },
  ];

  await Product.insertMany(products);

  console.log("Seed complete: 1 school, 5 products created.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});