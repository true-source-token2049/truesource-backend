import { collectionNames } from "../configserver";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { INTEGER, STRING, FLOAT, JSONB } from "sequelize";

const orderSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  user_id: {
    type: INTEGER,
    allowNull: false,
  },
  order_number: {
    type: STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: STRING,
    allowNull: false,
    defaultValue: "pending",
  },
  subtotal: {
    type: FLOAT,
    allowNull: false,
  },
  tax_amount: {
    type: FLOAT,
    allowNull: false,
  },
  total_amount: {
    type: FLOAT,
    allowNull: false,
  },
  shipping_address: {
    type: JSONB,
    allowNull: true,
  },
};

export default function (app) {
  const orders = app.sequelizeClient.define(
    collectionNames.ORDERS,
    orderSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.ORDERS, orders);
}
