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
    endPoint: "batches/block/add",
    handler: "addBlockToBatch",
    routePrefix: routePrefix.adminRoute,
    middleware: ["isAdminUser"],
  },
  {
    method: "get",
    endPoint: "verify/:authcode",
    handler: "verifyAuthCode",
    routePrefix: routePrefix.userRoute,
  },
  {
    method: "get",
    endPoint: "token/:authcode",
    handler: "getNFTTokenId",
    routePrefix: routePrefix.userRoute,
  },
  {
    method: "get",
    endPoint: "nft",
    handler: "getUserNFTs",
    middleware: ["isCustomer"],
    routePrefix: routePrefix.userRoute,
  },
  {
    method: "post",
    endPoint: "claim/:authcode",
    handler: "claimNFT",
    middleware: ["isCustomer"],
    routePrefix: routePrefix.userRoute,
  },
];
