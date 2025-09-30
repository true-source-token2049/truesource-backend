import consoleColors from "../enum/consoleColors";
import { getInstance } from "./databaseStorageHelper";
import { collectionNames, NODE_ENV, SLACK_TOKEN } from "../../../configserver";
import axios from "axios";
import { createSlackNotification } from "./slackNotifyHelper";

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

    const err_payload = {
      origin: req.headers.origin,
      requestRoute: req.originalUrl,
      requestMethod: req.method,
      requestHeaders: headers,
      body: req.body,
      params: req.params,
      query: req.query,
    };

    if (!error) {
      logger = true;
      err_payload.errorMessage = "Unable to Find Error";
    } else if (error.error) {
      logger = false;
      err_payload.errorMessage = error.message;
    } else if (error.isJoi) {
      logger = false;
      err_payload.errorMessage = error.message;
    } else {
      logger = true;
      err_payload.errorMessage = error.message;
    }

    console.log(consoleColors.redColor, "ERROR");
    console.log(error?.message);

    if (logger) {
      const slack_payload = createSlackNotification(err_payload, NODE_ENV);
      promises.push([
        axios.post("https://slack.com/api/chat.postMessage", slack_payload, {
          headers: { authorization: `Bearer ${SLACK_TOKEN}` },
        }),
      ]);
    }

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
