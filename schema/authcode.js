import { collectionNames } from "../configServer";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const authcodeSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  authcode: {
    type: STRING,
    allowNull: false,
  },
  url: {
    type: STRING,
    allowNull: false,
  },
};

export default function (app) {
  const authcodes = app.sequelizeClient.define(
    collectionNames.AUTCHODES,
    authcodeSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.AUTCHODES, authcodes);
}
