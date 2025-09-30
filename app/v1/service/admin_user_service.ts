import { Model } from "sequelize";
import { collectionNames, jsonWebTokenConfig } from "../../../configserver";
import { sha256Digest, verifyPassword } from "../helpers/cryptoHelper";
import { getInstance } from "../helpers/databaseStorageHelper";
import { createToken } from "../helpers/jwtHelper";

interface AdminUser {
  email: string;
  name: string;
  password: string;
}

export const _loginAdmin = async (payload: Omit<AdminUser, "name">) => {
  let isCorrectCredential = false;

  try {
    const AdminUser = getInstance(collectionNames.ADMIN_USER);
    // @ts-ignore
    const adminUser = await AdminUser.findOne({
      where: { email: payload.email },
      raw: true,
    });

    if (adminUser?.password?.startsWith("$argon2id$"))
      isCorrectCredential = await verifyPassword(
        adminUser.password,
        payload.password
      );
    else if (adminUser.password === sha256Digest(payload.password)) {
      isCorrectCredential = true;
    }

    if (isCorrectCredential) {
      const [access_token, refresh_token] = await Promise.all([
        createToken(
          {
            email: adminUser.email,
            id: adminUser.id,
            type: adminUser.type,
          },
          jsonWebTokenConfig["admin_access"]
        ),
        createToken(
          {
            email: adminUser.email,
            id: adminUser.id,
            type: adminUser.type,
          },
          jsonWebTokenConfig["admin_refresh"]
        ),
      ]);
      return {
        message: "User Succesfully logged In",
        token: {
          access: access_token,
          refresh: refresh_token,
        },
      };
    }
  } catch (e) {}
};

export const _getAdminUserById = async (id: number) => {
  try {
    const AdminUser = getInstance(collectionNames.ADMIN_USER);
    //@ts-ignore
    const adminUser = await AdminUser.findOne({
      where: { id },
      attributes: ["email", "id", "type"],
    });
    if (!adminUser) {
      throw { message: "Admin User not found" };
    }
    return adminUser;
  } catch (e) {
    throw e;
  }
};
