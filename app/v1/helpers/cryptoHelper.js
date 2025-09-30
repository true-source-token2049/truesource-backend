import crypto, { createHash } from "crypto";
import argon2 from "argon2";

export const sha256Digest = (value) => {
  return createHash("sha256").update(value).digest("hex");
};

export const createArgonHash = (value) => argon2.hash(value);

export const verifyPassword = (hash, plainPassword) =>
  argon2.verify(hash, plainPassword);

export const getRandom = () => {
  return crypto.randomBytes(128 / 8).toString("hex");
};
