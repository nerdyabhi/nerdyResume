export async function latexToPDF(latexCode: string): Promise<Buffer> {
  console.log("Got LatexToPdf call with ");
  console.log(latexCode);
  console.log("--------------------");
  const form = new FormData();
  form.append("filecontents[]", latexCode);
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

  console.log("latexToPDF status:", res.status, "ct:", ct, "len:", buf.length);

  if (!ct.includes("application/pdf") || buf.length < 1000) {
    console.error(
      "LaTeX API returned non-PDF:",
      buf.toString("utf8").slice(0, 500)
    );
    throw new Error("LaTeX compilation failed (non‑PDF response)");
  }

  return buf;
}

// async function main() {
//   const minimalLatex = `
// \\documentclass{article}
// \\begin{document}
// Hello from NerdyResume!
// \\end{document}
// `.trim();

//   try {
//     const pdf = await latexToPDF(minimalLatex);
//     console.log("✅ Got PDF bytes:", pdf.length);

//     // For quick manual check: write to disk if you're in Node
//     const fs = await import("fs");
//     fs.writeFileSync("test.pdf", pdf);
//     console.log("Saved test.pdf");
//   } catch (e) {
//     console.error("❌ Test failed:", e);
//   }
// }

// main();
