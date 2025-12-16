import { tool } from "@langchain/core/tools";
import { gpt4o, openAiLLM } from "../../config/llm.ts";
import { latexToPDF } from "../latex-to-pdf.ts";
import z from "zod";
import { template1 } from "../../templates/resume-templates.ts";

function chooseTemplate(templateId: string): string {
  return template1;
}

export const generateResumePDFTool = tool(
  async ({ userProfile, jobDescription, templateId }) => {
    try {
      console.log("🔧 Generating resume PDF with template:", templateId);
      console.log("-----------------------------------");
      console.log(userProfile);
      console.log("-----------------------------------");
      const latexCode = await generateLatexResume(
        userProfile,
        jobDescription,
        templateId
      );

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
      jobDescription: z.string().describe("The job description text"),
      templateId: z.string().describe("One of: template1"),
    }),
  }
);

async function generateLatexResume(
  profileJson: string,
  jd: string,
  templateId: string
): Promise<string> {
  const profile = JSON.parse(profileJson);
  const template = chooseTemplate(templateId);

  const prompt = `
You are an expert LaTeX resume generator and technical resume writer.

OUTPUT RULES:
- Return ONLY raw, compilable LaTeX source (no markdown, no explanations).
- Ensure ZERO spelling or grammar mistakes.
- The resume must be professional, concise, and recruiter-ready.
- Target at least 550+ words WITHOUT adding filler content.

GOAL:
- Generate a SINGLE-PAGE, ATS-friendly resume in LaTeX.
- Use the provided TEMPLATE structure, commands, and layout exactly.
- Do NOT invent, exaggerate, or assume any data.
- Sections must follow this format:
  Education, Experience, Projects, Skills, Achievements.

DATA RULES:
- Use ONLY facts explicitly present in the USER PROFILE.
- Tailor wording, ordering, and emphasis to the JOB DESCRIPTION
  (skills, responsibilities, keywords).
- Quantify impact ONLY when real numeric values exist in the profile.
- If exact metrics are unavailable, describe scope, scale, ownership,
  or technical complexity instead (DO NOT fabricate numbers).
- Use strong action verbs and outcome-focused bullet points.
- Remove or compress weak, redundant, or low-signal content.

PAGE USAGE RULES:
- The final resume MUST fit on EXACTLY ONE page.
- Use roughly 80–95% of the vertical space.
- If space remains, you MUST (in order):
  1) Add more relevant Experience bullets derived from USER PROFILE,
  2) Add additional concrete Projects with 1–3 factual bullets each,
  3) Add real Achievements, Certifications, or Skills from USER PROFILE.
- NEVER add filler, generic statements, or imaginary accomplishments.

SECTIONS (keep this order; omit only if truly empty):
- Education
- Experience
- Projects
- Achievements / Certifications
- Technical Skills

TEMPLATE (use its structure exactly; do NOT modify packages or documentclass):
${template}

USER PROFILE (single source of truth – all facts must come from here):
${JSON.stringify(profile, null, 2)}

JOB DESCRIPTION (use ONLY to prioritize language and keywords, NOT to invent facts):
${jd}

Return ONLY the complete LaTeX code for the one-page resume.
`;

  const response = await gpt4o.invoke(prompt);
  return String(response.content ?? "");
}
