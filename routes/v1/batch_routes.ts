import { handlerFolder, routePrefix } from "./constant";

export const handlerFilePath = require("path").join(
  __dirname,
  `${handlerFolder}/batch_controller`
);

export const routes = [
  {
    method: "get",
    endPoint: "batches/:product_id",
    handler: "getAllBatchesByProduct",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
  {
    method: "post",
    endPoint: "batches",
    handler: "createBatch",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
  {
    method: "put",
    endPoint: "batches/nft",
    handler: "updateBatchNFT",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
  {
    method: "post",
    endPoint: "batches/attest",
    handler: "attestBatchByAdmin",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
];
