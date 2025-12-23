// src/schemas/resume-data-schema.ts
import { z } from "zod";

const headerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  github: z.string(),
  linkedin: z.string(),
  portfolio: z.string(),
});

const workContentSchema = z.object({
  items: z.array(
    z.object({
      heading: z.string(),
      subheading: z.string(),
      meta: z.string(),
      bullets: z.array(z.string()),
      links: z.array(
        z.object({
          label: z.string(),
          url: z.string(),
        })
      ),
    })
  ),
});

const skillsContentSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      items: z.array(z.string()),
    })
  ),
});

const educationContentSchema = z.object({
  items: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      duration: z.string(),
      gpa: z.string(),
      details: z.array(z.string()),
    })
  ),
});

const genericContentSchema = z.object({
  text: z.string().optional(),
  items: z.array(z.string()).optional(),
});

// ✅ USE DISCRIMINATED UNION (Proper Zod way)
const sectionSchema = z.discriminatedUnion("type", [
  // Experience
  z.object({
    type: z.literal("experience"),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    content: workContentSchema,
  }),
  // Projects
  z.object({
    type: z.literal("projects"),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    content: workContentSchema,
  }),
  // Skills
  z.object({
    type: z.literal("skills"),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    content: skillsContentSchema,
  }),
  // Education
  z.object({
    type: z.literal("education"),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    content: educationContentSchema,
  }),
  // Summary
  z.object({
    type: z.literal("summary"),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    content: z.object({ text: z.string() }),
  }),
  // Achievements
  z.object({
    type: z.literal("achievements"),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    content: z.object({ items: z.array(z.string()) }),
  }),
  // Certifications
  z.object({
    type: z.literal("certifications"),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    content: z.object({ items: z.array(z.string()) }),
  }),
]);

export const resumeDataSchema = z.object({
  header: headerSchema,
  sections: z.array(sectionSchema),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;
