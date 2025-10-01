import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";

// Singapore GST rate (9% as of 2024)
const SINGAPORE_GST_RATE = 0.09;

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface CartSummary {
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
}

export const _addToCart = async (
  userId: number,
  productId: number,
  quantity: number
): Promise<CartSummary> => {
  try {
    const Cart = getInstance(collectionNames.CART);
    const Product = getInstance(collectionNames.PRODUCT);

    // Get product details
    const product = await Product.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw {
        error: "Bad Request",
        message: "Product not found",
      };
    }

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity = quantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        price: product.price,
      });
    }

    // Get cart summary
    return await _getCartSummary(userId);
  } catch (error) {
    throw error;
  }
};

export const _getCartSummary = async (userId: number): Promise<CartSummary> => {
  try {
    const Cart = getInstance(collectionNames.CART);
    const Product = getInstance(collectionNames.PRODUCT);

    // Get all cart items for user
    const cartItems = (await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "title", "price"],
        },
      ],
    })) as CartItem[];

    // Calculate summary
    const items = cartItems.map((item: any) => {
      const subtotal = parseFloat(item.price) * item.quantity;
      return {
        id: item.id,
        product_id: item.product_id,
        product_name: item.product?.title || "Unknown Product",
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(subtotal.toFixed(2)),
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = subtotal * SINGAPORE_GST_RATE;
    const totalAmount = subtotal + taxAmount;

    return {
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
    };
  } catch (error) {
    throw error;
  }
};

export const _clearCart = async (userId: number): Promise<void> => {
  try {
    const Cart = getInstance(collectionNames.CART);
    await Cart.destroy({
      where: { user_id: userId },
    });
  } catch (error) {
    throw error;
  }
};
