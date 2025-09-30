import fs from "fs";
import _ from "lodash";
import path from "path";
import consoleColors from "../app/v1/enum/consoleColors";
import * as routeLogger from "../app/v1/helpers/routeLogger";
import { setLogger } from "../app/v1/helpers/sequelizeLogHelper";
import corsMiddleware from "../app/v1/middleware/corsMiddleware";
import noMiddleware from "../app/v1/middleware/noMiddleware";
import { ExpressApp } from "../type";
import { getInstance } from "../app/v1/helpers/databaseStorageHelper";
import { collectionNames } from "../configserver";

export const engineImport = (
  app: ExpressApp,
  folderPath: string,
  isRoute: boolean = false
) => {
  return new Promise((resolve, reject) => {
    // Import all the files in the routes folder except the constant.js as it does not contain any routes
    const files = fs
      .readdirSync(folderPath)
      .filter(
        (x: string) => !x.includes("constant.ts") && !x.includes("constant.js")
      );

    const promises = files.map((file: string) => {
      file = folderPath + "/" + file;
      return handleFiles(app, file, isRoute);
    });

    // Resolve when all the routes are initialised from all the files
    Promise.all(promises)
      .then(() => {
        if (!isRoute) {
          const Product = getInstance(collectionNames.PRODUCT);
          const ProductAttributes = getInstance(
            collectionNames.PRODUCT_ATTRIBUTES
          );

          const ProductAssets = getInstance(collectionNames.PRODUCT_ASSETS);
          const Batches = getInstance(collectionNames.BATCHES);
          const BatchBlock = getInstance(collectionNames.BATCH_BLOCK);
          const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);

          const ProductOwnership = getInstance(
            collectionNames.PRODUCT_OWNERSHIP
          );
          const AdminUser = getInstance(collectionNames.ADMIN_USER);
          const UserCollection = getInstance(collectionNames.USER_COLLECTION);
          const User = getInstance(collectionNames.USER);

          Product.hasMany(ProductAssets, { foreignKey: "product_id" });
          ProductAssets.belongsTo(Product, { foreignKey: "product_id" });

          Product.hasMany(ProductAttributes, { foreignKey: "product_id" });
          ProductAttributes.belongsTo(Product);

          Product.hasMany(Batches, { foreignKey: "product_id" });
          Batches.belongsTo(Product, { foreignKey: "product_id" });

          Batches.hasMany(BatchBlock, { foreignKey: "batch_id" });
          BatchBlock.belongsTo(Batches, { foreignKey: "batch_id" });

          Product.hasMany(ProductOwnership, { foreignKey: "product_id" });
          Product.hasMany(BatchRangeLog, { foreignKey: "product_id" });

          User.belongsTo(ProductOwnership, { as: "from" });
          User.belongsTo(ProductOwnership, { as: "to" });

          User.hasMany(UserCollection, { foreignKey: "user_id" });
          BatchRangeLog.hasMany(UserCollection, { foreignKey: "brl_id" });

          app.sequelizeClient
            .sync()
            .then(() => {
              setLogger(true);
            })
            .catch((err: Error) => {
              console.log(err);
              reject(err);
            });
        }
        resolve(0);
      })
      .catch(reject);
  });
};

const handleFiles = (app: ExpressApp, filePath: string, isRoute: boolean) => {
  return isRoute
    ? handleRouteFiles(app, filePath)
    : handleSchemaFiles(app, filePath);
};

const handleSchemaFiles = (app: ExpressApp, filePath: string) => {
  return new Promise((resolve, reject) => {
    if (fs.statSync(filePath).isDirectory()) {
      resolve(1);
    } else {
      require(filePath).default(app);
      resolve(0);
    }
  });
};

const handleRouteFiles = (app: ExpressApp, filePath: string) => {
  return new Promise((resolve, reject) => {
    // Import File Route Instance to set all routes
    const routeFileInstance = require(filePath);

    console.log(consoleColors.blackWithWhiteBackground, filePath);

    // Fetch the routes and the controller file that handles these routes
    const routes = routeFileInstance.routes;
    const handlerFileInstance = require(routeFileInstance.handlerFilePath);

    // Setup the routes
    for (let route of routes) {
      let method: "get" | "post" | "put" | "delete" = route.method;
      let endPoint = route.routePrefix + "/" + route.endPoint;
      let handler = handlerFileInstance[route.handler];
      let policies = route.middleware;

      let middleware = [noMiddleware];

      if (_.indexOf(policies, "noCorsMiddleware") === -1) {
        middleware.push(corsMiddleware);
      }

      if (policies) {
        middleware.push(
          ...policies.map(
            (policy: string) =>
              require(path.join(__dirname, `../app/v1/middleware/${policy}`))
                .default
          )
        );
      }

      app[method](endPoint, middleware, handler);
      routeLogger.default(method, endPoint);
    }
    resolve(0);
  });
};
