import {
  UserProfile,
  type Experience,
  type Project,
} from "../models/profile-model.ts";

interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  experiences?: Experience[];
  skills?: string[];
  projects?: Project[];
  linkedinUrl?: string;
  githubUrl?: string;
  isComplete?: boolean;
}

export class ProfileRepository {
  async getByUserId(userId: number): Promise<UserProfile | null> {
    return await UserProfile.findOne({
      where: { userId },
    });
  }

  async create(userId: number): Promise<UserProfile> {
    return await UserProfile.create({
      userId,
      experiences: [],
      skills: [],
      projects: [],
      isComplete: false,
    });
  }

  async update(
    userId: number,
    data: UpdateProfileData
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    return await profile.update(data);
  }

  async addExperience(
    userId: number,
    experience: Experience
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    const updatedExperiences = [...profile.experiences, experience];
    return await profile.update({ experiences: updatedExperiences });
  }

  async updateExperience(
    userId: number,
    index: number,
    experience: Experience
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile || index < 0 || index >= profile.experiences.length)
      return null;

    const experiences = [...profile.experiences];
    experiences[index] = experience;
    return await profile.update({ experiences });
  }

  async removeExperience(
    userId: number,
    index: number
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile || index < 0 || index >= profile.experiences.length)
      return null;

    const experiences = profile.experiences.filter((_, i) => i !== index);
    return await profile.update({ experiences });
  }

  async addSkills(
    userId: number,
    skills: string[]
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    const uniqueSkills = [...new Set([...profile.skills, ...skills])];
    return await profile.update({ skills: uniqueSkills });
  }

  async removeSkill(
    userId: number,
    skill: string
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    const skills = profile.skills.filter((s) => s !== skill);
    return await profile.update({ skills });
  }

  async addProject(
    userId: number,
    project: Project
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    const updatedProjects = [...profile.projects, project];
    return await profile.update({ projects: updatedProjects });
  }

  async updateProject(
    userId: number,
    index: number,
    project: Project
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile || index < 0 || index >= profile.projects.length) return null;

    const projects = [...profile.projects];
    projects[index] = project;
    return await profile.update({ projects });
  }

  async removeProject(
    userId: number,
    index: number
  ): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile || index < 0 || index >= profile.projects.length) return null;

    const projects = profile.projects.filter((_, i) => i !== index);
    return await profile.update({ projects });
  }

  async isComplete(userId: number): Promise<boolean> {
    const profile = await this.getByUserId(userId);
    if (!profile) return false;

    return (
      !!profile.fullName &&
      !!profile.email &&
      profile.experiences.length > 0 &&
      profile.skills.length > 0
    );
  }

  async markComplete(userId: number): Promise<UserProfile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    const isComplete = await this.isComplete(userId);
    return await profile.update({ isComplete });
  }

  async getFullProfile(userId: number): Promise<{
    profile: UserProfile;
    experienceCount: number;
    skillCount: number;
    projectCount: number;
    isComplete: boolean;
  } | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    return {
      profile,
      experienceCount: profile.experiences.length,
      skillCount: profile.skills.length,
      projectCount: profile.projects.length,
      isComplete: profile.isComplete,
    };
  }
}

export const profileRepository = new ProfileRepository();
