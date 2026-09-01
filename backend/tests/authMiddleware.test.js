import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

process.env.JWT_SECRET = "test-secret"; // isolated secret for tests only

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// helper to fake Express req/res/next, since we're testing the middleware
// function directly without spinning up a real HTTP server
const mockReqRes = (authHeader) => {
  const req = { headers: authHeader ? { authorization: authHeader } : {} };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  const next = jest.fn();
  return { req, res, next };
};

describe("protect middleware", () => {
  test("rejects requests with no Authorization header", async () => {
    const { req, res, next } = mockReqRes(undefined);
    await protect(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects requests with a malformed/invalid token", async () => {
    const { req, res, next } = mockReqRes("Bearer this.is.not.a.valid.jwt");
    await protect(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("accepts a valid token and attaches the real user to req.user", async () => {
    const user = await User.create({ name: "Test", email: "mw@test.com", password: "hashed" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).not.toBeNull();
    expect(req.user.email).toBe("mw@test.com");
    expect(req.user.password).toBeUndefined(); // confirms .select("-password") worked
  });
});