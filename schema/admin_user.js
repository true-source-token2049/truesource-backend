import { collectionNames } from "../configServer";
import { addInstance } from "../app/v1/helpers/databaseStorageHelper";
import { BOOLEAN, INTEGER, STRING, TEXT } from "sequelize";
import { JSONB } from "sequelize";

const adminuserSchema = {
  id: {
    type: INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
  },
  email: {
    type: STRING,
    allowNull: false,
  },
  password: {
    type: STRING,
    allowNull: false,
  },
  type: {
    type: STRING,
    allowNull: false,
  },
};

export default function (app) {
  const schema = app.sequelizeClient.define(
    collectionNames.ADMIN_USER,
    adminuserSchema,
    { paranoid: true }
  );
  addInstance(collectionNames.ADMIN_USER, schema);
}
