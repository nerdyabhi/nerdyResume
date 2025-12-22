// src/agent/tools/latex-design-validator.ts
import { gpt4o } from "../../config/llm.ts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

function fixCommonLatexErrors(latex: string): string {
  latex = latex.replace(/\n\s*\\\\(\[\d+pt\])?(\s*\n)/g, '\n');
  
  latex = latex.replace(/\\\\(\[\d+pt\])?\s*\\\\(\[\d+pt\])?/g, '\\\\[2pt]');
  
  latex = latex.replace(/\\href\{([^}]+)\}\{\}/g, (match, url) => {
    const domain = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    return `\\href{${url}}{${domain}}`;
  });
  
  return latex;
}

export async function improveResumeDesign(latex: string): Promise<string> {
  
  const systemPrompt = `Expert ATS resume optimizer. Fix LaTeX resumes to score 90+.

CHECK & FIX:
1. Structure: Single-column, standard fonts, no graphics/icons
2. Metrics: Every bullet needs numbers (40%, 500+ users, 3x faster)
2.1 For Education use only the year , and not months ( e.g 2022-2026)
3. Repetition: STRICTLY don't repeat the words , use synonms , example: Vary verbs (Built/Designed/Implemented/Optimized/Engineered/Led). 
   EXAMPLES: 
   - "implemented" appears 4 times, try replacing with: executed, applied, enforced
   - "specified" appears 3 times, try replacing with: detailed, outlined, stated precisely
4. Grammar: Fix typos, tense (past roles=past tense, current=present)
5. Sections: Use approapriate Section names [ keep experience above education if user have real experience ]
6. Keywords: Keep all tech terms visible, right-align dates with \hfill
7. Polish: 2-3 sentence SUMMARY, fit 1 page, spacing (8-10pt before sections, itemsep=0-1pt)
8. Check links specially if it's a live link and showed as github fix that to Live Preview.
CRITICAL LATEX RULES:
- NEVER generate empty line breaks (\\\\[Xpt] with nothing before the \\\\)
- After name in header, only add \\\\ if there's text following it
- All \\href must have display text: \\href{url}{text}
STRICTLY DOUBLE CHECK AND FIX ,  GRAMMAR AND SPELLING MISTAKES !!!!! 
OUTPUT: Pure LaTeX code only. No markdown, no explanations.`;

  const userPrompt = `Fix this resume:\n\n${latex}`;

  const rawResponse = await gpt4o.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt)
  ]);
  
  const response = (typeof rawResponse === "object" && rawResponse !== null && "content" in rawResponse)
    ? rawResponse.content
    : String(rawResponse);
  
  let improved = String(response).trim();

  // Strip markdown if present
  if (improved.includes('```')) {
    const match = improved.match(/```(?:latex)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) improved = match[1].trim();
  }

  // AUTO-FIX common LaTeX errors
  improved = fixCommonLatexErrors(improved);

  // Validate
  if (!improved.includes('\\documentclass') || !improved.includes('\\begin{document}')) {
    console.warn("⚠️  Invalid LaTeX, using original");
    return latex;
  }
  
  console.log("✅ Resume optimized");
  return improved;
}
