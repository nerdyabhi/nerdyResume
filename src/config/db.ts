import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import "dotenv/config";

export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  url: process.env.PG_CONNECTION_STRING!,
  ssl: true,
});

await sequelize.authenticate();
console.log("Database connected successfully");
