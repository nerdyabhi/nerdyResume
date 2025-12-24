import { type ResumeData } from "../schemas/resume-data-schema.js";

// ============= ESCAPE LATEX =============

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

// ============= HELPER FUNCTIONS =============

function cleanMeta(meta: string): string {
  if (!meta) return "";
  return meta.replace(/^Tech:\s*/i, "").trim();
}

function buildHeaderLinks(header: ResumeData["header"]): string {
  const links: string[] = [];

  links.push(
    `\\href{mailto:${header.email}}{\\underline{${escapeLatex(header.email)}}}`
  );

  if (header.linkedin && header.linkedin.trim() !== "") {
    const handle = header.linkedin.split("/").pop() || "";
    links.push(
      `\\href{${header.linkedin}}{\\underline{linkedin.com/in/${escapeLatex(
        handle
      )}}}`
    );
  }

  if (header.github && header.github.trim() !== "") {
    const handle = header.github.split("/").pop() || "";
    links.push(
      `\\href{${header.github}}{\\underline{github.com/${escapeLatex(handle)}}}`
    );
  }

  if (header.portfolio && header.portfolio.trim() !== "") {
    const display = header.portfolio
      .replace(/https?:\/\/(www\.)?/, "")
      .split("/")[0];
    links.push(
      `\\href{${header.portfolio}}{\\underline{${escapeLatex(display || "")}}}`
    );
  }

  return links.join(" $|$ ");
}

function buildItemLinks(links: Array<{ label: string; url: string }>): string {
  if (!links || links.length === 0) return "";

  const formatted = links.map(
    (link) =>
      `\\href{${link.url}}{\\textbf{\\textcolor{blue}{\\underline{${escapeLatex(
        link.label
      )}}}}}`
  );

  return ` $|$ ${formatted.join(" $|$ ")}`;
}

// ============= TEMPLATE 1: ATS-Optimized =============

function renderSummaryT1(section: any): string {
  if (!section.content?.text || section.content.text.trim() === "") {
    return "";
  }

  return `
%-----------${section.title.toUpperCase()}-----------
\\section{${escapeLatex(section.title)}}
${escapeLatex(section.content.text)}
`;
}

function renderGenericT1(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%-----------${section.title.toUpperCase()}-----------
\\section{${escapeLatex(section.title)}}
  \\resumeItemListStart
${section.content.items
  .map((item: string) => `    \\resumeItem{${escapeLatex(item)}}`)
  .join("\n")}
  \\resumeItemListEnd
`;
}

function renderExperienceT1(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%-----------${section.title.toUpperCase()}-----------
\\section{${escapeLatex(section.title)}}
  \\resumeSubHeadingListStart
${section.content.items
  .filter((item: any) => item && item.heading && Array.isArray(item.bullets))
  .map(
    (item: any) => `    \\resumeSubheading
      {${escapeLatex(item.heading)}}{${escapeLatex(item.meta || "")}}
      {${escapeLatex(item.subheading || "")}}{}
      \\resumeItemListStart
${item.bullets
  .map((b: string) => `        \\resumeItem{${escapeLatex(b)}}`)
  .join("\n")}
      \\resumeItemListEnd`
  )
  .join("\n")}
  \\resumeSubHeadingListEnd
`;
}

function renderProjectsT1(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%-----------${section.title.toUpperCase()}-----------
\\section{${escapeLatex(section.title)}}
  \\resumeSubHeadingListStart
${section.content.items
  .filter((item: any) => item && item.heading && Array.isArray(item.bullets))
  .map((item: any) => {
    const links = buildItemLinks(item.links || []);
    const cleanedMeta = cleanMeta(item.meta || "");

    return `    \\resumeProjectHeading
      {\\textbf{${escapeLatex(item.heading)}}${links}}{\\emph{${escapeLatex(
      cleanedMeta
    )}}}
      \\resumeItemListStart
${item.bullets
  .map((b: string) => `        \\resumeItem{${escapeLatex(b)}}`)
  .join("\n")}
      \\resumeItemListEnd`;
  })
  .join("\n")}
  \\resumeSubHeadingListEnd
`;
}

function renderSkillsT1(section: any): string {
  if (
    !section.content?.categories ||
    !Array.isArray(section.content.categories) ||
    section.content.categories.length === 0
  ) {
    return "";
  }

  return `
%-----------${section.title.toUpperCase()}-----------
\\section{${escapeLatex(section.title)}}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${section.content.categories
  .filter(
    (cat: any) =>
      cat && cat.name && Array.isArray(cat.items) && cat.items.length > 0
  )
  .map(
    (cat: any) =>
      `      \\textbf{${escapeLatex(cat.name)}}: ${cat.items
        .map((i: string) => escapeLatex(i))
        .join(", ")} \\\\`
  )
  .join("\n")}
    }}
  \\end{itemize}
