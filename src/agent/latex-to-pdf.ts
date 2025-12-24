function extractLatex(raw: string): string {
  let out = raw.trim();

  // Remove triple-backtick fences if present
  if (out.startsWith("```")) {
    out = out.replace(/^```[a-zA-Z]*\n?/, "");
    out = out.replace(/```$/, "");
  }

  // Remove accidental leading/trailing markdown
  out = out.replace(/^```/, "").replace(/```$/, "");

  return out.trim();
}

export async function latexToPDF(latexCode: string): Promise<Buffer> {


  const fixedCode = extractLatex(latexCode);
  const form = new FormData();
  form.append("filecontents[]", fixedCode);
  form.append("filename[]", "document.tex");
  form.append("engine", "pdflatex");
  form.append("return", "pdf");

  const res = await fetch("https://texlive.net/cgi-bin/latexcgi", {
    method: "POST",
    body: form,
  });

  const ct = res.headers.get("content-type") || "";
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);


  if (!ct.includes("application/pdf") || buf.length < 1000) {
    const text = buf.toString("utf8");
    console.error("LaTeX API returned non-PDF full log:\n", text);
    // Optionally, extract the first LaTeX error line:
    const firstBang = text.split("\n").find((l) => l.startsWith("! "));
    if (firstBang) console.error("First LaTeX error:", firstBang);
    throw new Error("LaTeX compilation failed (non‑PDF response)");
  }

  return buf;
}
