import { z } from "zod";

const urlField = z.string().optional();

export const resumeDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  linkedin: urlField.optional(),
  github: urlField.optional(),
  portfolio: urlField.optional(),
  
  summary: z.string().optional().describe("2-3 sentence professional summary"),
  
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    location: z.string().optional(),
    duration: z.string(),
    gpa: z.string().optional(),
    coursework: z.array(z.string()).optional(),
  })),
  
  experience: z.array(z.object({
    position: z.string(),      // ← CHANGED: was company
    company: z.string(),       // ← CHANGED: was position  
    location: z.string().optional(),
    duration: z.string(),
    bullets: z.array(z.string()).min(1),
  })).optional(),
  
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),   // ← Used as duration in template
    tech: z.array(z.string()),
    url: urlField.optional(),  // ← Demo/project URL
    github: urlField.optional(), // ← GitHub repo URL
    bullets: z.array(z.string()).optional(),
    duration:z.string().optional()
  })).min(1).describe("Include ALL projects from profile"),
  
  skills: z.object({
    languages: z.array(z.string()).min(1),
    frameworks: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    databases: z.array(z.string()).optional(),  // ← Template uses this
    libraries: z.array(z.string()).optional(),  // ← Template uses this
    concepts: z.array(z.string()).optional(),   // ← Template uses this
  }),
  
  achievements: z.array(z.string()).optional(),
  
  activities: z.array(z.object({
    organization: z.string(),
    role: z.string(),
    duration: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;