`;
}

function renderEducationT1(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%-----------${section.title.toUpperCase()}-----------
\\section{${escapeLatex(section.title)}}
  \\resumeSubHeadingListStart
${section.content.items
  .filter((edu: any) => edu && edu.degree && edu.institution && edu.duration)
  .map(
    (edu: any) => `    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{}
      {${escapeLatex(edu.degree)}}{${escapeLatex(edu.duration)}}
${
  edu.gpa && edu.gpa.trim() !== ""
    ? `      \\resumeItem{CGPA: \\textbf{${escapeLatex(edu.gpa)}}}`
    : ""
}
${
  edu.details && Array.isArray(edu.details) && edu.details.length > 0
    ? `      \\resumeItem{Relevant Coursework: ${edu.details
        .map((d: string) => escapeLatex(d))
        .join(", ")}}`
    : ""
}`
  )
  .join("\n")}
  \\resumeSubHeadingListEnd
`;
}

function renderSectionT1(section: any): string {
  if (!section || !section.visible) return "";

  try {
    switch (section.type) {
      case "summary":
        return renderSummaryT1(section);
      case "experience":
        return renderExperienceT1(section);
      case "projects":
        return renderProjectsT1(section);
      case "skills":
        return renderSkillsT1(section);
      case "education":
        return renderEducationT1(section);
      case "achievements":
      case "certifications":
        return renderGenericT1(section);
      default:
        return "";
    }
  } catch (error) {
    console.error(`❌ Failed to render section ${section?.type}:`, error);
    return "";
  }
}

function getTemplate1(data: ResumeData): string {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  return `\\documentclass[letterpaper,11.5pt]{article}

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

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

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

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\small#2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(
      data.header.firstName
    )} ${escapeLatex(data.header.lastName)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(data.header.phone)} $|$ ${buildHeaderLinks(
    data.header
  )}
\\end{center}

${sortedSections.map((section) => renderSectionT1(section)).join("\n")}

\\end{document}`;
}

// ============= TEMPLATE 2: Modern Clean (updated to keep projects rich) =============

function renderSummaryT2(section: any): string {
  if (!section.content?.text || section.content.text.trim() === "") {
    return "";
  }

  return `
%==================== ${section.title.toUpperCase()} ====================
\\section*{${section.title.toUpperCase()}}
${escapeLatex(section.content.text)}
`;
}

function renderGenericT2(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%==================== ${section.title.toUpperCase()} ====================
\\section*{${section.title.toUpperCase()}}
\\begin{itemize}[label=\\textbullet]
${section.content.items
  .map((item: string) => `  \\item ${escapeLatex(item)}`)
  .join("\n")}
\\end{itemize}
`;
}

function renderExperienceT2(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%==================== ${section.title.toUpperCase()} ====================
\\section*{${section.title.toUpperCase()}}
${section.content.items
  .filter((item: any) => item && item.heading && Array.isArray(item.bullets))
  .map(
    (item: any) =>
      `\\textbf{${escapeLatex(item.heading)}} \\hfill \\textit{${escapeLatex(
        item.meta || ""
      )}}\\\\
\\textit{${escapeLatex(item.subheading || "")}}\\\\[1pt]
\\begin{itemize}[label=\\textbullet,leftmargin=12pt]
${item.bullets.map((b: string) => `  \\item ${escapeLatex(b)}`).join("\n")}
\\end{itemize}
`
  )
  .join("\n")}
`;
}

