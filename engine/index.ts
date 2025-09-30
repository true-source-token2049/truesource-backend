import { join } from "path";
import { engineImport } from "./engineHelper";
import { ExpressApp } from "../type";

export default (app: ExpressApp) => {
  // Initialise Schema
  engineImport(app, join(__dirname, "../schema"));
  // Initialise Routes
  engineImport(app, join(__dirname, "../routes/v1"), true);
};
