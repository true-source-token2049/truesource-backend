import statusCodesHelper from "../helpers/statusCodesHelper";
import { handleCatch } from "../helpers/errorReporter";
import _ from "lodash";
import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction): void => {
  const { method, body, headers, files } = req;

  let origin = _.get(headers, "origin", "");
  if (!_.isEmpty(origin) && origin.startsWith("http")) {
    origin = origin.split("//")[1];
  }
  _.set(req, "headers.origin", origin);

  if (files) {
    console.log(files);
  }

  if (
    method === "POST" &&
    Object.keys(body).length > 0 &&
    headers["content-type"] !== "application/json"
  ) {
    handleCatch(
      req,
      res,
      { message: "Content-Type Header Missing", error: "Bad Request" },
      statusCodesHelper.BAD_REQUEST
    );
  } else {
    next();
  }
};