function renderProjectsT2(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%==================== ${section.title.toUpperCase()} ====================
\\section*{${section.title.toUpperCase()}}
${section.content.items
  .filter((item: any) => item && item.heading && Array.isArray(item.bullets))
  .map((item: any) => {
    const linkLine =
      item.links && Array.isArray(item.links) && item.links.length > 0
        ? item.links
            .map(
              (l: any) =>
                `\\href{${l.url}}{\\underline{${escapeLatex(l.label)}}}`
            )
            .join(" $|$ ")
        : "";

    const cleanedMeta = cleanMeta(item.meta || "");

    return `\\textbf{${escapeLatex(
      item.heading
    )}} \\hfill \\textit{${escapeLatex(cleanedMeta)}}\\\\
${linkLine ? `${linkLine}\\\\[1pt]\n` : ""}
\\begin{itemize}[label=\\textbullet,leftmargin=12pt]
${item.bullets.map((b: string) => `  \\item ${escapeLatex(b)}`).join("\n")}
\\end{itemize}
`;
  })
  .join("\n")}
`;
}

function renderSkillsT2(section: any): string {
  if (
    !section.content?.categories ||
    !Array.isArray(section.content.categories) ||
    section.content.categories.length === 0
  ) {
    return "";
  }

  return `
%==================== ${section.title.toUpperCase()} ====================
\\section*{${section.title.toUpperCase()}}
\\begin{itemize}[label=\\textbullet]
${section.content.categories
  .filter(
    (cat: any) =>
      cat && cat.name && Array.isArray(cat.items) && cat.items.length > 0
  )
  .map(
    (cat: any) =>
      `  \\item \\textbf{${escapeLatex(cat.name)}}: ${cat.items
        .map((i: string) => escapeLatex(i))
        .join(", ")}`
  )
  .join("\n")}
\\end{itemize}
`;
}

function renderEducationT2(section: any): string {
  if (
    !section.content?.items ||
    !Array.isArray(section.content.items) ||
    section.content.items.length === 0
  ) {
    return "";
  }

  return `
%==================== ${section.title.toUpperCase()} ====================
\\section*{${section.title.toUpperCase()}}
\\begin{tabularx}{\\textwidth}{|>{\\centering\\arraybackslash}p{1.6cm}|X|X|>{\\centering\\arraybackslash}p{1.8cm}|}
\\hline
\\textbf{Year} & \\textbf{Degree} & \\textbf{Institute} & \\textbf{CGPA} \\\\ \\hline
${section.content.items
  .filter((edu: any) => edu && edu.degree && edu.institution && edu.duration)
  .map(
    (edu: any) =>
      `${escapeLatex(edu.duration)} & ${escapeLatex(
        edu.degree
      )} & ${escapeLatex(edu.institution)} & ${
        edu.gpa && edu.gpa.trim() !== "" ? escapeLatex(edu.gpa) : "N/A"
      } \\\\ \\hline`
  )
  .join("\n")}
\\end{tabularx}
`;
}

function renderSectionT2(section: any): string {
  if (!section || !section.visible) return "";

  try {
    switch (section.type) {
      case "summary":
        return renderSummaryT2(section);
      case "experience":
        return renderExperienceT2(section);
      case "projects":
        return renderProjectsT2(section);
      case "skills":
        return renderSkillsT2(section);
      case "education":
        return renderEducationT2(section);
      case "achievements":
      case "certifications":
        return renderGenericT2(section);
      default:
        return "";
    }
  } catch (error) {
    console.error(`❌ Failed to render section ${section?.type}:`, error);
    return "";
  }
}

function getTemplate2(data: ResumeData): string {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  return `\\documentclass[a4paper,11pt]{article}

\\usepackage[left=0.6in,right=0.6in,top=0.5in,bottom=0.5in]{geometry}
\\usepackage{tabularx}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{array}
\\usepackage[T1]{fontenc}
\\renewcommand{\\familydefault}{\\sfdefault}

\\pagestyle{empty}

\\titleformat{\\section}
  {\\large\\bfseries\\scshape}
  {}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{4pt}

\\setlist[itemize]{leftmargin=15pt,itemsep=1pt,parsep=0pt,topsep=2pt}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\hypersetup{colorlinks=true,urlcolor=blue}

\\begin{document}

\\begin{center}
  {\\LARGE\\bfseries ${data.header.firstName.toUpperCase()} ${data.header.lastName.toUpperCase()}}\\\\[2pt]
  \\small
  ${escapeLatex(data.header.phone)} \\,|\\, 
  \\href{mailto:${data.header.email}}{${escapeLatex(data.header.email)}}${
    data.header.github && data.header.github.trim() !== ""
      ? ` \\,|\\, \\href{${data.header.github}}{GitHub}`
      : ""
  }${
    data.header.linkedin && data.header.linkedin.trim() !== ""
      ? ` \\,|\\, \\href{${data.header.linkedin}}{LinkedIn}`
      : ""
  }${
    data.header.portfolio && data.header.portfolio.trim() !== ""
      ? ` \\,|\\, \\href{${data.header.portfolio}}{Portfolio}`
      : ""
  }
\\end{center}

${sortedSections.map((section) => renderSectionT2(section)).join("\n")}

\\end{document}`;
}

// ============= TEMPLATE 3: ModernCV Two-Column =============

function renderSummaryT3(section: any): string {
  if (!section?.content?.text?.trim()) return "";
  return `
\\section{SUMMARY}
${escapeLatex(section.content.text)}
`;
}

function renderExperienceT3(section: any): string {
  if (!section?.content?.items?.length) return "";

  return `
\\section{EXPERIENCE}

${section.content.items
  .map((item: any) => {
    const company = escapeLatex(item.subheading || "");
    const role = escapeLatex(item.heading || "");
    const meta = (item.meta || "").trim();

    // Parse meta like "Mar 2025 – May 2025 · Bangalore, India"
    const [durationRaw, locationRaw] = meta.split("·");
    const duration = escapeLatex((durationRaw || "").trim());
    const location = escapeLatex((locationRaw || "").trim());

    // Group bullets by bold headings if they exist
    const groupedContent: string[] = [];
    let currentGroup: { heading: string; bullets: string[] } | null = null;

    if (Array.isArray(item.bullets)) {
      item.bullets.forEach((bullet: string) => {
        const boldMatch = bullet.match(/^\*\*(.*?)\*\*/);

        if (boldMatch) {
          if (currentGroup) {
            groupedContent.push(formatBulletGroup(currentGroup));
          }
          currentGroup = {
            heading: boldMatch[1] ?? "",
            bullets: [],
          };
          // Add remaining text after bold as first bullet if exists
          const remaining = bullet.substring(boldMatch[0].length).trim();
          if (remaining) {
            currentGroup.bullets.push(remaining);
          }
        } else if (currentGroup) {
          // Add to current group
          currentGroup.bullets.push(bullet);
        } else {
          // No group, treat as standalone
          groupedContent.push(`\\begin{itemize}[itemsep=0pt,parsep=0pt,topsep=1pt]
  \\item ${escapeLatex(bullet)}
\\end{itemize}`);
        }
      });

      // Add final group if exists
      if (currentGroup) {
        groupedContent.push(formatBulletGroup(currentGroup));
      }
    }

    return `\\experienceentry{${company}}{${role}}{${duration}}{${location}}

${groupedContent.join("\n\\vspace{0.5mm}\n\n")}
\\vspace{1.5mm}
`;
  })
  .join("\n")}
`;
}

function formatBulletGroup(group: {
  heading: string;
  bullets: string[];
}): string {
  if (group.bullets.length === 0) {
    return `\\textbf{${escapeLatex(group.heading)}}`;
  }

  return `\\textbf{${escapeLatex(group.heading)}}
\\begin{itemize}[itemsep=0pt,parsep=0pt,topsep=1pt]
${group.bullets.map((b: string) => `    \\item ${escapeLatex(b)}`).join("\n")}
\\end{itemize}`;
}

function renderProjectsT3(section: any): string {
  if (!section?.content?.items?.length) return "";

  return `
\\section{PROJECTS}

${section.content.items
  .map((item: any) => {
    const title = escapeLatex(item.heading || "");
    const tech = escapeLatex(item.meta || "");
    const bullets =
      Array.isArray(item.bullets) && item.bullets.length
        ? `\\begin{itemize}[itemsep=0pt,parsep=0pt,topsep=1pt]
${item.bullets.map((b: string) => `    \\item ${escapeLatex(b)}`).join("\n")}
\\end{itemize}`
        : "";

    return `\\projectentry{${title}}{${tech}}

${bullets}
\\vspace{0.5mm}
`;
  })
  .join("\n")}
`;
}

function renderSkillsT3(section: any): string {
  if (!section?.content?.categories?.length) return "";

  return `
\\section{SKILLS}

${section.content.categories
  .map((cat: any) => {
    if (!cat?.name || !Array.isArray(cat.items) || !cat.items.length) return "";
    const skills = cat.items.map((s: string) => escapeLatex(s)).join(", ");
    return `\\textbf{${escapeLatex(cat.name)}:} ${skills}

\\vspace{2mm}
`;
  })
  .join("\n")}
`;
}

function renderEducationT3(section: any): string {
  if (!section?.content?.items?.length) return "";

  return `
\\section{EDUCATION}
${section.content.items
  .map((edu: any) => {
    const degree = escapeLatex(edu.degree || "");
    const inst = escapeLatex(edu.institution || "");
    const duration = escapeLatex(edu.duration || "");

    const gpaLine =
      edu.gpa && edu.gpa.trim() ? `CGPA: ${escapeLatex(edu.gpa)}` : "";
    const coursework =
      edu.details && Array.isArray(edu.details) && edu.details.length
        ? `Coursework: ${edu.details
            .map((d: string) => escapeLatex(d))
            .join(", ")}`
        : "";

    return `\\educationentry{${degree}}{${inst}}{${duration}}
${gpaLine ? `${gpaLine} \\\\\n` : ""}${coursework ? `${coursework}\n` : ""}\\par
\\vspace{2.0mm}
`;
  })
  .join("")}
`;
}

function renderAchievementsT3(section: any): string {
  if (!section?.content?.items?.length) return "";

  return `
\\section{ACHIEVEMENTS}
\\begin{itemize}[itemsep=0pt,parsep=0pt,topsep=1pt]
${section.content.items
  .map((item: string) => `    \\item ${escapeLatex(item)}`)
  .join("\n")}
\\end{itemize}
`;
}

function renderSectionT3(section: any): string {
  if (!section || !section.visible) return "";

  switch (section.type) {
    case "summary":
      return renderSummaryT3(section);
    case "experience":
      return renderExperienceT3(section);
    case "projects":
      return renderProjectsT3(section);
    case "skills":
      return renderSkillsT3(section);
    case "education":
      return renderEducationT3(section);
    case "achievements":
      return renderAchievementsT3(section);
    default:
      return "";
  }
}

function getTemplate3(data: ResumeData): string {
  const sections = [...data.sections].sort((a, b) => a.order - b.order);

  // Left column: Experience + Projects + Achievements
  const leftTypes = new Set(["experience", "projects", "achievements"]);
  const leftColumn = sections
    .filter((s) => leftTypes.has(s.type))
    .map((s) => renderSectionT3(s))
    .join("\n");

  // Right column: Summary + Skills + Education
  const rightTypes = new Set(["summary", "skills", "education"]);
  const rightColumn = sections
    .filter((s) => rightTypes.has(s.type))
    .map((s) => renderSectionT3(s))
    .join("\n");

  // Build GitHub link
  const githubUsername = data.header.github
    ? data.header.github.split("/").pop()?.trim() || ""
    : "";
  const githubLink = githubUsername
    ? `\\faGithub\\enspace \\href{${
        data.header.github
      }}{github.com/${escapeLatex(githubUsername)}}`
    : "";

  const fullName = `${data.header.firstName || ""} ${
    data.header.lastName || ""
  }`.trim();

  return `\\documentclass[10pt,a4paper]{moderncv}
\\moderncvtheme[blue]{banking}
\\nopagenumbers{}

\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.92]{geometry}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{enumitem}

