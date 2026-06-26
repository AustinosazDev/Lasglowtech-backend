/**
 * Copy portfolio images from src/assets/images into public/projects for seed URLs.
 * Run from repo root: node server/scripts/sync-project-seed-images.js
 */
const fs = require('fs');
const path = require('path');
const { gridProjects, caseStudies } = require('../data/projectSeed');

const repoRoot = path.join(__dirname, '..', '..');
const sourceDir = path.join(repoRoot, 'lasglowtechweb', 'src', 'assets', 'images');
const targetDir = path.join(repoRoot, 'lasglowtechweb', 'public', 'projects');

const files = new Set();
[...gridProjects, ...caseStudies].forEach((item) => {
  if (item.imageFile) files.add(item.imageFile);
});

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let copied = 0;
let missing = 0;

for (const file of files) {
  const src = path.join(sourceDir, file);
  const dest = path.join(targetDir, file);
  if (!fs.existsSync(src)) {
    console.warn(`Missing source image: ${file}`);
    missing += 1;
    continue;
  }
  fs.copyFileSync(src, dest);
  copied += 1;
}

console.log(`Project seed images: ${copied} copied, ${missing} missing.`);
console.log(`Target folder: ${targetDir}`);
