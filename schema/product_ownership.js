import { collectionNames } from "../configServer";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const productOwnershipSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  transfer_otp: { type: STRING },
  status: { type: STRING },
  owner_level: { type: INTEGER },
  nft_transaction_hash: { type: STRING },
};

export default function (app) {
  const product_ownership = app.sequelizeClient.define(
    collectionNames.PRODUCT_OWNERSHIP,
    productOwnershipSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.PRODUCT_OWNERSHIP, product_ownership);
}
