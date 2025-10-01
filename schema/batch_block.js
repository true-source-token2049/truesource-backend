import { INTEGER, STRING } from "sequelize";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { collectionNames } from "../configserver";

const batchBlockSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  manufacturer_transaction_hash: {
    type: STRING,
  },
  retailer_transaction_hash: {
    type: STRING,
  },
  distributor_transaction_hash: {
    type: STRING,
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
