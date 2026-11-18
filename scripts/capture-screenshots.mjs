import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\COMP\\.gemini\\antigravity\\brain\\635250e4-0548-4dc1-8bde-2759fc1c2648\\screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const chromeExe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const pages = [
  { name: 'home', url: 'http://localhost:8080/' },
  { name: 'services', url: 'http://localhost:8080/services' },
  { name: 'service-detail', url: 'http://localhost:8080/services/website-development' },
  { name: 'pricing', url: 'http://localhost:8080/pricing' },
  { name: 'checkout', url: 'http://localhost:8080/checkout' },
  { name: 'orders', url: 'http://localhost:8080/orders' },
  { name: 'account', url: 'http://localhost:8080/account' },
  { name: 'admin', url: 'http://localhost:8080/admin' },
];

console.log('Capturing screenshots with Google Chrome headless...');

for (const p of pages) {
  const filePath = path.join(outDir, `${p.name}.png`);
  console.log(`Capturing ${p.name} from ${p.url}...`);
  try {
    const cmd = `"${chromeExe}" --headless --disable-gpu --virtual-time-budget=3000 --window-size=1280,900 --screenshot="${filePath}" "${p.url}"`;
    execSync(cmd, { stdio: 'ignore', timeout: 20000 });
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`[✓] Captured ${p.name}.png (${Math.round(stats.size / 1024)} KB)`);
    } else {
      console.log(`[✗] Failed to capture ${p.name}.png`);
    }
  } catch (err) {
    console.log(`[!] Error capturing ${p.name}: ${err.message}`);
  }
}

console.log('\nScreenshot capture complete!');
