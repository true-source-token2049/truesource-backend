/**
 * Test Helpers and Utilities
 */

export const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  name: "Test User",
};

export const mockProduct = {
  id: 1,
  title: "Test Product",
  brand: "Test Brand",
  category: "Test Category",
  price: 100,
  description: "Test Description",
  plain_description: "Test Plain Description",
};

export const mockBatch = {
  id: 1,
  product_id: 1,
  start: "0001",
  end: "0100",
  total_units: 100,
  available_units: 50,
  uid: "BATCH-001",
  nft_minting_status: "pending",
};

export const mockBatchRangeLog = {
  id: 1,
  batch_id: 1,
  authcode: "AUTH-CODE-001",
  number_of_views: 0,
  order_id: null,
  user_id: null,
};

export const generateMockAuthToken = (userId: number = 1): string => {
  return `Bearer mock-token-user-${userId}`;
};

export const createMockProduct = (
  overrides: Partial<typeof mockProduct> = {}
) => {
  return {
    ...mockProduct,
    ...overrides,
  };
};

export const createMockBatch = (overrides: Partial<typeof mockBatch> = {}) => {
  return {
    ...mockBatch,
    ...overrides,
  };
};

export const createMockBatchRangeLogs = (
  batchId: number,
  count: number
): (typeof mockBatchRangeLog)[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockBatchRangeLog,
    id: index + 1,
    batch_id: batchId,
    authcode: `AUTH-CODE-${String(index + 1).padStart(3, "0")}`,
  }));
};

export const calculateGST = (amount: number): number => {
  return parseFloat((amount * 0.09).toFixed(2));
};

export const calculateTotal = (subtotal: number): number => {
  const tax = calculateGST(subtotal);
  return parseFloat((subtotal + tax).toFixed(2));
};

export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockJWTToken = {
  access: "mock-access-token",
  refresh: "mock-refresh-token",
};

export const mockCartItem = {
  id: 1,
  user_id: 1,
  product_id: 1,
  quantity: 2,
  price: 100,
};

export const mockOrder = {
  id: 1,
  user_id: 1,
  order_number: "ORD-123456",
  status: "pending",
  subtotal: 200,
  tax_amount: 18,
  total_amount: 218,
};

export const mockOrderItem = {
  id: 1,
  order_id: 1,
  product_id: 1,
  batch_id: 1,
  quantity: 2,
  price: 100,
  subtotal: 200,
};
