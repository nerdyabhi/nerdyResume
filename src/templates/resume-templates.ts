// export const template1 = `
// \\documentclass[10pt,a4paper]{article}

// % Encoding & font
// \\usepackage[utf8]{inputenc}
// \\usepackage[T1]{fontenc}

// % Layout
// \\usepackage[a4paper,top=1.75cm,bottom=0.6cm,left=1.5cm,right=1.5cm]{geometry}
// \\usepackage{fancyhdr}
// \\setlength{\\headheight}{-5pt}
// \\setlength{\\parindent}{0pt}

// % Logic
// \\usepackage{xifthen}

// % Tables & layout helpers
// \\usepackage{multicol}
// \\usepackage{multirow}
// \\usepackage{array}
// \\newcolumntype{x}[1]{>{\\raggedleft\\hspace{0pt}}p{#1}}

// % Graphics
// \\usepackage{graphicx}
// \\usepackage{wrapfig}
// \\usepackage{float}
// \\usepackage{tikz}
// \\usetikzlibrary{shapes,backgrounds,mindmap,trees}

// % Colors & links
// \\usepackage{color}
// \\usepackage[hidelinks]{hyperref}

// \\definecolor{sectcol}{RGB}{90,90,120}
// \\definecolor{bgcol}{RGB}{110,110,110}
// \\definecolor{softcol}{RGB}{225,225,225}

// % Header appearance
// \\pagestyle{fancy}
// \\lhead{}
// \\chead{\\small{
//   Anubhav Singh $\\,\\cdot\\,$
//   Software Engineer $\\,\\cdot\\,$
//   Kolkata, India $\\,\\cdot\\,$
//   \\textcolor{sectcol}{\\textbf{\\href{mailto:xprilion@gmail.com}{xprilion@gmail.com}}} $\\,\\cdot\\,$
//   +91-XXX-XXXX-XXX
// }}
// \\rhead{}
// \\renewcommand{\\headrulewidth}{0pt}
// \\renewcommand{\\footrulewidth}{0pt}
// \\renewcommand{\\thepage}{}
// \\renewcommand{\\thesection}{}

// % Custom strut
// \\newcommand{\\mystrut}{\\rule[-.3\\baselineskip]{0pt}{\\baselineskip}}

// % Arrow graphics
// \\newcommand{\\tzlarrow}{(0,0) -- (0.2,0) -- (0.3,0.2) -- (0.2,0.4) -- (0,0.4) -- (0.1,0.2) -- cycle;}
// \\newcommand{\\larrow}[1]{
//   \\begin{tikzpicture}[scale=0.58]
//     \\filldraw[fill=#1!100,draw=#1!100!black] \\tzlarrow
//   \\end{tikzpicture}
// }
// \\newcommand{\\tzrarrow}{(0,0.2) -- (0.1,0) -- (0.3,0) -- (0.2,0.2) -- (0.3,0.4) -- (0.1,0.4) -- cycle;}
// \\newcommand{\\rarrow}{
//   \\begin{tikzpicture}[scale=0.7]
//     \\filldraw[fill=sectcol!100,draw=sectcol!100!black] \\tzrarrow
//   \\end{tikzpicture}
// }

// % Section header
// \\newcommand{\\cvsection}[1]{
//   \\vspace{10pt}
//   \\colorbox{sectcol}{\\mystrut \\makebox[1\\linewidth][l]{
//     \\larrow{bgcol} \\hspace{-8pt} \\larrow{bgcol} \\hspace{-8pt}
//     \\larrow{bgcol}\\textcolor{white}{\\textbf{#1}}\\hspace{4pt}
//   }}\\\\
// }

// % Meta row
// \\newcommand{\\metasection}[2]{
//   \\begin{tabular*}{1\\textwidth}{p{2.4cm} p{11cm}}
//     \\larrow{bgcol} \\normalsize{\\textcolor{sectcol}{#1}} & #2 \\\\[10pt]
//   \\end{tabular*}
// }

