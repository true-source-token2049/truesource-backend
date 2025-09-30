import { collectionNames } from "../configServer";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const productSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  title: {
    type: STRING,
    allowNull: false,
  },
  brand: {
    type: STRING,
  },
  category: {
    type: STRING,
  },
  sub_category: {
    type: STRING,
  },
  description: {
    type: TEXT,
    allowNull: false,
  },
  plain_description: {
    type: TEXT,
    allowNull: false,
  },
  price: {
    type: INTEGER,
    allowNull: false,
  },
};

export default function (app) {
  const product = app.sequelizeClient.define(
    collectionNames.PRODUCT,
    productSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.PRODUCT, product);
}
