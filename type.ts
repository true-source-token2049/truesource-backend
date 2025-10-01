import { Application } from "express";
import { Sequelize } from "sequelize";

export interface ExpressApp extends Application {
  sequelizeClient: Sequelize;
}

export interface Meta {
  id: number;
  email: string;
  type: string;
}

declare global {
  namespace Express {
    export interface Request {
      meta?: Meta;
      user?: Meta;
      app: ExpressApp;
    }
  }
}
