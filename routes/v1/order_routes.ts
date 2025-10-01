import { handlerFolder, routePrefix } from "./constant";

export const handlerFilePath = require("path").join(
  __dirname,
  `${handlerFolder}/order_controller`
);

export const routes = [
  {
    method: "post",
    endPoint: "order",
    handler: "createOrder",
    routePrefix: routePrefix.userRoute,
    middleware: ["isCustomer"],
  },
  {
    method: "get",
    endPoint: "order/:order_id",
    handler: "getOrder",
    routePrefix: routePrefix.userRoute,
    middleware: ["isCustomer"],
  },
];
