const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'uploads', 'files');
const OUT_FILE = path.join(OUT_DIR, 'uiux-foundations-module1-8pages.pdf');

const pages = [
  {
    title: 'UI/UX Foundations - Page 1',
    lines: [
      'Course: UI/UX Design Masterclass',
      'Module: UI/UX Foundations and Design Process',
      'Learning goal: Understand core UX principles and workflow.',
      '',
      'Topics:',
      '- Difference between UI and UX',
      '- Product thinking and user-centered design',
      '- End-to-end design lifecycle overview',
      '- Roles in a product team',
    ],
  },
  {
    title: 'Page 2 - Problem Framing',
    lines: [
      'Before design starts, frame the problem clearly.',
      '',
      'Checklist:',
      '- What user pain are we solving?',
      '- Who are the primary users?',
      '- What business outcome is expected?',
      '- What assumptions need validation?',
      '',
      'Output: concise problem statement.',
    ],
  },
  {
    title: 'Page 3 - Research Basics',
    lines: [
      'Research gives design decisions context.',
      '',
      'Methods:',
      '- User interviews',
      '- Competitor review',
      '- Analytics review',
      '- Existing support ticket analysis',
      '',
      'Output: key insights and opportunity areas.',
    ],
  },
  {
    title: 'Page 4 - Personas and Journeys',
    lines: [
      'Translate research into practical design tools.',
      '',
      'Deliverables:',
      '- Lightweight persona profile',
      '- User journey map',
      '- Friction point identification',
      '- Priority experience goals',
      '',
      'Output: experience direction for wireframes.',
    ],
  },
  {
    title: 'Page 5 - Information Architecture',
    lines: [
      'Define how information is structured.',
      '',
      'Core decisions:',
      '- Navigation model',
      '- Page hierarchy',
      '- Content grouping',
      '- CTA placement logic',
      '',
      'Output: sitemap and screen inventory.',
    ],
  },
  {
    title: 'Page 6 - Wireframing',
    lines: [
      'Wireframes test layout before visual polish.',
      '',
      'Focus:',
      '- Layout hierarchy',
      '- Content density',
      '- Interaction flow',
      '- Error and empty states',
      '',
      'Output: low-fidelity wireframe set.',
    ],
  },
  {
    title: 'Page 7 - Visual Direction',
    lines: [
      'Move from structure to visual expression.',
      '',
      'Design elements:',
      '- Typography scale',
      '- Color system',
      '- Spacing rhythm',
      '- Reusable components',
      '',
      'Output: high-fidelity key screens.',
    ],
  },
  {
    title: 'Page 8 - Validation and Iteration',
    lines: [
      'Design quality depends on validation.',
      '',
      'Validation loop:',
      '- Prototype critical flows',
      '- Run usability checks',
      '- Prioritize fixes by impact',
      '- Iterate and document decisions',
      '',
      'Completion outcome: test-backed UI direction.',
    ],
  },
];

const escapePdfText = (text) =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const contentStreamForPage = (page) => {
  const lines = [page.title, '', ...page.lines];
  const cmds = [];
  cmds.push('BT');
  cmds.push('/F1 18 Tf');
  cmds.push('72 780 Td');
  cmds.push(`${24} TL`);
  cmds.push(`(${escapePdfText(lines[0])}) Tj`);
  cmds.push('/F1 12 Tf');

  for (let i = 1; i < lines.length; i += 1) {
    cmds.push('T*');
    cmds.push(`(${escapePdfText(lines[i])}) Tj`);
  }

  cmds.push('ET');
  return cmds.join('\n');
};

const buildPdf = (pagesData) => {
  const objects = [];

  const addObj = (body) => {
    objects.push(body);
    return objects.length;
  };

  const fontObj = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const pageObjectIds = [];
  const contentObjectIds = [];

  for (const page of pagesData) {
    const stream = contentStreamForPage(page);
    const contentBody = `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`;
    const contentId = addObj(contentBody);
    contentObjectIds.push(contentId);

    const pageBody = `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentId} 0 R >>`;
    const pageId = addObj(pageBody);
    pageObjectIds.push(pageId);
  }

  const kidsRefs = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
  const pagesObj = addObj(`<< /Type /Pages /Kids [${kidsRefs}] /Count ${pageObjectIds.length} >>`);
  const catalogObj = addObj(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  for (const pageId of pageObjectIds) {
    objects[pageId - 1] = objects[pageId - 1].replace('/Parent 0 0 R', `/Parent ${pagesObj} 0 R`);
  }

  let output = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(output, 'utf8'));
    output += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(output, 'utf8');
  output += `xref\n0 ${objects.length + 1}\n`;
  output += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(output, 'utf8');
};

const run = () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const pdfBuffer = buildPdf(pages);
  fs.writeFileSync(OUT_FILE, pdfBuffer);
  console.log(`PDF generated: ${OUT_FILE}`);
};

run();

