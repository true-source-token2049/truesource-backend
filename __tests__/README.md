# Test Suite Documentation

## Overview

This directory contains comprehensive test suites for the TrueSource backend e-commerce APIs, specifically for Cart and Order management functionality.

## Test Structure

```
__tests__/
├── cart.test.ts                          # Cart API tests
├── order.test.ts                         # Order API tests
├── integration/
│   └── cart-order-flow.test.ts          # End-to-end integration tests
├── utils/
│   └── test-helpers.ts                   # Test utilities and helpers
└── README.md                             # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test cart.test.ts
npm test order.test.ts
npm test cart-order-flow.test.ts
```

## Test Coverage

### Cart API Tests (`cart.test.ts`)

#### POST /api/v1/user/cart/add
- ✅ Add item to cart successfully
- ✅ Return 401 when no auth token provided
- ✅ Return 400 when productId is missing
- ✅ Return 400 when qty is missing
- ✅ Return 400 when qty is not positive
- ✅ Return 400 when productId is not positive
- ✅ Return error when product does not exist
- ✅ Update quantity when adding existing cart item

#### GET /api/v1/user/cart
- ✅ Get cart summary successfully
- ✅ Return 401 when no auth token provided
- ✅ Calculate Singapore GST (9%) correctly
- ✅ Return empty cart for new user
- ✅ Include product details in cart items

### Order API Tests (`order.test.ts`)

#### POST /api/v1/user/order
- ✅ Create order successfully with valid items
- ✅ Return 401 when no auth token provided
- ✅ Return 400 when items array is empty
- ✅ Return 400 when items is missing
- ✅ Return 400 when product_id is missing in items
- ✅ Return 400 when quantity is missing in items
- ✅ Return 400 when quantity is not positive
- ✅ Return error when product does not exist
- ✅ Return error when inventory is insufficient
- ✅ Calculate Singapore GST (9%) correctly
- ✅ Generate unique order number
- ✅ Create order with shipping address
- ✅ Create order without shipping address
- ✅ Handle multiple items with different products
- ✅ Deduct inventory from batches using FIFO
- ✅ Link batch_range_logs to order
- ✅ Rollback transaction on error

#### GET /api/v1/user/order/:order_id
- ✅ Get order details successfully
- ✅ Return 401 when no auth token provided
- ✅ Return 404 when order does not exist
- ✅ Return error when trying to access another user's order
- ✅ Include product details in order items
- ✅ Return 400 for invalid order_id format
- ✅ Return order with correct calculated totals

### Integration Tests (`cart-order-flow.test.ts`)

#### Complete Purchase Flow
- ✅ Complete full flow: add to cart → view cart → create order → view order
- ✅ Handle adding multiple items to cart and creating order
- ✅ Verify inventory is deducted after order creation

#### Cart Management
- ✅ Update cart item quantity when adding same product

#### Tax Calculation Consistency
- ✅ Consistent GST calculation between cart and order

#### Error Handling
- ✅ Handle out of stock during order creation
- ✅ Handle invalid product in order
- ✅ Handle unauthorized access to order

#### Batch and Inventory Management
- ✅ Allocate inventory from batches using FIFO
- ✅ Link batch_range_logs to created order

#### Order Number Generation
- ✅ Generate unique order numbers for multiple orders

## Test Data and Mocks

The test suite uses mocked database instances to ensure:
- Fast execution
- No dependency on actual database state
- Isolated test environment
- Reproducible results

Mock data includes:
- Users with authentication tokens
- Products with pricing
- Batches with inventory
- Batch range logs (authcodes)
- Cart items
- Orders and order items

## Key Testing Features

### 1. Authentication Testing
All protected endpoints are tested with:
- Valid authentication tokens
- Missing tokens (401 responses)
- Invalid tokens
- Unauthorized access attempts

### 2. Validation Testing
Input validation is thoroughly tested:
- Missing required fields
- Invalid data types
- Out-of-range values
- Negative numbers
- Zero quantities

### 3. Business Logic Testing
Core business logic validation:
- Singapore GST (9%) calculation accuracy
- Inventory management (FIFO)
- Batch allocation
- Transaction rollback on errors
- Unique order number generation

### 4. Integration Testing
End-to-end workflows:
- Complete purchase journey
- Multi-item cart operations
- Concurrent order creation
- Inventory deduction verification

## Singapore GST (9%)

All tests verify that the Singapore Goods and Services Tax (GST) is correctly calculated at **9%** of the subtotal:

```typescript
tax_amount = subtotal * 0.09
total_amount = subtotal + tax_amount
```

## Test Helpers

The `test-helpers.ts` file provides utility functions:

- `generateMockAuthToken(userId)` - Generate mock JWT tokens
- `createMockProduct(overrides)` - Create test product data
- `createMockBatch(overrides)` - Create test batch data
- `createMockBatchRangeLogs(batchId, count)` - Create multiple batch range logs
- `calculateGST(amount)` - Calculate Singapore GST
- `calculateTotal(subtotal)` - Calculate total with GST
- `waitFor(ms)` - Async delay utility

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- No external dependencies required
- Fast execution (< 30 seconds)
- Deterministic results
- Comprehensive coverage

## Contributing

When adding new features to the Cart or Order APIs:

1. Add corresponding unit tests
2. Update integration tests if needed
3. Ensure all tests pass
4. Maintain >80% code coverage
5. Document test cases in this README

## Known Limitations

1. Database mocks may not perfectly replicate Sequelize behavior
2. Transaction rollback testing is limited
3. Concurrent access testing is simplified
4. Some edge cases may require database integration tests

## Future Improvements

- [ ] Add performance/load testing
- [ ] Add database integration tests
- [ ] Add API contract testing
- [ ] Add security/penetration testing
- [ ] Add GraphQL API tests (if applicable)
- [ ] Mock external services (Cloudinary, etc.)
