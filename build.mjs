/* Builds a single self-contained HTML file (fonts, styles, scripts and images
   inlined) for previewing the demo where multi-file hosting is not available. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const b64 = (p) => readFileSync(join(root, p)).toString('base64');

const CSS = ['fonts.css', 'tokens.css', 'app.css', 'screens.css', 'client.css'];
const JS = ['core.js', 'data.js', 'store.js', 'admin.js', 'client.js', 'app.js'];

/* fonts.css points at ../fonts/*.woff2 — swap each for a data: URI */
let css = CSS.map((f) => {
  let text = read(`assets/css/${f}`);
  if (f === 'fonts.css') {
    text = text.replace(/url\(\.\.\/fonts\/([^)]+)\)/g, (_, file) =>
      `url(data:font/woff2;base64,${b64(`assets/fonts/${file}`)})`);
  }
  return `/* ===== ${f} ===== */\n${text}`;
}).join('\n\n');

const js = JS.map((f) => `/* ===== ${f} ===== */\n${read(`assets/js/${f}`)}`).join('\n\n');

/* both .webp and .png references resolve to the (smaller) webp payload */
const IMAGES = ['logo-1080', 'logo-540', 'logo-280'];
const dataUri = {};
for (const name of IMAGES) {
  const uri = `data:image/webp;base64,${b64(`assets/img/${name}.webp`)}`;
  dataUri[`assets/img/${name}.webp`] = uri;
  dataUri[`assets/img/${name}.png`] = uri;
}
dataUri['assets/img/favicon.svg'] = `data:image/svg+xml;base64,${b64('assets/img/favicon.svg')}`;

let html = read('index.html');

/* replace the external <link>/<script> tags with inline blocks */
html = html
  .replace(/\s*<link rel="preload"[^>]*>/g, '')
  .replace(/\s*<link rel="stylesheet"[^>]*>/g, '')
  .replace('</head>', `  <style>\n${css}\n  </style>\n</head>`)
  .replace(/\s*<script src="assets\/js\/[^"]+"><\/script>/g, '')
  .replace('</body>', `  <script>\n${js}\n  </script>\n</body>`);

for (const [path, uri] of Object.entries(dataUri)) {
  html = html.split(path).join(uri);
}

mkdirSync(join(root, 'dist'), { recursive: true });
const out = join(root, 'dist', 'bellinaya-tek-fayl.html');
writeFileSync(out, html, 'utf8');
console.log(`dist/bellinaya-tek-fayl.html  ${(Buffer.byteLength(html, 'utf8') / 1024 / 1024).toFixed(2)} MB`);
