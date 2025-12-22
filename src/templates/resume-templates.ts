import { z } from "zod";
import { resumeDataSchema } from "../schemas/resume-data-schema.ts";

type ResumeData = z.infer<typeof resumeDataSchema>;

function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\$/g, "\\$")
    .replace(/\&/g, "\\&")
    .replace(/\#/g, "\\#")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/\_/g, "\\_")
    .replace(/\~/g, "\\textasciitilde{}")
    .replace(/\%/g, "\\%");
}

function buildHeaderLinks(data: ResumeData): string {
  const links: string[] = [];

  // Email (always present)
  links.push(
    `\\href{mailto:${data.email}}{\\underline{${escapeLatex(data.email)}}}`
  );

  // LinkedIn
  if (data.linkedin) {
    const handle = data.linkedin.split("/").pop() || data.linkedin;
    links.push(
      `\\href{${data.linkedin}}{\\underline{linkedin.com/in/${escapeLatex(
        handle
      )}}}`
    );
  }

  // GitHub
  if (data.github) {
    const handle = data.github.split("/").pop() || data.github;
    links.push(
      `\\href{${data.github}}{\\underline{github.com/${escapeLatex(handle)}}}`
    );
  }

  // Portfolio
  if (data.portfolio) {
    const display = data.portfolio
      .replace(/https?:\/\/(www\.)?/, "")
      .split("/")[0];
    links.push(
      `\\href{${data.portfolio}}{\\underline{${escapeLatex(display || "")}}}`
    );
  }

  return links.join(" $|$ ");
}

function buildProjectLinks(project: ResumeData["projects"][0]): string {
  const links: string[] = [];

  // Live/Demo link (prioritize this first)
  if (
    project.url &&
    project.url.trim() &&
    !project.url.includes("github.com")
  ) {
    links.push(
      `\\href{${project.url}}{\\textbf{\\textcolor{blue}{\\underline{Live}}}}`
    );
  }

  // GitHub link
  if (project.github && project.github.trim()) {
    links.push(
      `\\href{${project.github}}{\\textbf{\\textcolor{blue}{\\underline{GitHub}}}}`
    );
  }

  // Fallback: if url contains github.com (data migration case)
  if (project.url && project.url.includes("github.com") && !project.github) {
    links.push(
      `\\href{${project.url}}{\\textbf{\\textcolor{blue}{\\underline{GitHub}}}}`
    );
  }

  return links.length > 0 ? ` $|$ ${links.join(" $|$ ")}` : "";
}

