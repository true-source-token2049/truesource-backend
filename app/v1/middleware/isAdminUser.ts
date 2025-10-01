import { NextFunction, Request, Response } from "express";
import { jsonWebTokenConfig } from "../../../configserver";
import { Meta } from "../../../type";
import { handleCatch } from "../helpers/errorReporter";
import { checkToken } from "../helpers/jwtHelper";
import statusCodesHelper from "../helpers/statusCodesHelper";

export default (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("last-updated", new Date().toUTCString());
  res.setHeader("Last-Updated", new Date().toUTCString());
  const { headers } = req;
  if (
    !headers ||
    !headers.authorization ||
    !headers.authorization.startsWith("Bearer ")
  ) {
    return res.status(statusCodesHelper.UNAUTHORIZED).json({
      error: { message: "Not Authorized for this request" },
    });
  } else {
    let token = headers.authorization.slice(7);
    if (!token) {
      return handleCatch(
        req,
        res,
        {
          message: "Not Authorized for this request",
          name: "BadRequestError",
        },
        statusCodesHelper.UNAUTHORIZED
      );
    } else {
      checkToken(token, jsonWebTokenConfig.admin_access)
        .then((_data) => {
          const data = _data as Meta;

          if (data) {
            // If data is pending and the route is not for approval, return pending status

            req.meta = data;

            next();
          } else {
            return handleCatch(
              req,
              res,
              {
                message: "Not Authorized for this request",
                name: "BadRequestError",
              },
              statusCodesHelper.UNAUTHORIZED
            );
          }
        })
        .catch((err) => {
          console.log("err", err);
          return handleCatch(
            req,
            res,
            { message: err.message, name: "JWTParseError" },
            statusCodesHelper.UNAUTHORIZED
          );
        });
    }
  }
};
