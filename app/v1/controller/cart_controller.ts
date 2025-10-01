import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import { _addToCart, _getCartSummary } from "../service/cart_service";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const {
      body: {
        payload: { product_id, product_batch_id, quantity },
      },
    } = req as any;

    // Validate input
    const {
      product_id: validatedProductId,
      product_batch_id: validatedProductBatchId,
      quantity: validatedQty,
    } = await Joi.object()
      .required()
      .keys({
        product_id: Joi.number().integer().positive().required(),
        product_batch_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      })
      .validateAsync({ product_id, product_batch_id, quantity });

    // Use a guest user ID (0) for unauthenticated users
    // In production, you might want to use session IDs or other tracking
    const userId = 0; // Guest user

    const result = await _addToCart(userId, validatedProductId, validatedQty);

    return res.send({
      success: true,
      message: "Item added to cart successfully",
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const { user } = req as any;

    // Get user ID from authenticated user
    if (!user || !user.id) {
      return res.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const result = await _getCartSummary(user.id);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};
