export const template1 = `
\\documentclass[10pt,a4paper]{article}

% Encoding & font
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[default]{raleway}
\\renewcommand*\\familydefault{\\sfdefault}

% Layout
\\usepackage[a4paper,top=1.75cm,bottom=0.6cm,left=1.5cm,right=1.5cm]{geometry}
\\usepackage{fancyhdr}
\\setlength{\\headheight}{-5pt}
\\setlength{\\parindent}{0pt}

% Logic
\\usepackage{xifthen}

% Tables & layout helpers
\\usepackage{multicol}
\\usepackage{multirow}
\\usepackage{array}
\\newcolumntype{x}[1]{>{\\raggedleft\\hspace{0pt}}p{#1}}

% Graphics
\\usepackage{graphicx}
\\usepackage{wrapfig}
\\usepackage{float}
\\usepackage{tikz}
\\usetikzlibrary{shapes,backgrounds,mindmap,trees}

% Colors & links
\\usepackage{color}
\\usepackage[hidelinks]{hyperref}

\\definecolor{sectcol}{RGB}{90,90,120}
\\definecolor{bgcol}{RGB}{110,110,110}
\\definecolor{softcol}{RGB}{225,225,225}

% Header appearance
\\pagestyle{fancy}
\\lhead{}
\\chead{\\small{
  {{NAME}} $\\cdot$
  {{TITLE}} $\\cdot$
  {{LOCATION}} $\\cdot$
  \\textcolor{sectcol}{\\textbf{\\href{mailto:{{EMAIL}}}{{EMAIL}}}} $\\cdot$
  {{PHONE}}
}}
\\rhead{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\renewcommand{\\thepage}{}
\\renewcommand{\\thesection}{}

% Custom strut
\\newcommand{\\mystrut}{\\rule[-.3\\baselineskip]{0pt}{\\baselineskip}}

% Arrow graphics
\\newcommand{\\tzlarrow}{(0,0) -- (0.2,0) -- (0.3,0.2) -- (0.2,0.4) -- (0,0.4) -- (0.1,0.2) -- cycle;}
\\newcommand{\\larrow}[1]{
  \\begin{tikzpicture}[scale=0.58]
    \\filldraw[fill=#1!100,draw=#1!100!black] \\tzlarrow
  \\end{tikzpicture}
}
\\newcommand{\\tzrarrow}{(0,0.2) -- (0.1,0) -- (0.3,0) -- (0.2,0.2) -- (0.3,0.4) -- (0.1,0.4) -- cycle;}
\\newcommand{\\rarrow}{
  \\begin{tikzpicture}[scale=0.7]
    \\filldraw[fill=sectcol!100,draw=sectcol!100!black] \\tzrarrow
  \\end{tikzpicture}
}

% Section header
\\newcommand{\\cvsection}[1]{
  \\vspace{10pt}
  \\colorbox{sectcol}{\\mystrut \\makebox[1\\linewidth][l]{
    \\larrow{bgcol} \\hspace{-8pt} \\larrow{bgcol} \\hspace{-8pt}
    \\larrow{bgcol}\\textcolor{white}{\\textbf{#1}}\\hspace{4pt}
  }}\\\\
}

% Meta row
\\newcommand{\\metasection}[2]{
  \\begin{tabular*}{1\\textwidth}{p{2.4cm} p{11cm}}
    \\larrow{bgcol} \\normalsize{\\textcolor{sectcol}{#1}} & #2 \\\\[10pt]
  \\end{tabular*}
}

% Experience entry
\\newcommand{\\cvevent}[3]{
  \\begin{tabular*}{1\\textwidth}{p{2.5cm} p{10.5cm} x{4.0cm}}
    \\textcolor{bgcol}{#1} & \\textbf{#2} & \\textcolor{sectcol}{#3}
  \\end{tabular*}
  \\vspace{-10pt}
  \\textcolor{softcol}{\\hrule}
  \\vspace{10pt}
}

% Experience bullet
\\newcommand{\\cvdetail}[1]{
  \\begin{tabular*}{1\\textwidth}{p{2.5cm} p{14.5cm}}
    & \\larrow{bgcol}~#1 \\\\[3pt]
  \\end{tabular*}
}

\\title{resume}

\\begin{document}
\\pagestyle{fancy}

% Title header bar
\\vspace{-20pt}
\\hspace{-0.25\\linewidth}\\colorbox{bgcol}{
  \\makebox[1.5\\linewidth][c]{
    \\HUGE{\\textcolor{white}{\\textsc{{{NAME}}}}}
    \\textcolor{sectcol}{\\rule[-1mm]{1mm}{0.9cm}}
    \\HUGE{\\textcolor{white}{\\textsc{Resume}}}
  }
}

% Meta section
\\vspace{-90pt}
\\metasection{Status:}{{{STATUS}}}
\\metasection{Skills:}{{{SKILLS_LINE}}}
\\metasection{Interests:}{{{INTERESTS_LINE}}}
\\metasection{Activities:}{{{ACTIVITIES_LINE}}}

% Summary
\\cvsection{Summary}
{{{SUMMARY_BLOCK}}}

% Experience
\\cvsection{Experience}
{{{EXPERIENCE_BLOCK}}}

% Education
\\cvsection{Education}
{{{EDUCATION_BLOCK}}}

% Footer links
\\null
\\vspace*{\\fill}
\\hspace{-0.25\\linewidth}\\colorbox{bgcol}{
  \\makebox[1.5\\linewidth][c]{
    \\mystrut \\small {{{FOOTER_LINKS}}}
  }
}

\\end{document}
`;

