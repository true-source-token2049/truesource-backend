import { Request, Response } from "express";
import { createError, handleCatch } from "../helpers/errorReporter";
import Joi from "joi";
import { _getAdminUserById, _loginAdmin } from "../service/admin_user_service";
import { Meta } from "../../../type";

export const getAdminDetail = (req: Request, res: Response) => {
  const { meta: { id } = {} as Meta } = req;

  _getAdminUserById(id)
    .then((result) => res.send({ success: true, result }))
    .catch((error) => {
      return handleCatch(req, res, error);
    });
};

export const loginAdmin = (req: Request, res: Response) => {
  const {
    body: { payload },
  } = req;

  if (!payload) {
    return res.send({
      status: false,
      error: createError("payload is required in body"),
    });
  }

  Joi.object()
    .required()
    .keys({
      email: Joi.string().email().trim().lowercase().required(),
      password: Joi.string().trim().required(),
    })
    .validateAsync(payload)
    .then((_payload) => {
      return _loginAdmin(_payload);
    })
    .then((result) => res.send({ success: true, result }))
    .catch((error) => {
      return handleCatch(req, res, error);
    });
};
