import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import {
  _attestBatchByAdmin,
  _createBatch,
  _getAllBatchesByProduct,
  _updateBatchNFT,
} from "../service/batch_service";
import { Meta } from "../../../type";

export const getAllBatchesByProduct = async (req: Request, res: Response) => {
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

    const result = await _getAllBatchesByProduct(id);

    return res.send({ success: true, result });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const {
      body: { payload },
    } = req;

    const _payload = await Joi.object()
      .keys({
        start: Joi.string().trim().required(),
        end: Joi.string().trim().required(),
        total_units: Joi.number().optional(),
        uid: Joi.string().trim().required(),
        product_id: Joi.number().required(),
      })
      .validateAsync(payload);

    const result = await _createBatch(_payload);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const updateBatchNFT = async (req: Request, res: Response) => {
  try {
    const {
      body: { payload },
    } = req;

    const _payload = await Joi.object()
      .keys({
        nft_token_ids: Joi.array()
          .required()
          .items(Joi.string().trim().required()),
        nft_transaction_hash: Joi.string().trim().required(),
        batch_id: Joi.number().required(),
      })
      .validateAsync(payload);

    const result = await _updateBatchNFT(_payload);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const attestBatchByAdmin = async (req: Request, res: Response) => {
  try {
    const {
      meta: { type } = {} as Meta,
      body: { payload },
    } = req;

    const _payload = await Joi.object()
      .keys({
        privateKey: Joi.string().trim().required(),
        batch_id: Joi.number().required(),
      })
      .validateAsync(payload);

    const result = await _attestBatchByAdmin(_payload, type);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};
