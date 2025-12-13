import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "@sequelize/core";
import { sequelize } from "../config/db.ts";

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  technologies?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProfileLinks {
  github?: string;
  leetcode?: string;
  hackerrank?: string;
  huggingface?: string;
  geeksforgeeks?: string;
  kaggle?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
  description?: string;
}

export class UserProfile extends Model<
  InferAttributes<UserProfile>,
  InferCreationAttributes<UserProfile>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare fullName: string | null;
  declare email: string | null;
  declare phone: string | null;
  declare summary: string | null;
  declare experiences: Experience[];
  declare education: Education[];
  declare skills: string[];
  declare achievements: string[];
  declare projects: Project[];
  declare profileLinks: ProfileLinks | null;
  declare linkedinUrl: string | null;
  declare githubUrl: string | null;
  declare isComplete: boolean;
  declare updatedAt: CreationOptional<Date>;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    fullName: DataTypes.STRING(255),
    email: DataTypes.STRING(255),
    phone: DataTypes.STRING(50),
    summary: DataTypes.TEXT,
    experiences: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    education: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    achievements: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    projects: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    profileLinks: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    linkedinUrl: DataTypes.STRING(500),
    githubUrl: DataTypes.STRING(500),
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "user_profiles",
    underscored: true,
    timestamps: true,
    createdAt: false,
  }
);

UserProfile.sync({ alter: true });
