import { Request, Response } from "express";
import Joi from "joi";
import { handleCatch } from "../helpers/errorReporter";
import {
  _addBlockToBatch,
  _attestBatchByAdmin,
  _claimNFT,
  _createBatch,
  _getAllBatchesByProduct,
  _getNFTTokenId,
  _getUserNFTs,
  _updateBatchNFT,
  _verifyAuthCode,
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
    _payload.available_units = _payload.total_units;
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

export const addBlockToBatch = async (req: Request, res: Response) => {
  try {
    const {
      meta: { type } = {} as Meta,
      body: { payload },
    } = req;

    const _payload = await Joi.object()
      .keys({
        note: Joi.string().trim().required(),
        type: Joi.string().required(),
        transaction_hash: Joi.string().required(),
        batch_id: Joi.number().required(),
      })
      .validateAsync(payload);

    const result = await _addBlockToBatch(_payload);

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

export const verifyAuthCode = async (req: Request, res: Response) => {
  try {
    const {
      params: { authcode },
    } = req;

    const validatedobj = await Joi.object()
      .keys({
        authcode: Joi.string().trim().required(),
      })
      .validateAsync({ authcode });

    const result = await _verifyAuthCode(authcode);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const getNFTTokenId = async (req: Request, res: Response) => {
  try {
    const {
      params: { authcode },
    } = req;

    const validatedobj = await Joi.object()
      .keys({
        authcode: Joi.string().trim().required(),
      })
      .validateAsync({ authcode });

    const result = await _getNFTTokenId(authcode);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const getUserNFTs = async (req: Request, res: Response) => {
  try {
    const { user: { id } = {} as Meta } = req;

    const result = await _getUserNFTs(id);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const claimNFT = async (req: Request, res: Response) => {
  try {
    const {
      params: { authcode },
      body: { payload },
      user = {} as Meta,
    } = req;

    const { hash: _validatedHash } = await Joi.object()
      .keys({
        hash: Joi.string().trim().required(),
      })
      .validateAsync(payload);

    const result = await _claimNFT(authcode, _validatedHash, user.id);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};
