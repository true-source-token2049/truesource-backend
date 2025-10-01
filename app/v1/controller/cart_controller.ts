import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import { _addToCart, _getCartSummary } from "../service/cart_service";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const {
      body: { productId, qty },
      user,
    } = req as any;

    // Validate input
    const { productId: validatedProductId, qty: validatedQty } =
      await Joi.object()
        .required()
        .keys({
          productId: Joi.number().integer().positive().required(),
          qty: Joi.number().integer().positive().required(),
        })
        .validateAsync({ productId, qty });

    // Get user ID from authenticated user
    if (!user || !user.id) {
      return res.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const result = await _addToCart(user.id, validatedProductId, validatedQty);

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
