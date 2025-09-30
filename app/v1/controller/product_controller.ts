import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import { _getAllProducts, _getProductById } from "../service/product_service";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      query: { limit, offset },
    } = req;

    const { limit: _limit, offset: _offset } = await Joi.object()
      .required()
      .keys({
        limit: Joi.number().optional(),
        offset: Joi.number().optional(),
      })
      .validateAsync(
        Object.assign(
          {},
          limit &&
            offset && {
              limit,
              offset,
            }
        )
      );

    const result = await _getAllProducts(_limit, _offset);

    return res.send({ success: true, result });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const {
      params: { product_id },
    } = req;

    const { product_id: id } = await Joi.object()
      .required()
      .keys({
        product_id: Joi.number().required(),
      })
      .validateAsync({ product_id });

    const result = await _getProductById(id);

    return res.send({ success: true, result });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};
