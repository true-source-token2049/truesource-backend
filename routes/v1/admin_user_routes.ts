import { handlerFolder, routePrefix } from "./constant";

export const handlerFilePath = require("path").join(
  __dirname,
  `${handlerFolder}/admin_user_controller`
);

export const routes = [
  {
    method: "post",
    endPoint: "login",
    handler: "loginAdmin",
    routePrefix: routePrefix.adminRoute,
  },
  {
    method: "get",
    endPoint: "",
    middleware: ["isAdminUser"],
    handler: "getAdminDetail",
    routePrefix: routePrefix.adminRoute,
  },
];
