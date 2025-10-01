import { Request, Response } from "express";
import Joi from "joi";
import { createError, handleCatch } from "../helpers/errorReporter";
import {
  _createProduct,
  _getAllProducts,
  _getProductById,
  uploadToCloudinary,
} from "../service/product_service";
import { UploadedFile } from "express-fileupload";

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

    const _payload = await Joi.object()
      .keys({
        title: Joi.string().trim().required(),
        brand: Joi.string().trim().required(),
        category: Joi.string().trim().optional(),
        sub_category: Joi.string().trim().optional(),
        description: Joi.string().trim().required(),
        plain_description: Joi.string().trim().required(),
        price: Joi.number().required(),
        product_attrs: Joi.array()
          .items(
            Joi.object().keys({
              name: Joi.string().trim().required(),
              value: Joi.string().trim().required(),
              type: Joi.string().trim().required(),
            })
          )
          .optional(),
        product_assets: Joi.array()
          .items(
            Joi.object().keys({
              url: Joi.string().trim().required(),
              view: Joi.string().trim().required(),
              type: Joi.string().trim().required(),
            })
          )
          .optional(),
      })
      .validateAsync(payload);

    const result = await _createProduct(_payload);

    return res.send({
      success: true,
      result,
    });
  } catch (error) {
    return handleCatch(req, res, error);
  }
};

export const addToCloudinary = (
  req: Request & { files: UploadedFile[] },
  res: Response
) => {
  const {
    files,
    query: { type, folder_name, brand_name },
  } = req;

  if (!files || files.length === 0) {
    return res.send({
      status: false,
      error: createError(
        "product image required, to be sent using form data object"
      ),
    });
  }

  // if (!type) {
  //   return res.send({
  //     status: false,
  //     error: createError("type is required as query params"),
  //   });
  // }

  const name = Object.keys(files)[0];
  const image = files[name] as UploadedFile;

  let folder = "";

  if (folder_name && brand_name) {
    folder = `${folder_name}/${brand_name}`;
  }

  if (type) folder += `/${type}`;

  uploadToCloudinary(name, folder, image, image.mimetype)
    .then((_response) => {
      res.send({ status: true, result: { url: _response.secure_url } });
    })
    .catch((err) => {
      handleCatch(req, res, err);
    });
};