// % Experience entry
// \\newcommand{\\cvevent}[3]{
//   \\begin{tabular*}{1\\textwidth}{p{2.5cm} p{10.5cm} x{4.0cm}}
//     \\textcolor{bgcol}{#1} & \\textbf{#2} & \\textcolor{sectcol}{#3}
//   \\end{tabular*}
//   \\vspace{-10pt}
//   \\textcolor{softcol}{\\hrule}
//   \\vspace{10pt}
// }

// % Experience / project bullet
// \\newcommand{\\cvdetail}[1]{
//   \\begin{tabular*}{1\\textwidth}{p{2.5cm} p{14.5cm}}
//     & \\larrow{bgcol}~#1 \\\\[3pt]
//   \\end{tabular*}
// }

// \\title{resume}

// \\begin{document}
// \\pagestyle{fancy}

// % Title header bar
// \\vspace{-20pt}
// \\hspace{-0.25\\linewidth}\\colorbox{bgcol}{
//   \\makebox[1.5\\linewidth][c]{
//     \\Huge{\\textcolor{white}{\\textsc{Anubhav Singh}}}
//     \\textcolor{sectcol}{\\rule[-1mm]{1mm}{0.9cm}}
//     \\Huge{\\textcolor{white}{\\textsc{Resume}}}
//   }
// }

// % Meta section
// \\vspace{-90pt}
// \\metasection{Portfolio:}{\\href{https://xprilion.com}{xprilion.com}}
// \\metasection{GitHub:}{\\href{https://github.com/xprilion}{github.com/xprilion}}
// \\metasection{Skills:}{Python, PHP, C++, JavaScript, SQL, Bash, Java; Scikit, NLTK, SpaCy, TensorFlow, Keras, Django, Flask, Node.js, LAMP; Kubernetes, Docker, Git, PostgreSQL, MySQL, SQLite}
// \\metasection{Platforms:}{Linux, Web, Windows, Arduino, Raspberry Pi, AWS, GCP, Alibaba Cloud, IBM Cloud}
// \\metasection{Soft Skills:}{Leadership, Event Management, Writing, Public Speaking, Time Management}

// % Education
// \\cvsection{Education}

// \\cvevent{Jul 2016 -- Jun 2020}{Bachelor of Technology - Information Technology}{Netaji Subhash Engineering College, Kolkata, India}
// \\cvdetail{GPA: 7.27 — Courses: Operating Systems, Data Structures, Analysis of Algorithms, Artificial Intelligence, Machine Learning, Networking, Databases.}

// % Experience
// \\cvsection{Experience}

// \\cvevent{May 2019 -- Sep 2019}{Student Developer (Full-time), Google Summer of Code — Submitty}{Remote}
// \\cvdetail{Upgraded the discussion forum backend to handle large databases by refactoring for performance and scalability.}
// \\cvdetail{Converted Symfony \\& Twig-based forum components into a REST-first API interface for better integration.}
// \\cvdetail{Implemented a Ratchet PHP WebSocket server for low-latency, real-time posts and thread updates.}

// \\cvevent{Dec 2018 -- Present}{Instructor (Part-time, Contract), DataCamp Inc.}{Remote}
// \\cvdetail{Built a project-based course on finding movie similarity from plot summaries using unsupervised learning and NLP.}
// \\cvdetail{Created a tutorial introducing reinforcement learning and the Q-learning algorithm.}
// \\cvdetail{Courses taken by 250+ students with an average rating of 4.65/5.}

// % Projects
// \\cvsection{Projects}

// \\cvevent{Oct 2018}{Vison — Multimedia Search Engine}{NLP, Search, Web Crawlers, Multimedia}
// \\cvdetail{Research-oriented, open-source search engine for reverse multimedia search for small and mid-scale enterprises.}
// \\cvdetail{Tech: Python, Node.js, Intel OpenVINO Toolkit, Selenium, TensorFlow.}

