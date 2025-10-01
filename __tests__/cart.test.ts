import request from "supertest";
import { ExpressApp } from "../type";

// Mock the database instances
jest.mock("../app/v1/helpers/databaseStorageHelper");
jest.mock("../app/v1/helpers/jwtHelper");

describe("Cart API Tests", () => {
  let app: ExpressApp;
  let mockAuthToken: string;
  let mockUserId: number;

  beforeAll(async () => {
    // Import app after mocks are set up
    app = require("../app");
    mockAuthToken = "Bearer mock-valid-token";
    mockUserId = 1;
  });

  afterAll(async () => {
    // Clean up
    if (app && app.sequelizeClient) {
      await app.sequelizeClient.close();
    }
  });

  describe("POST /api/v1/user/cart/add", () => {
    it("should add item to cart successfully", async () => {
      const payload = {
        productId: 1,
        qty: 2,
      };

      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("items");
      expect(response.body.result).toHaveProperty("subtotal");
      expect(response.body.result).toHaveProperty("tax_amount");
      expect(response.body.result).toHaveProperty("total_amount");
    });

    it("should return 401 when no auth token is provided", async () => {
      const payload = {
        productId: 1,
        qty: 2,
      };

      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 when productId is missing", async () => {
      const payload = {
        qty: 2,
      };

      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return 400 when qty is missing", async () => {
      const payload = {
        productId: 1,
      };

      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return 400 when qty is not a positive number", async () => {
      const payload = {
        productId: 1,
        qty: -1,
      };

      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return 400 when productId is not a positive number", async () => {
      const payload = {
        productId: -1,
        qty: 2,
      };

      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return error when product does not exist", async () => {
      const payload = {
        productId: 999999,
        qty: 2,
      };

      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should update quantity when adding existing cart item", async () => {
      const payload = {
        productId: 1,
        qty: 1,
      };

      // Add item first time
      await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      // Add same item again
      const response = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Verify quantity was updated
      const cartItem = response.body.result.items.find(
        (item: any) => item.product_id === payload.productId
      );
      expect(cartItem.quantity).toBeGreaterThan(1);
    });
  });

  describe("GET /api/v1/user/cart", () => {
    it("should get cart summary successfully", async () => {
      const response = await request(app)
        .get("/api/v1/user/cart")
        .set("Authorization", mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("items");
      expect(response.body.result).toHaveProperty("subtotal");
      expect(response.body.result).toHaveProperty("tax_amount");
      expect(response.body.result).toHaveProperty("total_amount");
      expect(Array.isArray(response.body.result.items)).toBe(true);
    });

    it("should return 401 when no auth token is provided", async () => {
      const response = await request(app).get("/api/v1/user/cart");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should calculate Singapore GST (9%) correctly", async () => {
      // Add items to cart first
      await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send({ productId: 1, qty: 1 });

      const response = await request(app)
        .get("/api/v1/user/cart")
        .set("Authorization", mockAuthToken);

      expect(response.status).toBe(200);
      const { subtotal, tax_amount, total_amount } = response.body.result;

      // Verify GST calculation (9%)
      const expectedTax = parseFloat((subtotal * 0.09).toFixed(2));
      expect(tax_amount).toBe(expectedTax);
      expect(total_amount).toBe(parseFloat((subtotal + tax_amount).toFixed(2)));
    });

    it("should return empty cart for new user", async () => {
      const newUserToken = "Bearer mock-new-user-token";

      const response = await request(app)
        .get("/api/v1/user/cart")
        .set("Authorization", newUserToken);

      expect(response.status).toBe(200);
      expect(response.body.result.items).toHaveLength(0);
      expect(response.body.result.subtotal).toBe(0);
      expect(response.body.result.tax_amount).toBe(0);
      expect(response.body.result.total_amount).toBe(0);
    });

    it("should include product details in cart items", async () => {
      // Add item to cart
      await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send({ productId: 1, qty: 1 });

      const response = await request(app)
        .get("/api/v1/user/cart")
        .set("Authorization", mockAuthToken);

      expect(response.status).toBe(200);
      if (response.body.result.items.length > 0) {
        const item = response.body.result.items[0];
        expect(item).toHaveProperty("product_id");
        expect(item).toHaveProperty("product_name");
        expect(item).toHaveProperty("quantity");
        expect(item).toHaveProperty("price");
        expect(item).toHaveProperty("subtotal");
      }
    });
  });
});
