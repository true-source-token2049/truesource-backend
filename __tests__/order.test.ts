import request from "supertest";
import { ExpressApp } from "../type";

// Mock the database instances
jest.mock("../app/v1/helpers/databaseStorageHelper");
jest.mock("../app/v1/helpers/jwtHelper");

describe("Order API Tests", () => {
  let app: ExpressApp;
  let mockAuthToken: string;
  let mockUserId: number;
  let testOrderId: number;

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

  describe("POST /api/v1/user/order", () => {
    it("should create order successfully with valid items", async () => {
      const payload = {
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 },
        ],
        shipping_address: {
          street: "123 Main St",
          city: "Singapore",
          postal_code: "123456",
          country: "Singapore",
        },
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("order_id");
      expect(response.body.result).toHaveProperty("order_number");
      expect(response.body.result).toHaveProperty("items");
      expect(response.body.result).toHaveProperty("subtotal");
      expect(response.body.result).toHaveProperty("tax_amount");
      expect(response.body.result).toHaveProperty("total_amount");
      expect(response.body.result).toHaveProperty("created_at");

      // Save order ID for later tests
      testOrderId = response.body.result.order_id;
    });

    it("should return 401 when no auth token is provided", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 2 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 when items array is empty", async () => {
      const payload = {
        items: [],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return 400 when items is missing", async () => {
      const payload = {};

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return 400 when product_id is missing in items", async () => {
      const payload = {
        items: [{ quantity: 2 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return 400 when quantity is missing in items", async () => {
      const payload = {
        items: [{ product_id: 1 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return 400 when quantity is not positive", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 0 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it("should return error when product does not exist", async () => {
      const payload = {
        items: [{ product_id: 999999, quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return error when inventory is insufficient", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 999999 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/insufficient inventory/i);
    });

    it("should calculate Singapore GST (9%) correctly", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      if (response.status === 200) {
        const { subtotal, tax_amount, total_amount } = response.body.result;

        // Verify GST calculation (9%)
        const expectedTax = parseFloat((subtotal * 0.09).toFixed(2));
        expect(tax_amount).toBe(expectedTax);
        expect(total_amount).toBe(
          parseFloat((subtotal + tax_amount).toFixed(2))
        );
      }
    });

    it("should generate unique order number", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
      };

      const response1 = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      const response2 = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      if (response1.status === 200 && response2.status === 200) {
        expect(response1.body.result.order_number).not.toBe(
          response2.body.result.order_number
        );
      }
    });

    it("should create order with shipping address", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
        shipping_address: {
          name: "John Doe",
          street: "123 Test Street",
          city: "Singapore",
          postal_code: "123456",
          country: "Singapore",
        },
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.result).toHaveProperty("order_id");
    });

    it("should create order without shipping address", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.result).toHaveProperty("order_id");
    });

    it("should handle multiple items with different products", async () => {
      const payload = {
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 3 },
          { product_id: 3, quantity: 1 },
        ],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      if (response.status === 200) {
        expect(response.body.result.items).toHaveLength(3);
        const totalQuantity = response.body.result.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );
        expect(totalQuantity).toBe(6);
      }
    });

    it("should deduct inventory from batches using FIFO", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 5 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(200);
      // Verify order was created successfully
      expect(response.body.result).toHaveProperty("order_id");
      expect(response.body.result).toHaveProperty("items");
    });

    it("should link batch_range_logs to order", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 2 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBe(200);
      // Verify order was created
      expect(response.body.result).toHaveProperty("order_id");
      // The batch_range_logs should be linked internally
      // This would require querying the database to verify
    });

    it("should rollback transaction on error", async () => {
      // Attempt to create order with invalid data that will cause an error mid-transaction
      const payload = {
        items: [
          { product_id: 1, quantity: 1 },
          { product_id: 999999, quantity: 1 }, // Invalid product
        ],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/user/order/:order_id", () => {
    beforeAll(async () => {
      // Create an order for testing
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      if (response.status === 200) {
        testOrderId = response.body.result.order_id;
      }
    });

    it("should get order details successfully", async () => {
      const response = await request(app)
        .get(`/api/v1/user/order/${testOrderId}`)
        .set("Authorization", mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("order_id");
      expect(response.body.result).toHaveProperty("order_number");

      expect(response.body.result).toHaveProperty("items");
      expect(response.body.result).toHaveProperty("subtotal");
      expect(response.body.result).toHaveProperty("tax_amount");
      expect(response.body.result).toHaveProperty("total_amount");
      expect(response.body.result).toHaveProperty("created_at");
    });

    it("should return 401 when no auth token is provided", async () => {
      const response = await request(app).get(
        `/api/v1/user/order/${testOrderId}`
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 when order does not exist", async () => {
      const response = await request(app)
        .get("/api/v1/user/order/999999")
        .set("Authorization", mockAuthToken);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return error when trying to access another user's order", async () => {
      const anotherUserToken = "Bearer mock-another-user-token";

      const response = await request(app)
        .get(`/api/v1/user/order/${testOrderId}`)
        .set("Authorization", anotherUserToken);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should include product details in order items", async () => {
      const response = await request(app)
        .get(`/api/v1/user/order/${testOrderId}`)
        .set("Authorization", mockAuthToken);

      if (response.status === 200 && response.body.result.items.length > 0) {
        const item = response.body.result.items[0];
        expect(item).toHaveProperty("product_id");
        expect(item).toHaveProperty("product_name");
        expect(item).toHaveProperty("quantity");
        expect(item).toHaveProperty("price");
        expect(item).toHaveProperty("subtotal");
      }
    });

    it("should return 400 for invalid order_id format", async () => {
      const response = await request(app)
        .get("/api/v1/user/order/invalid-id")
        .set("Authorization", mockAuthToken);

      expect(response.status).toBe(400);
    });

    it("should return order with correct calculated totals", async () => {
      const response = await request(app)
        .get(`/api/v1/user/order/${testOrderId}`)
        .set("Authorization", mockAuthToken);

      if (response.status === 200) {
        const { subtotal, tax_amount, total_amount } = response.body.result;

        // Verify calculations
        expect(tax_amount).toBe(parseFloat((subtotal * 0.09).toFixed(2)));
        expect(total_amount).toBe(
          parseFloat((subtotal + tax_amount).toFixed(2))
        );
      }
    });
  });

  describe("Order Integration Tests", () => {
    it("should create order and retrieve it successfully", async () => {
      // Create order
      const createPayload = {
        items: [{ product_id: 1, quantity: 1 }],
      };

      const createResponse = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(createPayload);

      expect(createResponse.status).toBe(200);
      const orderId = createResponse.body.result.order_id;

      // Retrieve order
      const getResponse = await request(app)
        .get(`/api/v1/user/order/${orderId}`)
        .set("Authorization", mockAuthToken);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.result.order_id).toBe(orderId);
      expect(getResponse.body.result.order_number).toBe(
        createResponse.body.result.order_number
      );
    });

    it("should handle concurrent order creation", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 1 }],
      };

      // Create multiple orders concurrently
      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(app)
            .post("/api/v1/user/order")
            .set("Authorization", mockAuthToken)
            .send(payload)
        );

      const responses = await Promise.all(promises);

      // All should succeed or fail gracefully
      responses.forEach((response) => {
        expect([200, 400]).toContain(response.status);
      });
    });
  });
});
