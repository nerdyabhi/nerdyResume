import { tool } from "@langchain/core/tools";
import { gpt4o } from "../../config/llm.js";
import { latexToPDF } from "../latex-to-pdf.js";
import z from "zod";
import { getResumeTemplate } from "../../templates/resume-templates.js";
import { resumeDataSchema } from "../../schemas/resume-data-schema.js";
import { eventBus, EVENTS } from "../../events/eventBus.js";
import type { RunnableConfig } from "@langchain/core/runnables";
import { improveResumeContent } from "./resume-validtor.js";
import { redis } from "../../config/redis.js";
import { RATE_LIMIT_COUNT } from "../../lib/constants.js";

export const generateResumePDFTool = tool(
  async (
    { userProfile, jobDescription, templateId },
    config: RunnableConfig
  ) => {
    try {
      const userId = config?.configurable?.userId;
      const rateLimitKey = `ratelimit:resume-generation:user:${userId}`;

      const rateLimitCount = await redis.get(rateLimitKey);
      const currentCount = rateLimitCount ? parseInt(rateLimitCount) : 0;
  
      if (currentCount > RATE_LIMIT_COUNT) {
        return JSON.stringify({
          success: false,
          error: "rate_limit_exceeded",
          message:
            `⚠️ *Rate Limit Reached*\n\n` +
            `You've generated 5 resumes today.\n` +
            `Try again after: after 24\n\n`,
        });
      }

   

      const resumeData = await generateResumeData(userProfile, jobDescription);
      const improvedResumeData = await improveResumeContent(resumeData);
      const latexCode = getResumeTemplate(improvedResumeData, templateId);

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

      const newCount = await redis.incr(rateLimitKey);

      if (newCount === 1) {
        await redis.expire(rateLimitKey, 24 * 60 * 60);
      }

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
      "Generate a tailored resume PDF. You MUST pass templateId(1-3) if user asks for double-layout template id = 3 .",
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

  const prompt = `Generate ATS-optimized resume JSON tailored to the job description.

PROFILE:
${JSON.stringify(profile, null, 2)}

TARGET JOB:
${jobDescription || "General Software Engineer"}

INSTRUCTIONS:

1. ANALYZE JD: Extract key skills, technologies, and requirements. Use these keywords naturally 2-3 times.

2. TAILOR CONTENT:
- Prioritize experiences/projects matching JD requirements
- Use exact JD keywords in bullets and descriptions
- Quantify all achievements (%, numbers, time, users)
- Start bullets with action verbs: Built, Designed, Implemented, Optimized, Led
- Keep most relevant content, shorten less relevant (don't remove)

3. SECTIONS (all required, use "" or [] if empty):

**summary**: {text: "..."} 
- 2-3 sentences, 40-60 words
- Lead with years of experience + key skills matching JD
- End with value proposition

**experience**: {items: [{heading, subheading, meta, bullets, links}]}
- heading: Job Title | subheading: Company | meta: "Month Year - Month Year"
- bullets: 3-5 bullets per role using STAR format with metrics
- links: ALWAYS include as array (can be empty [])
- 3-5 bullets per role using STAR format with metrics
- Highlight JD-matching technologies

**projects**: {items: [{heading, subheading, meta, bullets, links}]}
- Select 3-4 most relevant to JD
- heading: Project Name | subheading: one-line description | meta: "Tech: ..."
- bullets: 2-4 bullets with technical complexity and impact
- links: ALWAYS include as array (can be empty []) - format: [{label: "GitHub", url: "..."}, {label: "Live Demo", url: "..."}]
- Include GitHub/live links if available

**skills**: {categories: [{name, items}]}
- 4-6 categories: "Programming Languages", "Backend Technologies", "Frontend Technologies", "DevOps & Cloud", "Tools & Technologies"
- Order by JD relevance within categories

**education**: {items: [{degree(do BTech To bachelor of technology ), institution, duration(in this format : 2022-2026), gpa, details}]}
- Most recent first | Include relevant coursework in details

**achievements**: {items: [""]}
- Include LeetCode/competitive programming stats
- Hackathon wins, awards, open-source contributions
- Format: "Impact/ranking + specific metric"

**certifications**: {items: [""]}
- Format: "Name - Issuer(Year) ( if any) "
- STRICTLY DON'T ADD any fake certificates or invent certifications if not present in profile  

4. CRITICAL SCHEMA REQUIREMENTS:
- links field MUST be present and be an array for experience and projects
- Even if no links exist, use empty array: "links": []
- Never omit the links field
- All fields required (use "" or [] if empty)

5. ATS RULES:
- Standard headings and job titles
- No spelling errors or word repetition
- Keywords from JD distributed naturally
- All dates in consistent format
- All fields present (use "" or [] if empty)

6. REQUIRED SCHEMA TYPES: "experience", "projects", "skills", "education", "summary", "achievements", "certifications"

Return valid JSON with ALL sections and ALL required fields.`;

  const structuredLLM = gpt4o.withStructuredOutput(resumeDataSchema);
  const resumeData = await structuredLLM.invoke(prompt);

  return resumeData;
}
