import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import { _createOrder, _getOrderById } from "../service/order_service";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      body: { items, shipping_address },
      user,
    } = req as any;

    // Validate input
    const validatedPayload = await Joi.object()
      .required()
      .keys({
        items: Joi.array()
          .items(
            Joi.object().keys({
              product_id: Joi.number().integer().positive().required(),
              quantity: Joi.number().integer().positive().required(),
            })
          )
          .min(1)
          .required(),
        shipping_address: Joi.object().optional(),
      })
      .validateAsync({ items, shipping_address });

    // Get user ID from authenticated user
    if (!user || !user.id) {
      return res.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const result = await _createOrder(user.id, validatedPayload);

    return res.send({
      success: true,
      message: "Order created successfully",
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const {
      params: { order_id },
      user,
    } = req as any;

    // Validate input
    const { order_id: validatedOrderId } = await Joi.object()
      .required()
      .keys({
        order_id: Joi.number().integer().positive().required(),
      })
      .validateAsync({ order_id });

    // Get user ID from authenticated user
    if (!user || !user.id) {
      return res.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const result = await _getOrderById(user.id, validatedOrderId);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};
