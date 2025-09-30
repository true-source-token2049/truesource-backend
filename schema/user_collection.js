import { collectionNames } from "../configServer";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const userCollectionSchema = {
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
  status: {
    type: STRING,
    allowNull: false,
  },
  source: {
    type: STRING,
    allowNull: false,
  },
  nft_transaction_hash: {
    type: STRING,
    allowNull: false,
  },
  asset_link: {
    type: STRING,
    allowNull: false,
  },
};

export default function (app) {
  const schema = app.sequelizeClient.define(
    collectionNames.USER_COLLECTION,
    userCollectionSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.USER_COLLECTION, schema);
}
