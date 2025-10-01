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

export const cloudinaryConfig = {
  name: process.env.CLOUDINARY_CONFIG_NAME,
  apiKey: process.env.CLOUDINARY_CONFIG_APIKEY,
  apiSecret: process.env.CLOUDINARY_CONFIG_APISECRET,
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

export const jsonWebTokenConfig = {
  admin_access: "admin_key",
  admin_refresh: "admin_refresh_key",
  customer_access: "customer_access_key",
  customer_refresh: "customer_refersh_key",
};

export const TOKEN_EXPIRATION = {
  access: 3600, // 1 hour
  refresh: 2592000, // 30 days
};

export const JWT_SHARED_VERSION = process.env.JWT_SHARED_VERSION;

export const routePrefixV1 = {
  openRoute: "/api/v1",
  adminRoute: "/api/v1/admin",
  brandRoute: "/api/v1/brand",
  userRoute: "/api/v1/user",
};

export const whitelist: { urls: string[] } = {
  urls: ["localhost:3000", "truesource-admin-frontend-azgq.vercel.app"],
};

export const NEXT_PUBLIC_ALCHEMY_API_KEY =
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
export const NEXT_PUBLIC_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const PINATA_API_KEY = process.env.PINATA_API_KEY;
export const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
export const PINATA_ACCESS_TOKEN = process.env.PINATA_ACCESS_TOKEN;
