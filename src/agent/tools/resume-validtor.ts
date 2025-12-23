import { resumeDataSchema, type ResumeData } from "../../schemas/resume-data-schema.ts";
import { gpt4o } from "../../config/llm.ts";

export async function improveResumeContent(data: ResumeData): Promise<ResumeData> {
  const prompt = `Improve resume content. Preserve structure.

CURRENT:
${JSON.stringify(data, null, 2)}

IMPROVEMENTS:
- Add metrics to bullets (X%, Y users, Z ms)
- Vary action verbs (don't repeat 3+ times)
- Fix grammar/spelling
- Quantify vague terms

PRESERVE:
- All URLs (github, linkedin, portfolio, project links)
- Section order and titles
- JSON structure

Return improved JSON.`;

  try {
    const structuredLLM = gpt4o.withStructuredOutput(resumeDataSchema);
    const improvedData = await structuredLLM.invoke(prompt);    
    return improvedData;
  } catch (error) {
    console.warn("⚠️ Validator failed, returning original:", error);
    return data;
  }
}