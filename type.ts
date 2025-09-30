import { Application } from "express";
import { Sequelize } from "sequelize";

export interface ExpressApp extends Application {
  sequelizeClient: Sequelize;
}

declare global {
  namespace Express {}
}
