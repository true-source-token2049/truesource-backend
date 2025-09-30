import { collectionNames } from "../configserver";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const batchSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  start: {
    type: STRING,
    allowNull: false,
  },
  end: {
    type: STRING,
    allowNull: false,
    defaultValue: "default",
  },
  nft_minting_status: {
    type: STRING,
    allowNull: false,
    defaultValue: "text",
  },
  total_units: {
    type: INTEGER,
    allowNull: false,
  },
  uid: {
    type: STRING,
    allowNull: false,
  },
};

export default function (app) {
  const batches = app.sequelizeClient.define(
    collectionNames.BATCHES,
    batchSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.BATCHES, batches);
}