// \\cvevent{Aug 2018}{Reinforcement Learning-based Traffic Control System}{RL, Computer Vision}
// \\cvdetail{Designed an AI model to improve city traffic flow by around 50\\% using RL and computer vision.}
// \\cvdetail{Tech: Python, Alibaba Cloud, Raspberry Pi, Arduino, SUMO, OpenCV.}

// \\cvevent{Mar 2018}{Panorama from Satellite Imagery using Distributed Computing}{Distributed Computing, Image Processing}
// \\cvdetail{Stitched drone images (provided by ISRO) using distributed public compute nodes, significantly reducing processing time.}
// \\cvdetail{Tech: PHP, C++, Java, Python.}

// \\cvevent{Sep 2018}{Drag-and-drop Machine Learning Learning Environment}{Web Dev, ML}
// \\cvdetail{Scratch-like tool for designing ML pipelines with built-in tutorials for each concept.}
// \\cvdetail{Tech: Python, JavaScript.}

// \\cvevent{May 2012}{Search Engine and Social Network}{Web Dev, Crawling, Search}
// \\cvdetail{Built a combined social network and search engine integrating ideas from Facebook and Google.}
// \\cvdetail{Site reached top 1000 websites in India (2012–2013). Tech: PHP, MySQL, HTML, CSS, WebSockets, JavaScript, RSS, XML.}

// % Publications
// \\cvsection{Publications}

// \\cvevent{Nov 2018}{Book: Deep Learning on Web}{Web Dev, Deep Learning}
// \\cvdetail{Work-in-progress book with Packt Publishing on building deep learning systems for the web.}
// \\cvdetail{Tech: Django, Python, AWS, GCP, Azure.}

// \\cvevent{Dec 2018}{Book: Deep Learning on Mobile Devices}{Flutter, Deep Learning}
// \\cvdetail{Work-in-progress book with Packt Publishing on mobile deep learning applications.}
// \\cvdetail{Tech: Flutter, Android, Firebase, TensorFlow, Python, Dart.}

// % Honors & Awards
// \\cvsection{Honors \\& Awards}

// \\cvdetail{Awarded title of Intel Software Innovator (May 2019).}
// \\cvdetail{Second Runner-up at TCS EngiNx Engineering Project Innovation Contest (Sep 2018).}
// \\cvdetail{Runner-up at Facebook Developers Circle Hackathon (Aug 2017).}

// % Volunteer Experience
// \\cvsection{Volunteer Experience}

// \\cvevent{Jan 2019 -- Present}{Community Lead, Developer Student Clubs NSEC}{Kolkata, India}
// \\cvdetail{Conducted online and offline technical and soft-skills training, impacting over 3{,}000 students.}

// \\cvevent{Jan 2018 -- Present}{Event Organizer, Google Developers Group Kolkata}{Kolkata, India}
// \\cvdetail{Organized events, workshops, and talks reaching over 7{,}000 developers.}

// \\end{document}
// `.trim();

// export const template1 = `
// \\documentclass[a4paper,20pt]{article}

// \\usepackage{latexsym}
// \\usepackage[empty]{fullpage}
// \\usepackage{titlesec}
// \\usepackage{marvosym}
// \\usepackage[usenames,dvipsnames]{color}
// \\usepackage{verbatim}
// \\usepackage{enumitem}
// \\usepackage[pdftex]{hyperref}
// \\usepackage{fancyhdr}

// \\pagestyle{fancy}
// \\fancyhf{}
// \\fancyfoot{}
// \\renewcommand{\\headrulewidth}{0pt}
// \\renewcommand{\\footrulewidth}{0pt}

// % Adjust margins
// \\addtolength{\\oddsidemargin}{-0.530in}
// \\addtolength{\\evensidemargin}{-0.375in}
// \\addtolength{\\textwidth}{1in}
// \\addtolength{\\topmargin}{-.45in}
// \\addtolength{\\textheight}{1in}

