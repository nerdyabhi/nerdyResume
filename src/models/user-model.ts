import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "@sequelize/core";

import { sequelize } from "../config/db.ts";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare telegramId: number;
  declare username: string | null;
  declare firstName: string | null;
  declare lastName: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    telegramId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "users",
    underscored: true,
    timestamps: true,
  }
);

User.sync({ force: false });
