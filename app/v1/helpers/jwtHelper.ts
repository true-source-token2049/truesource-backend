import { sign, verify } from "jsonwebtoken";
import { createError } from "./errorReporter";
import { TOKEN_EXPIRATION } from "../../../configserver";

export const createToken = (data: any, secret: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    let expiresIn = TOKEN_EXPIRATION.refresh;
    try {
      if ("type" in data && data.type.includes("access")) {
        expiresIn = TOKEN_EXPIRATION["access"];
      }
      let token = sign(data, secret, {
        expiresIn: expiresIn,
      });
      resolve(token);
    } catch (e) {
      reject(createError("Failed to create JWT", e as Error | string));
    }
  });
};

export const checkToken = async (token: string, secret: string) => {
  return verify(token, secret);
};
