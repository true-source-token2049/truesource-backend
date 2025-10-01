import { FLOAT, INTEGER } from "sequelize";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { collectionNames } from "../configserver";

const orderItemSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  order_id: {
    type: INTEGER,
    allowNull: false,
  },
  product_id: {
    type: INTEGER,
    allowNull: false,
  },
  batch_id: {
    type: INTEGER,
    allowNull: true,
  },
  quantity: {
    type: INTEGER,
    allowNull: false,
  },
  price: {
    type: FLOAT(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: FLOAT(10, 2),
    allowNull: false,
  },
};

export default function (app) {
  const orderItems = app.sequelizeClient.define(
    collectionNames.ORDER_ITEMS,
    orderItemSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.ORDER_ITEMS, orderItems);
}
