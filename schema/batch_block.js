import { collectionNames } from "../configServer";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const batchBlockSchema = {
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
  const batch_blok = app.sequelizeClient.define(
    collectionNames.BATCH_BLOCK,
    batchBlockSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.BATCH_BLOCK, batch_blok);
}
