import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";
import { _clearCart } from "./cart_service";
import { getRandom } from "../helpers/cryptoHelper";

// Singapore GST rate (9% as of 2024)
const SINGAPORE_GST_RATE = 0.09;

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  shipping_address?: any;
}

export interface OrderResponse {
  order_id: number;
  order_number: string;
  status: string;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  created_at: Date;
}

export const _createOrder = async (
  userId: number,
  payload: CreateOrderPayload
): Promise<OrderResponse> => {
  const sequelize = getInstance(collectionNames.PRODUCT).sequelize;
  const transaction = await sequelize.transaction();

  try {
    const Product = getInstance(collectionNames.PRODUCT);
    const Batches = getInstance(collectionNames.BATCHES);
    const Orders = getInstance(collectionNames.ORDERS);
    const OrderItems = getInstance(collectionNames.ORDER_ITEMS);
    const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItemsData: Array<{
      product_id: number;
      product_name: string;
      quantity: number;
      price: number;
      subtotal: number;
      batch_id?: number;
      batchAllocations: Array<{
        batch_id: number;
        quantity: number;
        rangeLogs: any[];
      }>;
    }> = [];

    for (const item of payload.items) {
      // Get product details
      const product = await Product.findOne({
        where: { id: item.product_id },
        transaction,
      });

      if (!product) {
        await transaction.rollback();
        throw {
          error: "Bad Request",
          message: `Product with ID ${item.product_id} not found`,
        };
      }

      // Check inventory availability
      const batches = await Batches.findAll({
        where: { product_id: item.product_id },
        order: [["createdAt", "ASC"]],
        transaction,
      });

      let remainingQuantity = item.quantity;
      let totalAvailable = 0;

      // Calculate total available units
      for (const batch of batches) {
        totalAvailable += batch.available_units || 0;
      }

      if (totalAvailable < item.quantity) {
        await transaction.rollback();
        throw {
          error: "Insufficient Inventory",
          message: `Product "${product.title}" has only ${totalAvailable} units available, but ${item.quantity} requested`,
        };
      }

      // Deduct from batches (FIFO - First In First Out) and track batch_range_logs
      let selectedBatchId = null;
      const batchAllocations: Array<{
        batch_id: number;
        quantity: number;
        rangeLogs: any[];
      }> = [];

      for (const batch of batches) {
        if (remainingQuantity <= 0) break;

        const availableInBatch = batch.available_units || 0;
        if (availableInBatch > 0) {
          const deductAmount = Math.min(remainingQuantity, availableInBatch);

          // Get available batch_range_logs for this batch
          const availableBatchRangeLogs = await BatchRangeLog.findAll({
            where: {
              batch_id: batch.id,
              order_item_id: null, // Only get unallocated logs
            },
            limit: deductAmount,
            transaction,
          });

          // Verify we have enough batch_range_logs
          if (availableBatchRangeLogs.length < deductAmount) {
            await transaction.rollback();
            throw {
              error: "Insufficient Inventory",
              message: `Batch ${batch.id} does not have enough available units (expected ${deductAmount}, found ${availableBatchRangeLogs.length})`,
            };
          }

          // Update batch available_units
          batch.available_units = availableInBatch - deductAmount;
          await batch.save({ transaction });

          remainingQuantity -= deductAmount;

          // Track batch allocations with their range logs
          batchAllocations.push({
            batch_id: batch.id,
            quantity: deductAmount,
            rangeLogs: availableBatchRangeLogs,
          });

          // Use first batch for reference
          if (!selectedBatchId) {
            selectedBatchId = batch.id;
          }
        }
      }

      const itemSubtotal = parseFloat(product.price) * item.quantity;
      subtotal += itemSubtotal;

      orderItemsData.push({
        product_id: item.product_id,
        product_name: product.title,
        quantity: item.quantity,
        price: parseFloat(product.price),
        subtotal: parseFloat(itemSubtotal.toFixed(2)),
        batch_id: selectedBatchId,
        batchAllocations,
      });
    }

    // Calculate tax and total
    const taxAmount = subtotal * SINGAPORE_GST_RATE;
    const totalAmount = subtotal + taxAmount;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${getRandom().substring(0, 6)}`;

    // Create order
    const order = await Orders.create(
      {
        user_id: userId,
        order_number: orderNumber,
        status: "pending",
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        shipping_address: payload.shipping_address || null,
      },
      { transaction }
    );
    console.log("order", order);
    // Create order items and link batch_range_logs
    for (const itemData of orderItemsData) {
      const orderItem = await OrderItems.create(
        {
          order_id: order.id,
          product_id: itemData.product_id,
          batch_id: itemData.batch_id,
          quantity: itemData.quantity,
          price: itemData.price,
          subtotal: itemData.subtotal,
        },
        { transaction }
      );

      // Link batch_range_logs to this order_item
      for (const allocation of itemData.batchAllocations) {
        for (const rangeLog of allocation.rangeLogs) {
          rangeLog.order_item_id = orderItem.id;
          // rangeLog.user_id = userId;
          await rangeLog.save({ transaction });
        }
      }
    }

    // Commit transaction
    await transaction.commit();

    // Clear user's cart (optional - based on business logic)
    // await _clearCart(userId);

    return {
      order_id: order.id,
      order_number: order.order_number,
      status: order.status,
      items: orderItemsData.map(({ batch_id, ...rest }) => rest),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      created_at: order.createdAt,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const _getOrderById = async (
  userId: number,
  orderId: number
): Promise<OrderResponse> => {
  try {
    const Orders = getInstance(collectionNames.ORDERS);
    const OrderItems = getInstance(collectionNames.ORDER_ITEMS);
    const Product = getInstance(collectionNames.PRODUCT);

    const order = await Orders.findOne({
      where: { id: orderId, user_id: userId },
      include: [
        {
          model: OrderItems,
          include: [
            {
              model: Product,
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw {
        error: "Not Found",
        message: "Order not found",
      };
    }

    const items = order.order_items.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product?.title || "Unknown Product",
      quantity: item.quantity,
      price: parseFloat(item.price),
      subtotal: parseFloat(item.subtotal),
    }));

    return {
      order_id: order.id,
      order_number: order.order_number,
      status: order.status,
      items,
      subtotal: parseFloat(order.subtotal),
      tax_amount: parseFloat(order.tax_amount),
      total_amount: parseFloat(order.total_amount),
      created_at: order.createdAt,
    };
  } catch (error) {
    throw error;
  }
};
