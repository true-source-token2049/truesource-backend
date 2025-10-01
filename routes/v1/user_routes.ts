import { handlerFolder, routePrefix } from "./constant";

export const handlerFilePath = require("path").join(
  __dirname,
  `${handlerFolder}/customer_controller`
);

export const routes = [
  {
    method: "get",
    endPoint: "",
    handler: "getCustomer",
    routePrefix: routePrefix.userRoute,
    middleware: ["isCustomer"],
  },
  {
    method: "post",
    endPoint: "login",
    handler: "loginCustomer",
    routePrefix: routePrefix.userRoute,
  },
];
