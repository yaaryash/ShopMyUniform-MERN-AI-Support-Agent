import { body, validationResult } from "express-validator";

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["parent", "student"]).withMessage("Role must be parent or student"),
];

export const loginRules = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const orderRules = [
  body("items").isArray({ min: 1 }).withMessage("Order must include at least one item"),
  body("items.*.productId").isMongoId().withMessage("Invalid product ID in order items"),
  body("items.*.size").notEmpty().withMessage("Size is required for each item"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("shippingAddress.line1").trim().notEmpty().withMessage("Address line is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
  body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
  body("shippingAddress.pincode").trim().notEmpty().withMessage("Pincode is required"),
];