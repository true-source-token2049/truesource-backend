import { collectionNames } from "../configserver";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { INTEGER, DECIMAL } from "sequelize";

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
    type: DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DECIMAL(10, 2),
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
