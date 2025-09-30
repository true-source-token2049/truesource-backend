import { NextFunction, Request, Response } from "express";
import { whitelist } from "../../../configserver";

export default (req: Request, res: Response, next: NextFunction) => {
  const origin = req?.headers?.origin as string;

  const { urls } = whitelist;
  if (urls.indexOf(origin) === -1) {
    return res.status(403).json({ error: "Blocked by CORS" });
  }
  next();
};
