import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\COMP\\.gemini\\antigravity\\brain\\635250e4-0548-4dc1-8bde-2759fc1c2648\\screenshots';
const chromeExe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const filePath = path.join(outDir, 'service-detail.png');

if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}

const cmd = `"${chromeExe}" --headless --disable-gpu --virtual-time-budget=4000 --window-size=1280,1100 --screenshot="${filePath}" "http://localhost:8080/services/website-development"`;
console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(filePath)) {
  const stats = fs.statSync(filePath);
  console.log(`[✓] Successfully captured service-detail.png (${Math.round(stats.size / 1024)} KB)`);
} else {
  console.log('[✗] Failed to capture service-detail.png');
}
