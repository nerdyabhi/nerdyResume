import { tool } from "@langchain/core/tools";
import { gpt4o, openAiLLM } from "../../config/llm.ts";
import { latexToPDF } from "../latex-to-pdf.ts";
import z from "zod";
import { getResumeTemplate } from "../../templates/resume-templates.ts";
import { resumeDataSchema } from "../../schemas/resume-data-schema.ts";
import { improveResumeDesign } from "./resume-validtor.ts";

export const generateResumePDFTool = tool(
  async ({ userProfile, jobDescription, templateId }) => {
    try {
      console.log("🔧 Generating resume PDF with template:", templateId);

      const resumeData = await generateResumeData(userProfile, jobDescription);

      const rawLatexCode = getResumeTemplate(resumeData, templateId);
      const latexCode = await improveResumeDesign(rawLatexCode);

      if (
        !latexCode.includes("\\begin{document}") ||
        !latexCode.includes("\\end{document}")
      ) {
        throw new Error("Generated LaTeX is missing document environment");
      }

      const pdfBuffer = await latexToPDF(latexCode);
      const base64Pdf = pdfBuffer.toString("base64");

      return JSON.stringify({
        success: true,
        message: "Resume generated successfully!",
        pdfData: base64Pdf,
        fileName: `resume_${Date.now()}.pdf`,
      });
    } catch (error) {
      console.error("generateResumePDFTool error:", error);
      return JSON.stringify({
        success: false,
        error: (error as Error).message,
      });
    }
  },
  {
    name: "generate_resume_pdf",
    description:
      "Generate a tailored resume PDF. You MUST pass templateId (1-5).",
    schema: z.object({
      userProfile: z
        .string()
        .describe("JSON string of user profile from get_user_profile tool"),
      jobDescription: z
        .string()
        .describe("The job description text (can be empty)"),
      templateId: z.number().describe("Template number: 1, 2, 3, 4, or 5"),
    }),
  }
);

async function generateResumeData(
  profileJson: string,
  jobDescription: string
): Promise<z.infer<typeof resumeDataSchema>> {
  let profile;
  try {
    profile = JSON.parse(profileJson);
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }

  // ✅ Enhanced prompt with explicit URL extraction rules
  const prompt = `Convert this profile to structured resume format.

PROFILE:
${JSON.stringify(profile, null, 2)}

JOB DESCRIPTION:
${jobDescription || "General software engineering"}

CRITICAL EXTRACTION RULES:

1. **PROJECT URLS** - Extract TWO separate URLs per project:
   - "url" field = Live demo/deployed app (netlify.app, vercel.app, custom domains)
   - "github" field = GitHub repository (github.com/username/repo)
   - If you see BOTH types for a project, put them in SEPARATE fields
   - Example from profile:
     {
       "name": "Stratifyy",
       "url": "https://stratifyy.netlify.app/",
       "github": "https://github.com/VIBHORE-LAB/stratify-backend"
     }

2. **COMPLETENESS:**
   - Include EVERY project with ALL bullets
   - Include EVERY experience with ALL bullets
   - Include EVERY achievement
   - Extract tech stacks from descriptions (e.g., "using React and Node.js" → tech: ["React", "Node.js"])

3. **FORMATTING:**
   - Duration in "YYYY-YYYY" or "Month YYYY - Month YYYY" format
   - Professional summary: 2-3 sentences tailored to job keywords
   - Preserve all metrics and numbers from bullets

Never skip, summarize, or merge information. Extract everything as-is.`;

  const structuredLLM = gpt4o.withStructuredOutput(resumeDataSchema);
  const resumeData = await structuredLLM.invoke(prompt);

  const parseResult = resumeDataSchema.safeParse(resumeData);
  if (!parseResult.success) {
    console.error("❌ Schema validation errors:", parseResult.error);
    throw new Error("Schema validation failed");
  }

  // ✅ Post-process: Clean up empty URLs
  if (parseResult.data.projects) {
    parseResult.data.projects = parseResult.data.projects.map((proj) => ({
      ...proj,
      url: proj.url && proj.url.trim() !== "" ? proj.url : undefined,
      github:
        proj.github && proj.github.trim() !== "" ? proj.github : undefined,
    }));
  }

  console.log("✅ Generated resume data:", {
    projects: parseResult.data.projects.length,
    hasGithubLinks: parseResult.data.projects.some((p) => p.github),
    hasLiveLinks: parseResult.data.projects.some((p) => p.url),
  });

  return parseResult.data;
}
