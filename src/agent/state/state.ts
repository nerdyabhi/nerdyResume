// src/agent/state.ts
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  workHistory: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        period: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(),
  profileLinks: z
    .object({
      github: z.string().optional(),
      leetcode: z.string().optional(),
      hackerrank: z.string().optional(),
      huggingface: z.string().optional(),
      geeksforgeeks: z.string().optional(),
      kaggle: z.string().optional(),
      linkedin: z.string().optional(),
      portfolio: z.string().optional(),
    })
    .optional(),
});

const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  description: z.string(),
});

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  duration: z.string(),
  description: z.string().optional(),
});

export const ValidationSchema = z.object({
  isComplete: z.boolean(),
  needsImprovement: z.boolean(),
  missingOrWeak: z.array(z.string()),
  nextQuestion: z.string(),
  reasoning: z.string().optional(),
  extractedProfile: z
    .object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      experience: z.array(ExperienceSchema).optional(),
      education: z.array(EducationSchema).optional(),
      skills: z.array(z.string()).optional(),
      achievements: z.array(z.string()).optional(),
      profileLinks: z
        .object({
          github: z.string().optional(),
          leetcode: z.string().optional(),
          hackerrank: z.string().optional(),
          huggingface: z.string().optional(),
          geeksforgeeks: z.string().optional(),
          kaggle: z.string().optional(),
          linkedin: z.string().optional(),
          portfolio: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Validation = z.infer<typeof ValidationSchema>;

export const StateAnnotation = Annotation.Root({
  userId: Annotation<number>,
  messages: Annotation<string[]>({
    reducer: (state, update) => state.concat(update),
    default: () => [],
  }),
  validation: Annotation<z.infer<typeof ValidationSchema> | null>({
    reducer: (state, update) => update ?? state,
    default: () => null,
  }),
  profile: Annotation<z.infer<typeof ProfileSchema> | null>({
    reducer: (state, update) => update ?? state,
    default: () => null,
  }),
  isComplete: Annotation<boolean>({
    reducer: (state, update) => update ?? state,
    default: () => false,
  }),
  confirmationSummary: Annotation<string | null>({
    reducer: (state, update) => update ?? state,
    default: () => null,
  }),
  needsConfirmation: Annotation<boolean>({
    reducer: (state, update) => update ?? state,
    default: () => false,
  }),
});
export type AgentState = typeof StateAnnotation.State;
