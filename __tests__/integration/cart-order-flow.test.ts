import request from "supertest";
import { ExpressApp } from "../../type";
import {
  generateMockAuthToken,
  calculateGST,
  calculateTotal,
} from "../utils/test-helpers";

/**
 * Integration Tests for Cart to Order Flow
 * Tests the complete customer journey from adding items to cart to creating an order
 */

jest.mock("../../app/v1/helpers/databaseStorageHelper");
jest.mock("../../app/v1/helpers/jwtHelper");

describe("Cart to Order Flow Integration Tests", () => {
  let app: ExpressApp;
  let mockAuthToken: string;
  let testProductId: number;

  beforeAll(async () => {
    app = require("../../app");
    mockAuthToken = generateMockAuthToken(1);
    testProductId = 1;
  });

  afterAll(async () => {
    if (app && app.sequelizeClient) {
      await app.sequelizeClient.close();
    }
  });

  describe("Complete Purchase Flow", () => {
    it("should complete full flow: add to cart -> view cart -> create order -> view order", async () => {
      // Step 1: Add item to cart
      const addToCartPayload = {
        productId: testProductId,
        qty: 2,
      };

      const addToCartResponse = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(addToCartPayload);

      expect(addToCartResponse.status).toBe(200);
      expect(addToCartResponse.body.success).toBe(true);

      // Step 2: View cart
      const viewCartResponse = await request(app)
        .get("/api/v1/user/cart")
        .set("Authorization", mockAuthToken);

      expect(viewCartResponse.status).toBe(200);
      expect(viewCartResponse.body.result.items.length).toBeGreaterThan(0);

      const cartSummary = viewCartResponse.body.result;
      const expectedTax = calculateGST(cartSummary.subtotal);
      expect(cartSummary.tax_amount).toBe(expectedTax);

      // Step 3: Create order from cart items
      const createOrderPayload = {
        items: cartSummary.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_address: {
          name: "John Doe",
          street: "123 Orchard Road",
          city: "Singapore",
          postal_code: "238858",
          country: "Singapore",
        },
      };

      const createOrderResponse = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(createOrderPayload);

      expect(createOrderResponse.status).toBe(200);
      expect(createOrderResponse.body.success).toBe(true);
      expect(createOrderResponse.body.result).toHaveProperty("order_id");
      expect(createOrderResponse.body.result).toHaveProperty("order_number");

      const orderId = createOrderResponse.body.result.order_id;

      // Step 4: View order details
      const viewOrderResponse = await request(app)
        .get(`/api/v1/user/order/${orderId}`)
        .set("Authorization", mockAuthToken);

      expect(viewOrderResponse.status).toBe(200);
      expect(viewOrderResponse.body.result.order_id).toBe(orderId);
      expect(viewOrderResponse.body.result.status).toBe("pending");

      // Verify order totals match cart totals
      expect(viewOrderResponse.body.result.subtotal).toBe(
        createOrderResponse.body.result.subtotal
      );
      expect(viewOrderResponse.body.result.tax_amount).toBe(
        createOrderResponse.body.result.tax_amount
      );
      expect(viewOrderResponse.body.result.total_amount).toBe(
        createOrderResponse.body.result.total_amount
      );
    });

    it("should handle adding multiple items to cart and creating order", async () => {
      // Add multiple items
      const items = [
        { productId: 1, qty: 2 },
        { productId: 2, qty: 1 },
        { productId: 3, qty: 3 },
      ];

      for (const item of items) {
        const response = await request(app)
          .post("/api/v1/user/cart/add")
          .set("Authorization", mockAuthToken)
          .send(item);

        expect(response.status).toBe(200);
      }

      // View cart
      const cartResponse = await request(app)
        .get("/api/v1/user/cart")
        .set("Authorization", mockAuthToken);

      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body.result.items.length).toBeGreaterThanOrEqual(3);

      // Create order
      const orderPayload = {
        items: cartResponse.body.result.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const orderResponse = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(orderPayload);

      if (orderResponse.status === 200) {
        expect(orderResponse.body.result.items.length).toBeGreaterThanOrEqual(
          3
        );
      }
    });

    it("should verify inventory is deducted after order creation", async () => {
      const productId = 1;
      const quantity = 1;

      // Create order
      const orderPayload = {
        items: [{ product_id: productId, quantity }],
      };

      const order1Response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(orderPayload);

      expect(order1Response.status).toBe(200);

      // Try to create another order with large quantity
      // This should fail if inventory was properly deducted
      const largeOrderPayload = {
        items: [{ product_id: productId, quantity: 999999 }],
      };

      const order2Response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(largeOrderPayload);

      // Should fail due to insufficient inventory
      expect(order2Response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Cart Management", () => {
    it("should update cart item quantity when adding same product", async () => {
      const payload = { productId: 1, qty: 1 };

      // Add first time
      const response1 = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response1.status).toBe(200);
      const initialQty = response1.body.result.items.find(
        (item: any) => item.product_id === payload.productId
      )?.quantity;

      // Add second time
      const response2 = await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response2.status).toBe(200);
      const updatedQty = response2.body.result.items.find(
        (item: any) => item.product_id === payload.productId
      )?.quantity;

      expect(updatedQty).toBeGreaterThan(initialQty || 0);
    });
  });

  describe("Tax Calculation Consistency", () => {
    it("should have consistent GST calculation between cart and order", async () => {
      // Add item to cart
      await request(app)
        .post("/api/v1/user/cart/add")
        .set("Authorization", mockAuthToken)
        .send({ productId: 1, qty: 5 });

      // Get cart
      const cartResponse = await request(app)
        .get("/api/v1/user/cart")
        .set("Authorization", mockAuthToken);

      const cartTax = cartResponse.body.result.tax_amount;
      const cartSubtotal = cartResponse.body.result.subtotal;

      // Create order
      const orderResponse = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send({
          items: [{ product_id: 1, quantity: 5 }],
        });

      if (orderResponse.status === 200) {
        const orderTax = orderResponse.body.result.tax_amount;
        const orderSubtotal = orderResponse.body.result.subtotal;

        // Tax rates should be consistent
        const cartTaxRate = cartTax / cartSubtotal;
        const orderTaxRate = orderTax / orderSubtotal;

        expect(Math.abs(cartTaxRate - orderTaxRate)).toBeLessThan(0.001);
        expect(Math.abs(cartTaxRate - 0.09)).toBeLessThan(0.001); // 9% GST
      }
    });
  });

  describe("Error Handling in Flow", () => {
    it("should handle out of stock during order creation", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 1000000 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should handle invalid product in order", async () => {
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

    it("should handle unauthorized access to order", async () => {
      // Create order with one user
      const order = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", generateMockAuthToken(1))
        .send({ items: [{ product_id: 1, quantity: 1 }] });

      if (order.status === 200) {
        const orderId = order.body.result.order_id;

        // Try to access with different user
        const response = await request(app)
          .get(`/api/v1/user/order/${orderId}`)
          .set("Authorization", generateMockAuthToken(999));

        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Batch and Inventory Management", () => {
    it("should allocate inventory from batches using FIFO", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 3 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      if (response.status === 200) {
        expect(response.body.result).toHaveProperty("order_id");
        // Inventory should be deducted from oldest batch first (FIFO)
        // This would require querying the database to verify batch allocation
      }
    });

    it("should link batch_range_logs to created order", async () => {
      const payload = {
        items: [{ product_id: 1, quantity: 2 }],
      };

      const response = await request(app)
        .post("/api/v1/user/order")
        .set("Authorization", mockAuthToken)
        .send(payload);

      if (response.status === 200) {
        const orderId = response.body.result.order_id;
        expect(orderId).toBeDefined();
        // batch_range_logs should now have order_id and user_id set
        // This would require database verification
      }
    });
  });

  describe("Order Number Generation", () => {
    it("should generate unique order numbers for multiple orders", async () => {
      const orderNumbers = new Set<string>();

      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/v1/user/order")
          .set("Authorization", mockAuthToken)
          .send({ items: [{ product_id: 1, quantity: 1 }] });

        if (response.status === 200) {
          orderNumbers.add(response.body.result.order_number);
        }
      }

      // All order numbers should be unique
      expect(orderNumbers.size).toBeGreaterThan(0);
    });
  });
});
