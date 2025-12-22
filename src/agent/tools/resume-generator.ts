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
      const latexCode = await improveResumeDesign(rawLatexCode)

      // Step 3: Validate LaTeX
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
      "Generate a tailored resume PDF. You MUST pass templateId (template1..template5).",
    schema: z.object({
      userProfile: z
        .string()
        .describe("JSON string of user profile from get_user_profile tool"),
      jobDescription: z.string().describe("The job description text (can be empty)"),
      templateId: z.number().describe("One of: template1, template2, template3, template4, template5"),
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
  
  const prompt = `Convert this profile to structured resume format.

PROFILE:
${JSON.stringify(profile, null, 2)}

JOB DESCRIPTION:
${jobDescription || "General software engineering"}

CRITICAL: Include EVERY project, EVERY experience, EVERY achievement from the profile. Extract tech stacks from project bullets (e.g., "using Unity and ARCore" → tech: ["Unity", "ARCore"]). Never skip or summarize. Tailor summary to job keywords.`;

  const structuredLLM = gpt4o.withStructuredOutput(resumeDataSchema);
  const resumeData = await structuredLLM.invoke(prompt);

  const parseResult = resumeDataSchema.safeParse(resumeData);
  if (!parseResult.success) {
    throw new Error("Schema validation failed");
  }
  
  return parseResult.data;
}

