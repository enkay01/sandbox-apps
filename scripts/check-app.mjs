import { readFileSync } from 'node:fs';
for (const file of ['index.html', 'src/main.js', 'src/styles.css']) readFileSync(file, 'utf8');
console.log('Static app files are present and readable.');
