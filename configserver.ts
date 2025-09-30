export const PORT = process.env.PORT;
export const collectionNames = {};

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
