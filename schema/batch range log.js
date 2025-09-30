import { collectionNames } from "../configserver";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const batchRangeLogSchema = {
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
  number_of_views: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  nft_token_id: {
    type: STRING,
  },
  nft_transaction_hash: {
    type: STRING,
  },
};

export default function (app) {
  const batch_range_log = app.sequelizeClient.define(
    collectionNames.BATCH_RANGE_LOG,
    batchRangeLogSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.BATCH_RANGE_LOG, batch_range_log);
}
