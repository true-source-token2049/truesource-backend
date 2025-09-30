import { handlerFolder, routePrefix } from "./constant";

export const handlerFilePath = require("path").join(
  __dirname,
  `${handlerFolder}/product_controller`
);

export const routes = [
  {
    method: "get",
    endPoint: "products",
    handler: "getAllProducts",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
];