// \\urlstyle{rm}

// \\raggedbottom
// \\raggedright
// \\setlength{\\tabcolsep}{0in}

// % Sections formatting
// \\titleformat{\\section}{
//   \\vspace{-10pt}\\scshape\\raggedright\\large
// }{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

// %-------------------------
// % Custom commands
// \\newcommand{\\resumeItem}[2]{
//   \\item\\small{
//     \\textbf{#1}{: #2 \\vspace{-2pt}}
//   }
// }

// \\newcommand{\\resumeItemWithoutTitle}[1]{
//   \\item\\small{
//     {#1\\vspace{-2pt}}
//   }
// }

// \\newcommand{\\resumeSubheading}[4]{
//   \\vspace{-1pt}\\item
//     \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
//       \\textbf{#1} & #2 \\\\
//       \\textit{#3} & \\textit{#4} \\\\
//     \\end{tabular*}\\vspace{-5pt}
// }

// \\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-3pt}}

// \\renewcommand{\\labelitemii}{$\\circ$}

// \\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
// \\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
// \\newcommand{\\resumeItemListStart}{\\begin{itemize}}
// \\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

// %-----------------------------
// %%%%%%  CV STARTS HERE  %%%%%%

// \\begin{document}

// %----------HEADING-----------------
// \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
//   \\textbf{\\LARGE Anubhav Singh} & Email: \\href{mailto:xprilion@gmail.com}{xprilion@gmail.com}\\\\
//   \\href{https://xprilion.com}{Portfolio: xprilion.com} & Mobile:~~~+91-XXX-XXXX-XXX \\\\
//   \\href{https://github.com/xprilion}{Github: ~~github.com/xprilion} \\\\
// \\end{tabular*}

// %-----------EDUCATION-----------------
// \\section{~~Education}
//   \\resumeSubHeadingListStart
//     \\resumeSubheading
//       {Netaji Subhash Engineering College}{Kolkata, India}
//       {Bachelor of Technology - Information Technology; GPA: 7.27}{July 2016 -- June 2020}
//     \\resumeItemWithoutTitle{\\scriptsize \\textit{\\footnotesize{\\textbf{Courses:} Operating Systems, Data Structures, Analysis of Algorithms, Artificial Intelligence, Machine Learning, Networking, Databases}}}
//   \\resumeSubHeadingListEnd

// \\vspace{-5pt}
// \\section{Skills Summary}
//   \\resumeSubHeadingListStart
//     \\resumeSubItem{Languages}{Python, PHP, C++, JavaScript, SQL, Bash, Java}
//     \\resumeSubItem{Frameworks}{Scikit, NLTK, SpaCy, TensorFlow, Keras, Django, Flask, Node.js, LAMP}
//     \\resumeSubItem{Tools}{Kubernetes, Docker, Git, PostgreSQL, MySQL, SQLite}
//     \\resumeSubItem{Platforms}{Linux, Web, Windows, Arduino, Raspberry Pi, AWS, GCP, Alibaba Cloud, IBM Cloud}
//     \\resumeSubItem{Soft Skills}{Leadership, Event Management, Writing, Public Speaking, Time Management}
//   \\resumeSubHeadingListEnd

// \\vspace{-5pt}
// \\section{Experience}
//   \\resumeSubHeadingListStart
//     \\resumeSubheading{Google Summer of Code - Submitty}{Remote}
//       {Student Developer (Full-time)}{May 2019 -- Sep 2019}
//       \\resumeItemListStart
//         \\resumeItem{Discussion Forum Upgrades}{Refactored the forum for performance to handle large databases.}
//         \\resumeItem{REST API for Discussion Forum}{Converted Symfony \\& Twig-based forum components to an API-first interface.}
//         \\resumeItem{Ratchet PHP WebSocket}{Implemented a WebSocket for low-latency, real-time exchange of posts and thread updates.}
//       \\resumeItemListEnd
//     \\vspace{-5pt}
//     \\resumeSubheading
//       {DataCamp Inc.}{Remote}
//       {Instructor (Part-time, Contractual)}{Dec 2018 -- Present}
//       \\resumeItemListStart
//         \\resumeItem{Project Course - Find Movie Similarity from Plot Summaries}{Created a project-based course using unsupervised learning and natural language processing.}
//         \\resumeItem{Tutorial - Introduction to Reinforcement Learning}{Created a tutorial for the Q-learning RL algorithm and core concepts.}
//         \\resumeItem{Impact}{Course has been taken by 250+ students so far with a 4.65 average rating.}
//       \\resumeItemListEnd
//   \\resumeSubHeadingListEnd

