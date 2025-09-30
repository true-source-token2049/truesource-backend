import { Request, Response } from "express";
import consoleColors from "../enum/consoleColors";

export function createError(message: string, error?: Error | string) {
  return {
    message: message,
    error: error,
  };
}

export function errorLogger(errorObject: { message: string; error: Error }) {
  console.error(
    consoleColors.redColor,
    `ERROR MESSAGE: ${errorObject.message} \nERROR: ${errorObject.error}`
  );
}

export function errorCreator(err: any) {
  if (err.isJoi) {
    let messages = err.details.map((ele: { message: string }) => ele.message);
    err = createError(messages[0], "INVALID PAYLOAD: Check Payload Arguments");
  }
  return err;
}

export const handleCatch = (
  req: Request,
  res: Response,
  error: Error,
  code = 200
) => {
  return new Promise((resolve, reject) => {
    let logger = true;
    const headers = {
        "user-agent": req.headers["user-agent"],
        host: req.headers.host,
        authorization: req.headers.authorization,
      },
      promises: any[] = [];

    console.log(consoleColors.redColor, "ERROR");
    console.log(error?.message);

    Promise.all(promises)
      .then(() => {
        resolve(
          res.status(code).json({ success: false, error: error.message })
        );
      })
      .catch((e) => {
        console.log(consoleColors, e);
        resolve(res.status(code).json({ success: false, error: e.message }));
      });
  });
};
