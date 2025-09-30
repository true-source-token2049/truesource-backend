import { collectionNames } from "../configserver";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const productAttributeSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
  value: {
    type: STRING,
    allowNull: false,
  },
  type: {
    type: STRING,
    allowNull: false,
    defaultValue: "text",
  },
};

export default function (app) {
  const product_attributes = app.sequelizeClient.define(
    collectionNames.PRODUCT_ATTRIBUTES,
    productAttributeSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.PRODUCT_ATTRIBUTES, product_attributes);
}
