import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "@sequelize/core";
import { sequelize } from "../config/db.ts";

export interface ResumeMetadata {
  tokensUsed?: number;
  costUsd?: number;
  model?: string;
  generationDuration?: number; 
  fileSize?: number; 
  format?: 'pdf' | 'docx' | 'txt';
  customizations?: {
    template?: string;
    colorScheme?: string;
    fontFamily?: string;
  };
  telegramFileId?: string;
  errorDetails?: string;
  [key: string]: unknown;
}

export class ResumeGeneration extends Model<
  InferAttributes<ResumeGeneration>,
  InferCreationAttributes<ResumeGeneration>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare jobDescription: string;
  declare filePath: string | null;
  declare metadata: ResumeMetadata;
  declare createdAt: CreationOptional<Date>;
}

ResumeGeneration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jobDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    filePath: DataTypes.STRING(500),
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "resume_generations",
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

ResumeGeneration.sync({force:false});