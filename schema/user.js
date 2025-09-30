import { collectionNames } from "../configserver";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const userSchema = {
  /**
   * uc 1-n brl_id -
   * uc 1-n user_id
   *  */

  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  email: { type: STRING, allowNull: false },
  phonenumber: { type: STRING },
  oauth_token: { type: STRING },
  name: { type: STRING },
  username: { type: STRING, unique: true },
  profile_icon: { type: STRING },
  wallet_address: { type: STRING },
  alchemy_user_id: { type: STRING },
};

export default function (app) {
  const user = app.sequelizeClient.define(collectionNames.USER, userSchema, {
    paranoid: true,
  });
  addInstance(collectionNames.USER, user);
}
