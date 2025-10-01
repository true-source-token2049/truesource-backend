import { handlerFolder, routePrefix } from "./constant";

export const handlerFilePath = require("path").join(
  __dirname,
  `${handlerFolder}/cart_controller`
);

export const routes = [
  {
    method: "post",
    endPoint: "cart/add",
    handler: "addToCart",
    routePrefix: routePrefix.userRoute,
    middleware: ["isCustomer"],
  },
  {
    method: "get",
    endPoint: "cart",
    handler: "getCart",
    routePrefix: routePrefix.userRoute,
    middleware: ["isCustomer"],
  },
];