function getTemplate1(data: ResumeData): string {
  return `\\documentclass[letterpaper,10pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{marvosym}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(data.firstName)} ${escapeLatex(
    data.lastName
  )}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(data.phone)} $|$ ${buildHeaderLinks(data)}
\\end{center}

${
  data.summary
    ? `
%-----------SUMMARY-----------
\\section{Professional Summary}
${escapeLatex(data.summary)}
`
    : ""
}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
${data.education
  .map(
    (edu) => `    \\resumeSubheading
      {${escapeLatex(edu.institution || "")}}{${
      edu.location ? escapeLatex(edu.location) : ""
    }}
      {${escapeLatex(edu.degree || "")}}{${escapeLatex(edu.duration || "")}}
${edu.gpa ? `      \\resumeItem{CGPA: \\textbf{${escapeLatex(edu.gpa)}}}` : ""}`
  )
  .join("\n")}
  \\resumeSubHeadingListEnd

${
  data.experience && data.experience.length > 0
    ? `
%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${data.experience
  .map(
    (exp) => `    \\resumeSubheading
      {${escapeLatex(exp.position || "")}}{${escapeLatex(exp.duration || "")}}
      {${escapeLatex(exp.company || "")}}{${
      exp.location ? escapeLatex(exp.location) : ""
    }}
      \\resumeItemListStart
${(exp.bullets || [])
  .map((bullet) => `        \\resumeItem{${escapeLatex(bullet || "")}}`)
  .join("\n")}
      \\resumeItemListEnd
`
  )
  .join("\n")}
  \\resumeSubHeadingListEnd
`
    : ""
}

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${(data.projects || [])
  .map(
    (proj) => `    \\resumeProjectHeading
      {\\textbf{${escapeLatex(proj.name || "")}}${buildProjectLinks(
      proj
    )} $|$ \\emph{${(proj.tech || [])
      .map((t) => escapeLatex(t || ""))
      .join(", ")}}}{${escapeLatex(proj?.duration || "")}}
      \\resumeItemListStart
${(proj.bullets || [])
  .map((b) => `        \\resumeItem{${escapeLatex(b || "")}}`)
  .join("\n")}
      \\resumeItemListEnd
`
  )
  .join("\n")}
  \\resumeSubHeadingListEnd

${
  data.achievements && data.achievements.length > 0
    ? `
%-----------ACHIEVEMENTS-----------
\\section{Achievements}
  \\resumeItemListStart
${data.achievements
  .map((ach) => `    \\resumeItem{${escapeLatex(ach || "")}}`)
  .join("\n")}
  \\resumeItemListEnd
`
    : ""
}

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{
      \\item \\textbf{Languages}: ${(data.skills?.languages || [])
        .map((l) => escapeLatex(l || ""))
        .join(", ")}
      ${
        data.skills?.frameworks && data.skills.frameworks.length > 0
          ? `\\item \\textbf{Frameworks}: ${data.skills.frameworks
              .map((f) => escapeLatex(f || ""))
              .join(", ")}`
          : ""
      }
      ${
        data.skills?.databases && data.skills.databases.length > 0
          ? `\\item \\textbf{Databases}: ${data.skills.databases
              .map((d) => escapeLatex(d || ""))
              .join(", ")}`
          : ""
      }
      ${
        data.skills?.tools && data.skills.tools.length > 0
          ? `\\item \\textbf{Tools}: ${data.skills.tools
              .map((t) => escapeLatex(t || ""))
              .join(", ")}`
          : ""
      }
      ${
        data.skills?.libraries && data.skills.libraries.length > 0
          ? `\\item \\textbf{Libraries}: ${data.skills.libraries
              .map((l) => escapeLatex(l || ""))
              .join(", ")}`
          : ""
      }
      ${
        data.skills?.concepts && data.skills.concepts.length > 0
          ? `\\item \\textbf{Concepts}: ${data.skills.concepts
              .map((c) => escapeLatex(c || ""))
              .join(", ")}`
          : ""
      }
    }
  \\end{itemize}

\\end{document}`;
}

