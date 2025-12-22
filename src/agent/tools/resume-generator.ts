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

  console.log("📥 RAW PROFILE DATA:");
  console.log("Projects:", JSON.stringify(profile.projects, null, 2));
  console.log("Profile Links:", JSON.stringify(profile.profileLinks, null, 2));

  const prompt = `Convert this user profile to resume format matching the resumeDataSchema.

USER PROFILE:
${JSON.stringify(profile, null, 2)}

JOB DESCRIPTION:
${jobDescription || "General software engineering position"}

EXTRACTION RULES:

1. **Profile-level links:**
   - Extract github, linkedin, portfolio from profileLinks object
   - Put them in TOP-LEVEL fields (not nested)

2. **Projects:**
   - For EACH project, extract:
     * name, description, tech array, duration
     * bullets: ALL bullet points from the project
     * url: Live demo URL (netlify, vercel, custom domain)
     * github: GitHub repository URL
   - If a project has BOTH urls, put them in SEPARATE fields
   - NEVER leave bullets empty - always include at least the description

3. **Complete extraction:**
   - ALL experience bullets
   - ALL education details
   - ALL skills
   - ALL achievements

Output valid JSON matching resumeDataSchema structure.`;

  const structuredLLM = gpt4o.withStructuredOutput(resumeDataSchema);
  let resumeData = await structuredLLM.invoke(prompt);

  // ✅ FORCE FIX: Manually copy links and bullets from original profile
  if (profile.profileLinks) {
    resumeData.github = resumeData.github || profile.profileLinks.github;
    resumeData.linkedin = resumeData.linkedin || profile.profileLinks.linkedin;
    resumeData.portfolio =
      resumeData.portfolio || profile.profileLinks.portfolio;
  }

  // ✅ FORCE FIX: Copy project links and ensure bullets exist
  if (profile.projects && resumeData.projects) {
    resumeData.projects = resumeData.projects.map((proj, idx) => {
      const originalProj = profile.projects[idx];

      return {
        ...proj,
        // Force copy URLs
        url: proj.url || originalProj?.url || undefined,
        github: proj.github || originalProj?.github || undefined,
        // Ensure bullets exist - use description if empty
        bullets:
          proj.bullets && proj.bullets.length > 0
            ? proj.bullets
            : originalProj?.bullets && originalProj.bullets.length > 0
            ? originalProj.bullets
            : proj.description
            ? [proj.description]
            : ["Project details available upon request"],
      };
    });
  }

  console.log("🤖 AFTER MANUAL FIX:");
  console.log("Profile links:", {
    github: resumeData.github,
    linkedin: resumeData.linkedin,
    portfolio: resumeData.portfolio,
  });
  console.log(
    "Projects:",
    JSON.stringify(
      resumeData.projects?.map((p) => ({
        name: p.name,
        url: p.url,
        github: p.github,
        bulletsCount: p.bullets?.length,
      })),
      null,
      2
    )
  );

  const parseResult = resumeDataSchema.safeParse(resumeData);
  if (!parseResult.success) {
    console.error("❌ Schema validation errors:", parseResult.error);
    throw new Error(`Schema validation failed: ${parseResult.error.message}`);
  }

  return parseResult.data;
}
