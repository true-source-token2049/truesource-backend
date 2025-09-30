export const PORT = process.env.PORT;
export const collectionNames = {
  PRODUCT: "products",
  PRODUCT_ATTRIBUTES: "product_attrs",
  PRODUCT_ASSETS: "product_assets",
  BATCHES: "batches",
  BATCH_RANGE_LOG: "batch_range_log",
  AUTCHODES: "authcodes",
  BATCH_BLOCK: "batch_block",
  USER: "user",
  USER_COLLECTION: "user_collection",
  PRODUCT_OWNERSHIP: "product_ownership",
  ADMIN_USER: "admin_user",
};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USER: string;
      DB_PASS: string;
      DB_NAME: string;
      DB_HOST: string;
      NODE_ENV: "development" | "production";
      PORT: string;
      SLACK_TOKEN: string;
      JWT_SHARED_VERSION: string;
    }
  }
}

export const postgresConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: 5432,
  pool: {
    handleDisconnects: true,
    max: 40,
    min: 1,
    idle: 10000,
    acquire: 60000,
  },
  define: {
    underscored: false,
    freezeTableName: false,
    version: "lockVersion",
  },
  dialectOptions: {
    supportBigNumbers: true,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

export const jsonWebTokenConfig = {};

export const JWT_SHARED_VERSION = process.env.JWT_SHARED_VERSION;

export const routePrefixV1 = {
  openRoute: "/api/v1",
  brandRoute: "/api/v1/brand",
  userRoute: "/api/v1/user",
};

export const whitelist: { urls: string[] } = {
  urls: ["localhost:3000"],
};
