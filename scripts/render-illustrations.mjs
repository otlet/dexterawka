// Renders the HTML illustration sources to PNG with headless Edge or Chrome.
// Usage: node scripts/render-illustrations.mjs [source-dir] [output-dir]
// Each source page declares its canvas with <meta name="render-size" content="WxH">.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.resolve(root, process.argv[2] ?? 'scripts/illustrations/umowy');
const outputDir = path.resolve(root, process.argv[3] ?? 'assets/images/umowy');
const scale = 2;

const browser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(candidate => fs.existsSync(candidate));
if (!browser) throw new Error('Nie znaleziono Edge ani Chrome.');

fs.mkdirSync(outputDir, { recursive: true });
// A separate profile keeps the call blocking even when the browser is already open.
const profile = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP ?? root), 'kp-render-'));
const pages = fs.readdirSync(sourceDir).filter(name => name.endsWith('.html'));
for (const name of pages) {
  const file = path.join(sourceDir, name);
  const size = fs.readFileSync(file, 'utf8').match(/name="render-size" content="(\d+)x(\d+)"/);
  if (!size) throw new Error(`${name}: brak <meta name="render-size">`);
  const output = path.join(outputDir, name.replace(/\.html$/, '.png'));
  fs.rmSync(output, { force: true });
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    `--user-data-dir=${profile}`,
    `--force-device-scale-factor=${scale}`,
    `--window-size=${size[1]},${size[2]}`,
    `--screenshot=${output}`,
    pathToFileURL(file).href,
  ], { stdio: 'ignore' });
  // The browser can return before its child process has flushed the screenshot.
  const deadline = Date.now() + 15000;
  while (!fs.existsSync(output) && Date.now() < deadline) await new Promise(done => setTimeout(done, 200));
  if (!fs.existsSync(output)) throw new Error(`${name}: nie powstał zrzut ekranu`);
  console.log(`${name} -> ${path.relative(root, output)}`);
}
// Background browser processes may still hold the profile for a moment.
try {
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
} catch {
  console.warn(`Nie udało się usunąć profilu tymczasowego: ${profile}`);
}