export const template2 = `
\\documentclass[letterpaper,11pt]{article}
% NOTE: we'll inline particulars instead of \\input{particulars}
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
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}

% \\input{glyphtounicode}   % you can drop this if not available

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-0.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure machine readable / ATS parsable
\\pdfgentounicode=1

% ---------- Custom commands ----------
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1\\vspace{-2pt}}
}

\\newcommand{\\classesList}[4]{
  \\item\\small{#1 #2 #3 #4\\vspace{-2pt}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
  \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & \\textbf{\\small #2} \\\\
    \\textit{\\small #3} & \\textit{\\small #4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textit{\\small #1} & \\textit{\\small #2} \\\\
  \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
  \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\small #1 & \\textbf{\\small #2}\\\\
  \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

% ---------- Title section (with placeholders) ----------
\\newcommand{\\titlesection}{
\\begin{center}
    {\\Huge \\scshape {{FIRST_NAME}}~{{LAST_NAME}}} \\\\[-1pt]
    \\small
    \\raisebox{-0.1\\height}\\faPhone\\ {{PHONE}} ~
    \\href{mailto:{{EMAIL}}}{\\raisebox{-0.2\\height}\\faEnvelope\\ \\underline{{EMAIL}}} \\\\
    \\href{{LINKEDIN}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{{LINKEDIN}}} ~
    \\href{{GITHUB}}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{{GITHUB}}}
    \\vspace{-8pt}
\\end{center}
}

\\begin{document}
\\titlesection

% Optional profile summary
{{SUMMARY_BLOCK}}

% Education
\\section{Education}
\\resumeSubHeadingListStart
  {{EDUCATION_BLOCK}}
\\resumeSubHeadingListEnd

% Achievements
\\section{Achievements}
{{ACHIEVEMENTS_BLOCK}}

% Experience
\\section{Experience}
\\resumeSubHeadingListStart
  {{EXPERIENCE_BLOCK}}
\\resumeSubHeadingListEnd

% Internships
{{INTERNSHIPS_SECTION}}

% Projects
{{PROJECTS_SECTION}}

\\end{document}
`.trim();

export const template3 = `
\\documentclass[a4paper,11pt]{article}

% Basic packages
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[pdftex]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Margins
\\addtolength{\\oddsidemargin}{-0.53in}
\\addtolength{\\evensidemargin}{-0.375in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-0.45in}
\\addtolength{\\textheight}{1in}

\\urlstyle{rm}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{
  \\vspace{-10pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

% Custom commands
\\newcommand{\\resumeItem}[2]{
  \\item\\small{\\textbf{#1}: #2\\vspace{-2pt}}
}

\\newcommand{\\resumeItemWithoutTitle}[1]{
  \\item\\small{#1\\vspace{-2pt}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{#3} & \\textit{#4} \\\\
  \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-3pt}}

\\renewcommand{\\labelitemii}{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%==================== CV STARTS HERE ====================

\\begin{document}

% Heading
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{\\LARGE {{NAME}}} & Email: \\href{mailto:{{EMAIL}}}{{EMAIL}}\\\\
  \\href{{PORTFOLIO_URL}}{Portfolio: {{PORTFOLIO_LABEL}}} & Mobile: {{PHONE}} \\\\
  \\href{{GITHUB_URL}}{Github: {{GITHUB_LABEL}}} \\\\
\\end{tabular*}

% Education
\\section{Education}
\\resumeSubHeadingListStart
  {{EDUCATION_BLOCK}}
\\resumeSubHeadingListEnd

% Skills Summary
\\section{Skills Summary}
\\resumeSubHeadingListStart
  {{SKILLS_BLOCK}}
\\resumeSubHeadingListEnd

% Experience
\\section{Experience}
\\resumeSubHeadingListStart
  {{EXPERIENCE_BLOCK}}
\\resumeSubHeadingListEnd

% Projects
\\section{Projects}
\\resumeSubHeadingListStart
  {{PROJECTS_BLOCK}}
\\resumeSubHeadingListEnd

% Publications
\\section{Publications}
\\resumeSubHeadingListStart
  {{PUBLICATIONS_BLOCK}}
\\resumeSubHeadingListEnd

% Honors and Awards
\\section{Honors and Awards}
{{HONORS_BLOCK}}

% Volunteer Experience
\\section{Volunteer Experience}
\\resumeSubHeadingListStart
  {{VOLUNTEER_BLOCK}}
\\resumeSubHeadingListEnd

\\end{document}
`.trim();

