import { collectionNames } from "../configServer";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const productAssetSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  url: {
    type: STRING,
    allowNull: false,
  },
  view: {
    type: STRING,
    allowNull: false,
    defaultValue: "Default",
  },
  type: {
    type: STRING,
    allowNull: false,
    defaultValue: "text",
  },
};

export default function (app) {
  const product_assets = app.sequelizeClient.define(
    collectionNames.PRODUCT_ASSETS,
    productAssetSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.product_assets, product_assets);
}