// %-----------PROJECTS-----------------
// \\vspace{-5pt}
// \\section{Projects}
//   \\resumeSubHeadingListStart
//     \\resumeSubItem{Vison - multimedia search engine (NLP, Search Engine, Web Crawlers, Multimedia Processing)}{(Work in progress) Research-oriented, open-source search engine bringing reverse multimedia search to small \\& mid-scale enterprises. Tech: Python, Node.js, Intel OpenVINO Toolkit, Selenium, TensorFlow (Oct '18).}
//     \\vspace{2pt}
//     \\resumeSubItem{Reinforcement Learning based Traffic Control System (Reinforcement Learning, Computer Vision)}{AI model to resolve city traffic around 50\\% faster. Tech: Python, Alibaba Cloud, Raspberry Pi, Arduino, SUMO \\& OpenCV (Aug '18).}
//     \\vspace{2pt}
//     \\resumeSubItem{Panorama from Satellite Imagery using Distributed Computing (Distributed Computing, Image Processing)}{Drone images provided by ISRO stitched using distributed public compute nodes, greatly reducing processing time. Tech: PHP, C++, Java, Python (Mar '18).}
//     \\vspace{2pt}
//     \\resumeSubItem{Drag-n-drop machine learning learning environment (Web Development, Machine Learning)}{Scratch-like tool for implementing ML pipelines with built-in tutorials for each concept. Tech: Python, JavaScript (Sep '18).}
//     \\vspace{2pt}
//     \\resumeSubItem{Search Engine and Social Network (Web Development, Web Crawler, Search)}{Built from scratch a social network and search engine integrating Facebook and Google concepts; site reached top 1000 websites in India (2012–2013). Tech: PHP, MySQL, HTML, CSS, WebSockets, JavaScript, RSS, XML (May '12).}
//   \\resumeSubHeadingListEnd

// %-----------PUBLICATIONS-----------------
// \\vspace{-5pt}
// \\section{Publications}
//   \\resumeSubHeadingListStart
//     \\resumeSubItem{Book: Deep Learning on Web (Web Development, Deep Learning)}{Work-in-progress book to be published by Packt Publishing in late 2019. Tech: Django, Python, AWS, GCP, Azure (Nov '18).}
//     \\vspace{2pt}
//     \\resumeSubItem{Book: Deep Learning on Mobile Devices (Flutter App Development, Deep Learning)}{Work-in-progress book to be published by Packt Publishing in late 2019. Tech: Flutter, Android, Firebase, TensorFlow, Python, Dart (Dec '18).}
//   \\resumeSubHeadingListEnd

// %-----------AWARDS-----------------
// \\vspace{-5pt}
// \\section{Honors and Awards}
// \\begin{description}[font=$\\bullet$]
//   \\item Awarded title of Intel Software Innovator -- May 2019
//   \\vspace{-5pt}
//   \\item Second Runner-up at TCS EngiNx Engineering Project Innovation Contest -- Sep 2018
//   \\vspace{-5pt}
//   \\item Runner-up at Facebook Developers Circle Hackathon -- Aug 2017
// \\end{description}

