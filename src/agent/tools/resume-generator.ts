import { tool } from "@langchain/core/tools";
import { openAiLLM } from "../../config/llm.ts";
import { latexToPDF } from "../latex-to-pdf.ts";
import z from "zod";
import { template1, template2 , template3, template4 , template5 } from "../../templates/resume-templates.ts";

export const generateResumePDFTool = tool(
  async ({ userProfile, jobDescription }) => {
    try {
      console.log("🔧 Generating resume PDF...");

      // 1) Generate LaTeX from LLM
      const latexCode = await generateLatexResume(userProfile, jobDescription);

      // Basic sanity check before hitting texlive
      if (
        !latexCode.includes("\\begin{document}") ||
        !latexCode.includes("\\end{document}")
      ) {
        throw new Error("Generated LaTeX is missing document environment");
      }

      // 2) Convert to PDF
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
    description: `Generate a tailored resume PDF using LaTeX based on the user's profile and a job description.`,
    schema: z.object({
      userProfile: z
        .string()
        .describe("JSON string of user profile from get_user_profile tool"),
      jobDescription: z.string().describe("The job description text"),
    }),
  }
);

async function generateLatexResume(
  profileJson: string,
  jd: string
): Promise<string> {
  const profile = JSON.parse(profileJson);

  const prompt = `
You are an expert LaTeX resume writer.

Generate a COMPLETE, COMPILABLE LaTeX resume document.

Requirements:
- Start with \\documentclass[letterpaper,11pt]{article} (or a similar standard class).
- Include any required \\usepackage commands.
- Contain exactly one \\begin{document} and one \\end{document}.
- Do NOT include markdown fences (no \`\`\`), comments, or explanations.
- Return ONLY raw LaTeX code.

User Profile:
${JSON.stringify(profile, null, 2)}

Job Description:
${jd}
`;

  const response = await openAiLLM.invoke(prompt);
  return String(response.content ?? "");
}
