require("dotenv").config();
import express, { Application } from "express";
import { PORT, postgresConfig } from "./configserver";
import cookieParser from "cookie-parser";
import logger from "morgan";
import path from "path";
import cors from "cors";
import fileUpload from "express-fileupload";
import { Sequelize } from "sequelize";
import consoleColors from "./app/v1/enum/consoleColors";
import sequelizeLogHelper from "./app/v1/helpers/sequelizeLogHelper";

interface ExpressApp extends Application {
  sequelizeClient?: Sequelize;
}

const app: ExpressApp = express();
const port = PORT || "3000";

app.use(logger("dev"));
app.use(express.json({ limit: 5 * 1024 * 1024 }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    safeFileNames: true,
    abortOnLimit: true,
  })
);
app.use(cors());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export const sequelize: Sequelize = new Sequelize(
  postgresConfig.database,
  postgresConfig.username,
  postgresConfig.password,
  {
    host: postgresConfig.host,
    dialect: "postgres",
    logging: sequelizeLogHelper,
    dialectOptions: postgresConfig.dialectOptions,
    define: postgresConfig.define,
  }
);

sequelize.authenticate().then(() => {
  console.log(
    consoleColors.yellowColor,
    `Connect to Postgres at ${postgresConfig.port}`
  );
  app.sequelizeClient = sequelize;

  require("./engine").default(app);
});

module.exports = app;