export const template4 = `
\\documentclass[letterpaper,11pt]{article}

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
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

%\\usepackage[sfdefault]{FiraSans}
%\\usepackage[sfdefault]{roboto}
%\\usepackage[sfdefault]{noto-sans}
%\\usepackage[default]{sourcesanspro}
%\\usepackage{CormorantGaramond}
%\\usepackage{charter}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-0.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1\\vspace{-2pt}}
}

\\newcommand{\\classesList}[4]{
  \\item\\small{#1 #2 #3 #4\\vspace{-2pt}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
  \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & \\textbf{\\small #2} \\\\
    \\textit{\\small #3} & \\textit{\\small #4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textit{\\small #1} & \\textit{\\small #2} \\\\
  \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
  \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\small #1 & \\textbf{\\small #2}\\\\
  \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%==================== RESUME START ====================

\\begin{document}

% Heading
\\begin{center}
  {\\Huge \\scshape {{FIRST_NAME}}~{{LAST_NAME}}} \\\\[1pt]
  {{ADDRESS_LINE}} \\\\[1pt]
  \\small
  \\raisebox{-0.1\\height}\\faPhone~{{PHONE}} ~
  \\href{mailto:{{EMAIL}}}{\\raisebox{-0.2\\height}\\faEnvelope\\ \\underline{{EMAIL}}} ~
  \\href{{LINKEDIN_URL}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{{LINKEDIN_LABEL}}} ~
  \\href{{GITHUB_URL}}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{{GITHUB_LABEL}}}
  \\vspace{-8pt}
\\end{center}

% Education
\\section{Education}
\\resumeSubHeadingListStart
  {{EDUCATION_BLOCK}}
\\resumeSubHeadingListEnd

% Relevant Coursework
\\section{Relevant Coursework}
{{COURSEWORK_BLOCK}}

% Experience
\\section{Experience}
\\resumeSubHeadingListStart
  {{EXPERIENCE_BLOCK}}
\\resumeSubHeadingListEnd

% Projects
\\section{Projects}
\\resumeSubHeadingListStart
  {{PROJECTS_BLOCK}}
\\resumeSubHeadingListEnd

% Technical Skills
\\section{Technical Skills}
{{SKILLS_BLOCK}}

% Leadership / Extracurricular
\\section{Leadership / Extracurricular}
\\resumeSubHeadingListStart
  {{LEADERSHIP_BLOCK}}
\\resumeSubHeadingListEnd

\\end{document}
`.trim();

export const template5 = `
\\documentclass{tccv}
\\usepackage[english]{babel}

\\begin{document}

\\part{{{NAME}}}

\\section{Work experience}

\\begin{eventlist}
{{WORK_EXPERIENCE_BLOCK}}
\\end{eventlist}

\\section{Education}

\\begin{yearlist}
{{EDUCATION_BLOCK}}
\\end{yearlist}

\\personal
  [{{PERSONAL_URL}}]
  {{{ADDRESS}}}
  {{{PHONE}}}
  {{{EMAIL}}}

\\section{Extra Curricular Activities}

\\begin{yearlist}
{{EXTRACURRICULAR_BLOCK}}
\\end{yearlist}

\\section{Communication skills}

\\begin{factlist}
{{COMMUNICATION_BLOCK}}
\\end{factlist}

\\section{Achievements}

\\begin{yearlist}
{{ACHIEVEMENTS_BLOCK}}
\\end{yearlist}

\\vspace{-6pt}
\\section{Computer skills}

\\begin{factlist}
{{COMPUTER_SKILLS_BLOCK}}
\\end{factlist}

\\end{document}
`.trim();