function getTemplate2(data: ResumeData): string {
  return `\\documentclass[a4paper,11pt]{article}

% Packages
\\usepackage[left=0.6in,right=0.6in,top=0.5in,bottom=0.5in]{geometry}
\\usepackage{tabularx}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{array}

% Font
\\usepackage[T1]{fontenc}
\\renewcommand{\\familydefault}{\\sfdefault}

% Remove page numbers
\\pagestyle{empty}

% Section formatting
\\titleformat{\\section}
  {\\large\\bfseries\\scshape}
  {}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{4pt}

% List spacing
\\setlist[itemize]{leftmargin=15pt,itemsep=0pt,parsep=0pt,topsep=1pt}

% No paragraph indent
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Hyperlinks
\\hypersetup{colorlinks=true,urlcolor=blue}

\\begin{document}

%==================== HEADER ====================
\\begin{center}
  {\\LARGE\\bfseries ${data.firstName.toUpperCase()} ${data.lastName.toUpperCase()}}\\\\[2pt]
  \\small
  ${data.phone} \\,|\\, 
  \\href{mailto:${data.email}}{${data.email}}${
    data.github ? ` \\,|\\, \\href{${data.github}}{GitHub}` : ""
  }${data.linkedin ? ` \\,|\\, \\href{${data.linkedin}}{LinkedIn}` : ""}${
    data.portfolio ? ` \\,|\\, \\href{${data.portfolio}}{Portfolio}` : ""
  }
\\end{center}

${
  data.summary
    ? `
%==================== SUMMARY ====================
\\section*{SUMMARY}
${escapeLatex(data.summary)}
`
    : ""
}

%==================== EDUCATION ====================
\\section*{EDUCATION}
\\begin{tabularx}{\\textwidth}{|>{\\centering\\arraybackslash}p{1.6cm}|X|X|>{\\centering\\arraybackslash}p{1.8cm}|}
\\hline
\\textbf{Year} & \\textbf{Degree/Certificate} & \\textbf{Institute} & \\textbf{CGPA} \\\\ \\hline
${data.education
  .map(
    (edu) =>
      `${escapeLatex(edu.duration)} & ${escapeLatex(
        edu.degree
      )} & ${escapeLatex(edu.institution)}${
        edu.location ? ", " + escapeLatex(edu.location) : ""
      } & ${edu.gpa ? escapeLatex(edu.gpa) : "N/A"} \\\\ \\hline`
  )
  .join("\n")}
\\end{tabularx}

${
  data.experience && data.experience.length > 0
    ? `
%==================== EXPERIENCE ====================
\\section*{EXPERIENCE}
${data.experience
  .map(
    (exp) => `\\textbf{${escapeLatex(
      exp.position
    )}} \\hfill \\textit{${escapeLatex(exp.duration)}}\\\\
\\textit{${escapeLatex(exp.company)}} \\hfill \\textit{${
      exp.location ? escapeLatex(exp.location) : "Remote"
    }}
\\begin{itemize}[label=--]
${exp.bullets.map((bullet) => `  \\item ${escapeLatex(bullet)}`).join("\n")}
\\end{itemize}
`
  )
  .join("\n")}
`
    : ""
}

%==================== PROJECTS ====================
\\section*{PROJECTS}
${data.projects
  .map((project) => {
    const links: string[] = [];
    if (project.github) links.push(`\\href{${project.github}}{GitHub}`);
    if (project.url) links.push(`\\href{${project.url}}{Live}`);
    const linkStr =
      links.length > 0 ? ` \\hfill \\textit{${links.join(" | ")}}` : "";

    return `\\textbf{${escapeLatex(project.name)}${
      project.description ? " -- " + escapeLatex(project.description) : ""
    }}${linkStr}
\\begin{itemize}[label=--]
${
  project.bullets && project.bullets.length > 0
    ? project.bullets
        .map((bullet) => `  \\item ${escapeLatex(bullet)}`)
        .join("\n")
    : project.description
    ? `  \\item ${escapeLatex(project.description)}`
    : ""
}
\\end{itemize}
`;
  })
  .join("\n")}

%==================== TECHNICAL SKILLS ====================
\\section*{TECHNICAL SKILLS}
\\begin{itemize}[label=\\textbullet]
  \\item \\textbf{Languages}: ${data.skills.languages
    .map((l) => escapeLatex(l))
    .join(", ")}
  ${
    data.skills.frameworks && data.skills.frameworks.length > 0
      ? `\\item \\textbf{Frameworks}: ${data.skills.frameworks
          .map((f) => escapeLatex(f))
          .join(", ")}`
      : ""
  }
  ${
    data.skills.tools && data.skills.tools.length > 0
      ? `\\item \\textbf{Tools \\& Infra}: ${data.skills.tools
          .map((t) => escapeLatex(t))
          .join(", ")}`
      : ""
  }
  ${
    data.skills.databases && data.skills.databases.length > 0
      ? `\\item \\textbf{Databases}: ${data.skills.databases
          .map((d) => escapeLatex(d))
          .join(", ")}`
      : ""
  }
  ${
    data.skills.platforms && data.skills.platforms.length > 0
      ? `\\item \\textbf{Platforms}: ${data.skills.platforms
          .map((p) => escapeLatex(p))
          .join(", ")}`
      : ""
  }
\\end{itemize}

${
  data.achievements && data.achievements.length > 0
    ? `
%==================== ACHIEVEMENTS ====================
\\section*{ACHIEVEMENTS \\& CERTIFICATIONS}
\\begin{itemize}[label=\\textbullet]
${data.achievements
  .map((achievement) => `  \\item ${escapeLatex(achievement)}`)
  .join("\n")}
\\end{itemize}
`
    : ""
}

\\end{document}
`;
}

export function getResumeTemplate(
  data: ResumeData,
  templateId: number
): string {
  switch (templateId) {
    case 1:
      return getTemplate1(data);
    case 2:
      return getTemplate2(data);
    default:
      throw new Error(`Template ${templateId} not found. Available: 1, 2`);
  }
}

export const template1 = getTemplate1;
export const template2 = getTemplate2;
