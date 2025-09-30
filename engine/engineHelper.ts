import consoleColors from "../app/v1/enum/consoleColors";
import * as routeLogger from "../app/v1/helpers/routeLogger";
import fs from "fs";
import path from "path";
import noMiddleware from "../app/v1/middleware/noMiddleware";
import _ from "lodash";
import { setLogger } from "../app/v1/helpers/sequelizeLogHelper";
import { ExpressApp } from "../type";
import { getInstance } from "../app/v1/helpers/databaseStorageHelper";
import { collectionNames } from "../configserver";
import corsMiddleware from "../app/v1/middleware/corsMiddleware";

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
