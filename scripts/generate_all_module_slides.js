const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../db');

const OUT_DIR = path.join(__dirname, '..', 'uploads', 'files');
const BASE_URL = process.env.LOCAL_SERVER_API || `http://localhost:${process.env.PORT || 5000}`;
const PAGES_PER_MODULE = 10;

const escapePdfText = (text) =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const contentStreamForPage = (page) => {
  const lines = [page.title, '', ...page.lines];
  const cmds = [];
  cmds.push('BT');
  cmds.push('/F1 17 Tf');
  cmds.push('56 790 Td');
  cmds.push('20 TL');
  cmds.push(`(${escapePdfText(lines[0])}) Tj`);
  cmds.push('/F1 11 Tf');
  for (let i = 1; i < lines.length; i += 1) {
    cmds.push('T*');
    cmds.push(`(${escapePdfText(lines[i])}) Tj`);
  }
  cmds.push('ET');
  return cmds.join('\n');
};

const buildPdf = (pages) => {
  const objects = [];
  const addObj = (body) => {
    objects.push(body);
    return objects.length;
  };

  const fontObj = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageObjectIds = [];

  for (const page of pages) {
    const stream = contentStreamForPage(page);
    const contentObj = addObj(
      `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`
    );
    const pageObj = addObj(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObj} 0 R >>`
    );
    pageObjectIds.push(pageObj);
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

const normalizeSlug = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const topicTracks = {
  'ui-ux-design-masterclass': [
    'Design Foundations',
    'Problem Framing',
    'User Research',
    'Personas and Journey Mapping',
    'Information Architecture',
    'Wireframing Methods',
    'Visual Interface Systems',
    'Interaction Prototyping',
    'Usability Testing',
    'Iteration and Presentation',
  ],
  'frontend-web-development-bootcamp': [
    'Web Fundamentals',
    'Semantic HTML Structure',
    'Responsive CSS Systems',
    'JavaScript Core Concepts',
    'DOM and Event Architecture',
    'React Component Patterns',
    'Data Fetching and State',
    'Performance Optimization',
    'Testing and QA',
    'Deployment Workflow',
  ],
  'ecommerce-website-building': [
    'Commerce Strategy',
    'Store Architecture',
    'Catalog and Product Structure',
    'Checkout Flow Design',
    'Payment and Order Validation',
    'Trust and Conversion Signals',
    'Content and Merchandising',
    'Analytics and KPI Tracking',
    'Launch Readiness',
    'Post-Launch Optimization',
  ],
  'freelancing-and-client-acquisition': [
    'Positioning and Niche',
    'Offer Packaging',
    'Lead Generation Channels',
    'Outreach and Messaging',
    'Discovery Calls',
    'Proposal and Pricing',
    'Closing and Onboarding',
    'Delivery Excellence',
    'Retention and Upsell',
    'Referral Growth',
  ],
};

const buildPagesForModule = (courseSlug, courseTitle, moduleTitle) => {
  const track = topicTracks[courseSlug] || [
    'Introduction',
    'Core Concepts',
    'Practical Workflow',
    'Tools and Methods',
    'Common Pitfalls',
    'Quality Checklist',
    'Execution Steps',
    'Review and Iteration',
    'Case Study Notes',
    'Key Takeaways',
  ];

  return Array.from({ length: PAGES_PER_MODULE }).map((_, index) => {
    const pageNo = index + 1;
    const focus = track[index] || `Topic ${pageNo}`;
    return {
      title: `${moduleTitle} - Slide ${pageNo}`,
      lines: [
        `Course: ${courseTitle}`,
        `Module: ${moduleTitle}`,
        `Topic Focus: ${focus}`,
        '',
        'Learning Outcomes:',
        `- Understand ${focus.toLowerCase()} in practical context.`,
        '- Apply the concept to real project scenarios.',
        '- Identify mistakes and apply quality checks.',
        '- Use reference resources for deeper learning.',
        '',
        'Practical Exercise:',
        `Create a short implementation note for "${focus}" and map it to your project workflow.`,
      ],
    };
  });
};

const run = async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const [rows] = await db.query(
    `SELECT m.id, m.title AS module_title, m.module_order, c.slug AS course_slug, c.title AS course_title
     FROM lms_modules m
     INNER JOIN lms_courses c ON c.id = m.course_id
     ORDER BY c.id ASC, m.module_order ASC, m.id ASC`
  );

  for (const row of rows) {
    const safeSlug = normalizeSlug(`${row.course_slug}-${row.module_order}-${row.module_title}`);
    const fileName = `${safeSlug}-slides-${PAGES_PER_MODULE}pages.pdf`;
    const filePath = path.join(OUT_DIR, fileName);
    const pages = buildPagesForModule(row.course_slug, row.course_title, row.module_title);
    const pdfBuffer = buildPdf(pages);
    fs.writeFileSync(filePath, pdfBuffer);

    const publicUrl = `${BASE_URL}/uploads/files/${fileName}`;
    await db.query('UPDATE lms_modules SET slide_url = ? WHERE id = ?', [publicUrl, row.id]);
    console.log(`Updated module ${row.id}: ${fileName}`);
  }

  console.log(`Done. Generated ${rows.length} slide PDFs (${PAGES_PER_MODULE} pages each).`);
  process.exit(0);
};

run().catch((error) => {
  console.error('Slide generation failed:', error.message);
  process.exit(1);
});
