import { readFileSync } from 'node:fs';

const files = Object.fromEntries(
  ['index.html', 'src/main.js', 'src/styles.css'].map(file => [file, readFileSync(file, 'utf8')])
);

for (const [file, contents] of Object.entries(files)) {
  if (!contents.trim()) throw new Error(`${file} is empty.`);
}

const appSource = files['src/main.js'];
const styleSource = files['src/styles.css'];

for (const expected of [
  'Sandbox Home',
  'Job Search App',
  '#/job-search',
  'renderShell',
  'renderHome',
  'renderJobSearchApp',
  'Generate prompt',
  'Import results',
  'Copy results JSON',
  'copySourceUrl',
  'companyDetail',
  'details',
  'renderList'
]) {
  if (!appSource.includes(expected)) {
    throw new Error(`Missing sandbox behavior marker: ${expected}`);
  }
}

for (const expected of [
  'sandboxShell',
  'sidebar',
  'appPill',
  'resultsLayout',
  'companyList',
  'companyDetail',
  'sourceRow',
  'iconButton'
]) {
  if (!styleSource.includes(expected)) {
    throw new Error(`Missing sandbox layout style: ${expected}`);
  }
}

console.log('Static sandbox app files are present and readable.');
