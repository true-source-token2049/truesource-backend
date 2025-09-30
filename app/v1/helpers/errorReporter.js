import consoleColors from "../enum/consoleColors";
import { getInstance } from "./databaseStorageHelper";
import { collectionNames, NODE_ENV } from "../../../configserver";

export function createError(message, error) {
  return {
    message: message,
    error: error,
  };
}

export function errorLogger(errorObject) {
  console.error(
    consoleColors.redColor,
    `ERROR MESSAGE: ${errorObject.message} \nERROR: ${errorObject.error}`
  );
}

export function errorCreator(err) {
  if (err.isJoi) {
    let messages = err.details.map((ele) => ele.message);
    err = createError(messages[0], "INVALID PAYLOAD: Check Payload Arguments");
  }
  return err;
}

export const handleCatch = (req, res, error, code = 200) => {
  return new Promise((resolve, reject) => {
    let logger = true;
    const headers = {
        "user-agent": req.headers["user-agent"],
        host: req.headers.host,
        authorization: req.headers.authorization,
      },
      promises = [];

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
