import {
  ResumeGeneration,
  type ResumeMetadata,
} from "../models/resumeGenerations-model.ts";
import { Op } from "@sequelize/core";

interface CreateResumeData {
  userId: number;
  jobDescription: string;
  filePath?: string;
  metadata?: ResumeMetadata;
}

interface UpdateResumeData {
  jobDescription?: string;
  filePath?: string;
  metadata?: ResumeMetadata;
}

export class ResumeRepository {
  async create(data: CreateResumeData): Promise<ResumeGeneration> {
    return await ResumeGeneration.create({
      userId: data.userId,
      jobDescription: data.jobDescription,
      filePath: data.filePath ?? null,
      metadata: data.metadata ?? {},
    });
  }

  async update(
    id: number,
    data: UpdateResumeData
  ): Promise<ResumeGeneration | null> {
    const resume = await ResumeGeneration.findByPk(id);
    if (!resume) return null;

    return await resume.update(data);
  }

  async getById(id: number): Promise<ResumeGeneration | null> {
    return await ResumeGeneration.findByPk(id);
  }

  async getByUserId(userId: number): Promise<ResumeGeneration[]> {
    return await ResumeGeneration.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async getRecentByUserId(
    userId: number,
    limit: number = 5
  ): Promise<ResumeGeneration[]> {
    return await ResumeGeneration.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  async countByUserId(userId: number): Promise<number> {
    return await ResumeGeneration.count({
      where: { userId },
    });
  }

  async getTotalTokensByUserId(userId: number): Promise<number> {
    const resumes = await ResumeGeneration.findAll({
      where: { userId },
      attributes: ["metadata"],
    });

    return resumes.reduce((sum, r) => sum + (r.metadata?.tokensUsed || 0), 0);
  }

  async getTotalCostByUserId(userId: number): Promise<number> {
    const resumes = await ResumeGeneration.findAll({
      where: { userId },
      attributes: ["metadata"],
    });

    return resumes.reduce((sum, r) => sum + (r.metadata?.costUsd || 0), 0);
  }

  async getTotalCost(): Promise<number> {
    const resumes = await ResumeGeneration.findAll({
      attributes: ["metadata"],
    });

    return resumes.reduce((sum, r) => sum + (r.metadata?.costUsd || 0), 0);
  }

  async canGenerate(userId: number, maxResumes: number = 5): Promise<boolean> {
    const count = await this.countByUserId(userId);
    return count < maxResumes;
  }

  // Get resumes created in last N days
  async getRecentResumes(days: number = 7): Promise<ResumeGeneration[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await ResumeGeneration.findAll({
      where: {
        createdAt: {
          [Op.gte]: date,
        },
      },
      order: [["createdAt", "DESC"]],
    });
  }

  async delete(id: number): Promise<boolean> {
    const resume = await ResumeGeneration.findByPk(id);
    if (!resume) return false;

    await resume.destroy();
    return true;
  }

  async getAverageGenerationDuration(userId?: number): Promise<number> {
    const where = userId ? { userId } : {};
    const resumes = await ResumeGeneration.findAll({
      where,
      attributes: ["metadata"],
    });

    const durations = resumes
      .map((r) => r.metadata?.generationDuration)
      .filter((d): d is number => typeof d === "number");

    if (durations.length === 0) return 0;
    return durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }

  async getByFormat(
    format: "pdf" | "docx" | "txt",
    userId?: number
  ): Promise<ResumeGeneration[]> {
    const resumes = await ResumeGeneration.findAll({
      where: userId ? { userId } : {},
      order: [["createdAt", "DESC"]],
    });

    return resumes.filter((r) => r.metadata?.format === format);
  }
}

export const resumeRepository = new ResumeRepository();
