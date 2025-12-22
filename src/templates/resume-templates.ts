import { number, z } from "zod";
import { resumeDataSchema } from "../schemas/resume-data-schema.ts";

type ResumeData = z.infer<typeof resumeDataSchema>;

function escapeLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/\&/g, '\\&')
    .replace(/\#/g, '\\#')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\_/g, '\\_')
    .replace(/\~/g, '\\textasciitilde{}')
    .replace(/\%/g, '\\%');
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
    \\textbf{\\Huge \\scshape ${escapeLatex(data.firstName)} ${escapeLatex(data.lastName)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(data.phone)} $|$ 
    \\href{mailto:${data.email}}{\\underline{${escapeLatex(data.email)}}}${
      data.linkedin ? ` $|$ \\href{https://linkedin.com/in/${escapeLatex(data.linkedin)}}{\\underline{linkedin.com/in/${escapeLatex(data.linkedin)}}}` : ''
    }${
      data.github ? ` $|$ \\href{https://github.com/${escapeLatex(data.github)}}{\\underline{github.com/${escapeLatex(data.github)}}}` : ''
    }
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
${data.education.map((edu, index) => `    \\resumeSubheading
      {${escapeLatex(edu.institution || '')}}{${edu.location ? escapeLatex(edu.location) : ''}}
      {${escapeLatex(edu.degree || '')}}{${escapeLatex(edu.duration || '')}}
${edu.gpa ? `      \\resumeItem{CGPA: \\textbf{${escapeLatex(edu.gpa)}}} ` : ''}`).join('\n')}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${(data.experience || []).map((exp, index) => `    \\resumeSubheading
      {${escapeLatex(exp.position || '')}}{${escapeLatex(exp.duration || '')}}
      {${escapeLatex(exp.company || '')}}{${exp.location ? escapeLatex(exp.location) : ''}}
      \\resumeItemListStart
${(exp.bullets || []).map(bullet => `        \\resumeItem{${escapeLatex(bullet || '')}}`).join('\n')}
      \\resumeItemListEnd
`).join('\n')}
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${(data.projects || []).map((proj, index) => `    \\resumeProjectHeading
      {\\textbf{\\href{${proj.url || ''}}{${escapeLatex(proj.name || '')}}}${
        proj?.github ? ` $|$ \\href{${proj?.github || ''}}{\\textbf{\\textcolor{blue}{\\underline{GitHub}}}}` : ''
      } $|$ \\emph{${(proj.tech || []).map(t => escapeLatex(t || '')).join(', ')}}} {${escapeLatex(proj?.duration || '')}}
      \\resumeItemListStart
${(proj.bullets || []).map(b => `        \\resumeItem{${escapeLatex(b || '')}}`).join('\n')}
      \\resumeItemListEnd
`).join('\n')}
  \\resumeSubHeadingListEnd

%-----------ACHIEVEMENTS-----------
\\section{Achievements}
  \\resumeItemListStart
${(data.achievements || []).map(ach => `    \\resumeItem{${escapeLatex(ach || '')}}`).join('\n')}
  \\resumeItemListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{
      \\item \\textbf{Languages}: ${(data.skills?.languages || []).map(l => escapeLatex(l || '')).join(', ')}
      \\item \\textbf{Frameworks}: ${(data.skills?.frameworks || []).map(f => escapeLatex(f || '')).join(', ')}
      \\item \\textbf{Databases}: ${(data.skills?.databases || []).map(d => escapeLatex(d || '')).join(', ')}
      \\item \\textbf{Tools}: ${(data.skills?.tools || []).map(t => escapeLatex(t || '')).join(', ')}
      \\item \\textbf{Libraries}: ${(data.skills?.libraries || []).map(l => escapeLatex(l || '')).join(', ')}
      \\item \\textbf{Concepts}: ${(data.skills?.concepts || []).map(c => escapeLatex(c || '')).join(', ')}
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
  ${data.summary ? '' : ('Backend Engineer Intern')}\\\\[2pt]
  \\small
  ${data.phone} \\,|\\, 
  \\href{mailto:${data.email}}{${data.email}} \\,|\\,
  ${data.github ? `\\href{${data.github}}{github.com/${data.github.split('/').pop()}} \\,|\\,` : ''}
  ${data.linkedin ? `\\href{${data.linkedin}}{linkedin.com/in/${data.linkedin.split('/').pop()}}` : ''}
\\end{center}

${data.summary ? `
%==================== SUMMARY ====================
\\section*{SUMMARY}
${data.summary}
` : ''}

%==================== EDUCATION ====================
\\section*{EDUCATION}
\\begin{tabularx}{\\textwidth}{|>{\\centering\\arraybackslash}p{1.6cm}|X|X|>{\\centering\\arraybackslash}p{1.8cm}|}
\\hline
\\textbf{Year} & \\textbf{Degree/Certificate} & \\textbf{Institute} & \\textbf{CGPA} \\\\ \\hline
${data.education.map(edu => 
  `${edu.duration} & ${edu.degree} & ${edu.institution}${edu.location ? ', ' + edu.location : ''} & ${edu.gpa || 'N/A'} \\\\ \\hline`
).join('\n')}
\\end{tabularx}

%==================== EXPERIENCE ====================
\\section*{EXPERIENCE}
${data.experience && data.experience.length > 0 ? data.experience.map(exp => `\\textbf{${exp.position}} \\hfill \\textit{${exp.duration}}\\\\
\\textit{${exp.company}} \\hfill \\textit{${exp.location || 'Remote'}}
\\begin{itemize}[label=--]
${exp.bullets.map(bullet => `  \\item ${bullet}`).join('\n')}
\\end{itemize}
`).join('\n') : ''}

%==================== PROJECTS ====================
\\section*{PROJECTS}
${data.projects.map(project => `
\\textbf{${project.name}${project.description ? ' -- ' + project.description : ''}}${
  project.url ? ` \\hfill \\textit{\\href{${project.url}}{Github}}` : ''
}
\\begin{itemize}[label=--]
${project.bullets && project.bullets.length > 0
  ? project.bullets.map(bullet => `  \\item ${bullet}`).join('\n')
  : (project.description ? `  \\item ${project.description}` : '')
}
\\end{itemize}
`).join('\n')}

%==================== TECHNICAL SKILLS ====================
\\section*{TECHNICAL SKILLS}
\\begin{itemize}[label=\\textbullet]
  \\item \\textbf{Languages}: ${data.skills.languages.join(', ')}
  ${data.skills.frameworks && data.skills.frameworks.length > 0 ? `\\item \\textbf{Frameworks}: ${data.skills.frameworks.join(', ')}` : ''}
  ${data.skills.tools && data.skills.tools.length > 0 ? `\\item \\textbf{Tools \\& Infra}: ${data.skills.tools.join(', ')}` : ''}
  ${data.skills.platforms && data.skills.platforms.length > 0 ? `\\item \\textbf{Platforms}: ${data.skills.platforms.join(', ')}` : ''}
\\end{itemize}

%==================== ACHIEVEMENTS ====================
${data.achievements && data.achievements.length > 0 ? `\\section*{ACHIEVEMENTS \\& CERTIFICATIONS}
\\begin{itemize}[label=\\textbullet]
${data.achievements.map(achievement => `  \\item ${achievement}`).join('\n')}
\\end{itemize}
` : ''}

\\end{document}
`;
}




export function getResumeTemplate(data: ResumeData, templateId: number): string {
  switch (templateId) {
    case 1 :
      return getTemplate1(data);
      case 2:
        return getTemplate2(data);
    
    default:
      throw new Error(`Template ${templateId} not found. Available templates: template1`);
  }
}

export const template1 = getTemplate1;
