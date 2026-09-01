import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import School from "../models/School.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { createOrder } from "../services/orderService.js";

let school, product, user;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  school = await School.create({ name: "Test School", city: "Testville", grades: ["Grade 7"] });
  product = await Product.create({
    name: "Test Shirt",
    category: "Shirt",
    color: "White",
    school: school._id,
    applicableGrades: ["Grade 7"],
    price: 500, // deliberately different from what we'll try to "trick" it with
    sizes: [{ size: "28", stock: 3 }],
  });
  user = await User.create({ name: "Test User", email: "test@test.com", password: "hashedpw" });
});

describe("createOrder", () => {
  test("succeeds and decrements stock when quantity is within limits", async () => {
    const order = await createOrder({
      userId: user._id,
      items: [{ productId: product._id, size: "28", quantity: 2 }],
      shippingAddress: { line1: "x", city: "x", state: "x", pincode: "x" },
      paymentMethod: "Cash on Delivery",
    });

    expect(order.totalAmount).toBe(1000); // 500 * 2, computed server-side

    const updated = await Product.findById(product._id);
    const sizeEntry = updated.sizes.find((s) => s.size === "28");
    expect(sizeEntry.stock).toBe(1); // 3 - 2
  });

  test("rejects order when requested quantity exceeds available stock", async () => {
    await expect(
      createOrder({
        userId: user._id,
        items: [{ productId: product._id, size: "28", quantity: 10 }], // only 3 in stock
        shippingAddress: { line1: "x", city: "x", state: "x", pincode: "x" },
        paymentMethod: "Cash on Delivery",
      })
    ).rejects.toThrow(/Insufficient stock/);

    // stock must remain untouched since the order failed
    const unchanged = await Product.findById(product._id);
    const sizeEntry = unchanged.sizes.find((s) => s.size === "28");
    expect(sizeEntry.stock).toBe(3);
  });

  test("ignores a client-supplied price and always uses the real DB price", async () => {
    // this test simulates the exact attack we designed against: a malicious
    // client sending a price field that the server should never trust
    const order = await createOrder({
      userId: user._id,
      items: [{ productId: product._id, size: "28", quantity: 1, price: 1 }], // fake price: ₹1
      shippingAddress: { line1: "x", city: "x", state: "x", pincode: "x" },
      paymentMethod: "Cash on Delivery",
    });

    expect(order.totalAmount).toBe(500); // real DB price used, not the injected ₹1
  });
});