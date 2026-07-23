const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const scriptTag = '  <script src="upload-data-runtime.js"></script>';

let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('upload-data-runtime.js')) {
  html = html.replace('  <script src="script.js"></script>', `  <script src="script.js"></script>\n${scriptTag}`);
  fs.writeFileSync(indexPath, html, 'utf8');
}
