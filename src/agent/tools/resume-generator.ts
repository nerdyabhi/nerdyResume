import { tool } from "@langchain/core/tools";
import { gpt4o } from "../../config/llm.ts";
import { latexToPDF } from "../latex-to-pdf.ts";
import z from "zod";
import { getResumeTemplate } from "../../templates/resume-templates.ts";
import { resumeDataSchema } from "../../schemas/resume-data-schema.ts";
import { eventBus, EVENTS } from "../../events/eventBus.ts";
import type { RunnableConfig } from "@langchain/core/runnables";

export const generateResumePDFTool = tool(
  async (
    { userProfile, jobDescription, templateId },
    config: RunnableConfig
  ) => {
    try {
      const userId = config?.configurable?.userId;

      console.log(
        "🔧 Generating resume PDF with template:",
        templateId,
        "For userId : ",
        userId
      );

      const resumeData = await generateResumeData(userProfile, jobDescription);
      const latexCode = getResumeTemplate(resumeData, templateId);

      const pdfBuffer = await latexToPDF(latexCode);
      // const base64Pdf = pdfBuffer.toString("base64");
      const profile = JSON.parse(userProfile);
      const fileName = `resume_${profile.name || "user"}.pdf`;

      eventBus.emit(EVENTS.PDF_GENERATED, {
        userId,
        fileName,
        buffer: pdfBuffer,
        metadata: {
          templateId,
          generatedAt: new Date().toISOString(),
        },
      });

      return JSON.stringify({
        success: true,
        message: "Resume Sent successfully to the user",
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
      templateId: z.number().describe("Template number: 1 or 2"),
    }),
  }
);

async function generateResumeData(profileJson: string, jobDescription: string) {
  const profile = JSON.parse(profileJson);

  const prompt = `Generate valid resume JSON.

PROFILE:
${JSON.stringify(profile, null, 2)}

JOB:
${jobDescription || "General Software Engineer"}

VALID SECTION TYPES (use EXACTLY these):
- "experience" → {items: [{heading, subheading, meta, bullets, links}]}
- "projects" → {items: [{heading, subheading, meta, bullets, links}]}
- "skills" → {categories: [{name, items}]}
- "education" → {items: [{degree, institution, duration, gpa, details}]}
- "summary" → {text: "..."}
- "achievements" → {items: ["..."]}
- "certifications" → {items: ["..."]}

ALL fields required. Use empty string "" or empty array [].

Return valid JSON.`;

  const structuredLLM = gpt4o.withStructuredOutput(resumeDataSchema);
  const resumeData = await structuredLLM.invoke(prompt);

  console.log("✅ Resume generated");
  return resumeData;
}