// %-----------VOLUNTEER-----------------
// \\vspace{-5pt}
// \\section{Volunteer Experience}
//   \\resumeSubHeadingListStart
//     \\resumeSubheading
//       {Community Lead at Developer Student Clubs NSEC}{Kolkata, India}
//       {Conducted online and offline technical \\& soft-skills training impacting over 3,000 students.}{Jan 2019 -- Present}
//     \\vspace{5pt}
//     \\resumeSubheading
//       {Event Organizer at Google Developers Group Kolkata}{Kolkata, India}
//       {Organized events, workshops, and talks reaching over 7,000 developers.}{Jan 2018 -- Present}
//   \\resumeSubHeadingListEnd

// \\end{document}
// `.trim();

export const template1 = `
\\documentclass[letterpaper,11.5pt]{article}

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
% \\input{glyphtounicode} % comment out for texlive.net safety

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

% Ensure ATS-friendly
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1\\vspace{-2pt}}
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
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
  \\textbf{\\Huge \\scshape Abhi Sharma} \\\\[-2pt]
  \\small
  +91 97973-85132 $|$
  \\href{mailto:officeAbhisharma@gmail.com}{\\underline{officeAbhisharma@gmail.com}} $|$
  \\href{https://linkedin.com/in/thegeekyabhi}{\\underline{linkedin.com/in/thegeekyabhi}} $|$
  \\href{https://github.com/nerdyabhi}{\\underline{github.com/nerdyabhi}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Netaji Subhash Engineering College}{Kolkata, IN}
      {Bachelor of Technology in Computer Science}{Aug. 2022 -- Oct. 2026}
      \\resumeItem{CGPA: \\textbf{8.11/10} $|$ Relevant Coursework: Data Structures, Algorithms, DBMS, Computer Networks, OOPs}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Backend Engineer Intern}{July 2025 -- Present}
      {Outbox.vc}{Bangalore}
      \\resumeItemListStart
        \\resumeItem{Developed and automated the \\textbf{domain purchase workflow}, integrating multiple registrar APIs to fetch available domains, leveraging \\textbf{AI-based categorization} to identify optimal choices, and automating the end-to-end purchase process.}
        \\resumeItem{Built \\textbf{Onebox} — an intelligent, AI-powered email client with a scalable backend architecture.}
        \\resumeItem{Designed a \\textbf{multi-agent orchestration system} enabling AI agents to autonomously write, categorize, and summarize emails.}
        \\resumeItem{Implemented distributed processing using \\textbf{Kafka} and \\textbf{Redis BullMQ} for task scheduling, queue management, and horizontal scalability.}
        \\resumeItem{Optimized async workflows and caching layers to improve responsiveness and throughput under heavy load.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart

    \\resumeProjectHeading
      {\\textbf{\\href{https://bettermail.tech/}{\\textcolor{blue}{\\underline{BetterMail}}}} $|$
       \\href{https://github.com/nerdyabhi/bettermail}{\\textbf{\\textcolor{blue}{\\underline{GitHub}}}} $|$
       \\emph{React, Node.js, PostgreSQL, Pinecone, Elasticsearch}}
      {Jun 2025 -- Jul 2025}
      \\resumeItemListStart
        \\resumeItem{Built a full-stack email management platform integrating \\textbf{Gmail and Outlook APIs} with AI-powered features serving \\textbf{200+ beta users}.}
        \\resumeItem{Implemented \\textbf{Elasticsearch} for full-text search capabilities, achieving \\textbf{200\\% faster} search performance compared to traditional SQL queries.}
        \\resumeItem{Designed and optimized \\textbf{PostgreSQL} with proper indexing strategies, handling \\textbf{10,000+ emails} with sub-second query response times.}
        \\resumeItem{Created a responsive frontend with keyboard shortcuts and real-time updates, improving user productivity by \\textbf{25\\%}.}
      \\resumeItemListEnd

    \\resumeProjectHeading
      {\\textbf{\\href{https://uber.abhi.works/}{\\textcolor{blue}{\\underline{UberClone - Real-Time Ride Booking Platform}}}} $|$
       \\href{https://github.com/nerdyabhi/uber}{\\textbf{\\textcolor{blue}{\\underline{GitHub}}}} $|$
       \\emph{MERN Stack, Socket.io, Leaflet, JWT}}
      {Dec 2024}
      \\resumeItemListStart
        \\resumeItem{Engineered a full-stack ride-sharing application with separate user and driver interfaces using the \\textbf{MERN stack}, supporting \\textbf{150+ concurrent users}.}
        \\resumeItem{Implemented real-time bidirectional communication using \\textbf{Socket.io}, reducing ride confirmation latency by \\textbf{40\\%}.}
        \\resumeItem{Integrated \\textbf{Leaflet.js} for interactive maps with real-time GPS tracking, achieving \\textbf{50-meter} location accuracy.}
        \\resumeItem{Built a secure authentication system with \\textbf{JWT tokens} and role-based access control for users and drivers.}
      \\resumeItemListEnd

    \\resumeProjectHeading
      {\\textbf{\\href{https://t.me/nerdyabhi_bot}{\\textcolor{blue}{\\underline{NerdyBot - Intelligent Telegram Assistant}}}} $|$
       \\href{https://github.com/nerdyabhi/Telegram-Bot-NodeJS}{\\textbf{\\textcolor{blue}{\\underline{GitHub}}}} $|$
       \\emph{Node.js, MongoDB, Gemini API, Express.js}}
      {Sep 2024 -- Oct 2024}
      \\resumeItemListStart
        \\resumeItem{Developed a feature-rich Telegram bot using \\textbf{Node.js} and Telegram libraries, serving \\textbf{500+ active users} with 95\\% uptime.}
        \\resumeItem{Integrated \\textbf{Google Gemini API} for AI-powered conversational responses and dynamic image generation, increasing user engagement by \\textbf{60\\%}.}
        \\resumeItem{Implemented a task management system with \\textbf{MongoDB}, efficiently storing and retrieving \\textbf{1,000+ user tasks} with optimized queries.}
      \\resumeItemListEnd

  \\resumeSubHeadingListEnd

%-----------ACHIEVEMENTS-----------
\\section{Achievements \\& Certifications}
  \\resumeItemListStart
    \\resumeItem{Ranked in \\textbf{top 11.76\\% globally} on LeetCode with \\textbf{750+ problems solved} across Data Structures and Algorithms.}
    \\resumeItem{LeetCode Profile: \\href{https://leetcode.com/u/theabhisharma/}{\\textbf{\\underline{leetcode.com/theabhisharma}}}.}
    \\resumeItem{GFG Profile: \\href{https://www.geeksforgeeks.org/user/thegeekyabhi/}{\\textbf{\\underline{geeksforgeeks.org/thegeekyabhi}}}.}
    \\resumeItem{Completed \\textbf{HackerRank Programming (Intermediate)} certification: \\href{https://www.hackerrank.com/certificates/b15a0a18b098}{\\textbf{\\underline{Certificate Link}}}.}
    \\resumeItem{Completed \\textbf{HackerRank SQL (Intermediate)} certification: \\href{https://www.hackerrank.com/certificates/1fefc0cb48a2}{\\textbf{\\underline{Certificate Link}}}.}
  \\resumeItemListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
\\small\\item{
\\textbf{Programming Languages}: JavaScript, C++, Python\\\\
\\textbf{Frontend}: React.js, Next.js, Tailwind CSS\\\\
\\textbf{Backend}: Node.js, Express.js, BullMQ\\\\
\\textbf{Databases}: PostgreSQL, MongoDB, MySQL\\\\
\\textbf{Tools \\& Technologies}: Git, GitHub, Postman, OpenAI Agents SDK\\\\ 
\\textbf{Scalability}: BullMQ, Kafka, Redis, Algorithms
}
\\end{itemize}

\\end{document}
`.trim();
