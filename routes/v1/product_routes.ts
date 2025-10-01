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
  {
    method: "get",
    endPoint: "product/:product_id",
    handler: "getProductById",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
  {
    method: "post",
    endPoint: "product",
    handler: "createProduct",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
  {
    method: "put",
    endPoint: "product/assets/upload",
    handler: "addToCloudinary",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
];
