import { INTEGER, STRING } from "sequelize";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { collectionNames } from "../configserver";

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
  available_units: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
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
