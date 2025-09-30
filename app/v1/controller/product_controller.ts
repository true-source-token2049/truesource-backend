import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import { _getAllProducts } from "../service/product_service";

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
