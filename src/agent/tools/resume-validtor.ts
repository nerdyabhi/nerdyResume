import {
  resumeDataSchema,
  type ResumeData,
} from "../../schemas/resume-data-schema.ts";
import { gpt4o } from "../../config/llm.ts";

export async function improveResumeContent(
  data: ResumeData
): Promise<ResumeData> {
  const prompt = `You're a reusme ATS optimizer and your job is to optimise this resume for best ats score possible without faking any information Return the SAME JSON structure.

CURRENT RESUME:
${JSON.stringify(data, null, 2)}

IMPROVEMENTS:
1. Fix grammar/spelling errors
2. Vary action verbs (don't repeat verbs 3+ times)
2. DON'T REPEAT WORDS USE SYNONMS FOR ACTION VERBS LIKE : (implemented, built , engineered )
3. Add metrics where logical: "Built feature" → "Built feature serving 10K+ users"
4. Make bullets more impactful with numbers/percentages
5. Remove filler words: "very", "really", "just"

PRESERVE:
- Exact JSON structure (same sections, same field types)
- All URLs (header links, project links)
- All dates and company names
- Section count and order
- Empty fields stay empty

Return improved JSON matching the schema.`;

  try {
    const structuredLLM = gpt4o.withStructuredOutput(resumeDataSchema);
    const improvedData = await structuredLLM.invoke(prompt);

    console.log("✅ Resume content improved");
    return improvedData;
  } catch (error) {
    console.error("❌ Validator failed, returning original:", error);
    return data;
  }
}
