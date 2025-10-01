import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import {
  _createProduct,
  _getAllProducts,
  _getProductById,
} from "../service/product_service";

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

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      body: { payload },
    } = req;

    Joi.object()
      .keys({
        title: Joi.string().required(),
        brand: Joi.string().required(),
        category: Joi.string().optional(),
        sub_category: Joi.string().optional(),
        description: Joi.string().required(),
        plain_description: Joi.string().required(),
        price: Joi.string().required(),
        attrs: Joi.array()
          .items(
            Joi.object().keys({
              name: Joi.string().required(),
              value: Joi.string().required(),
              type: Joi.string().required(),
            })
          )
          .optional(),
        assets: Joi.array()
          .items(
            Joi.object().keys({
              url: Joi.string().uri().required(),
              view: Joi.string().required(),
              type: Joi.string().required(),
            })
          )
          .optional(),
      })
      .validateAsync(payload)
      .then((_payload) => {
        return _createProduct(_payload);
      });
  } catch (e) {}
};
