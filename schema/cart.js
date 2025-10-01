import { collectionNames } from "../configserver";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { INTEGER, DECIMAL } from "sequelize";

const cartSchema = {
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
  product_id: {
    type: INTEGER,
    allowNull: false,
  },
  quantity: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DECIMAL(10, 2),
    allowNull: false,
  },
};

export default function (app) {
  const cart = app.sequelizeClient.define(collectionNames.CART, cartSchema, {
    paranoid: true,
  });
  addInstance(collectionNames.CART, cart);
}