% Macros
\\renewcommand*{\\labelitemi}{-}

\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}

\\newcommand*{\\experienceentry}[5][1.5mm]{
    \\subsection{#2} \\vspace{-1.5mm}
    \\begin{tabularx}{\\textwidth}{LR}
        {\\itshape #3} & {\\itshape #4, #5}
    \\end{tabularx}
    \\par\\addvspace{#1}
}

\\newcommand*{\\projectentry}[3][1.5mm]{
    \\subsection{#2} \\vspace{-1.5mm}
    {\\itshape #3}
    \\par\\addvspace{#1}
}

\\newcommand*{\\educationentry}[4][0.5mm]{
    \\begin{tabularx}{\\textwidth}{LR}
        {\\bfseries #3} & {\\bfseries #4} \\\\
    \\end{tabularx}
    {\\itshape #2}
    \\par\\addvspace{#1}
}

% Personal Data
\\firstname{${escapeLatex(data.header.firstName || "")}}
\\familyname{${escapeLatex(data.header.lastName || "")}}

\\begin{document}

% CUSTOM HEADER (no page break)
\\begin{center}
    {\\Huge\\color{color1}\\textbf{${escapeLatex(fullName)}}}\\\\[3pt]
    \\vspace{2mm}
    \\begin{tabularx}{\\textwidth}{C C C}
        \\emailsymbol\\enspace \\emaillink{${escapeLatex(data.header.email)}} & 
        \\mobilephonesymbol\\enspace ${escapeLatex(data.header.phone || "")} & 
        ${githubLink}
    \\end{tabularx}
\\end{center}
\\vspace{3mm}

% Two Column Layout
\\begin{minipage}[t]{0.62\\textwidth}
${leftColumn}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.35\\textwidth}
${rightColumn}
\\end{minipage}

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
    case 3:
      return getTemplate3(data);
    default:
      throw new Error(`Template ${templateId} not found. Available: 1, 2, 3`);
  }
}

export {
  getTemplate1 as template1,
  getTemplate2 as template2,
  getTemplate3 as template3,
};
