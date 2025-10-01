import { Request, Response } from "express";
import { Meta } from "../../../type";
import { handleCatch } from "../helpers/errorReporter";
import { _getCustomer, _loginCustomer } from "../service/customer_service";
import Joi from "joi";

export const getCustomer = (req: Request, res: Response) => {
  const { user: { id } = {} as Meta } = req;

  _getCustomer(id)
    .then((result) => res.send({ success: true, result }))
    .catch((error) => {
      return handleCatch(req, res, error);
    });
};

export const loginCustomer = async (req: Request, res: Response) => {
  const { payload } = req.body;

  Joi.object()
    .keys({
      userId: Joi.string().required(),
      address: Joi.string().optional(),
      email: Joi.string().email().required(),
      clientAddress: Joi.string().required(),
      solanaAddress: Joi.string().optional(),
      orgId: Joi.string().required(),
      type: Joi.string().required(),
    })
    .validateAsync(payload)
    .then((_payload) => {
      return _loginCustomer(_payload);
    })
    .then((result) => res.send({ success: true, result }))
    .catch((error) => {
      return handleCatch(req, res, error);
    });
};
