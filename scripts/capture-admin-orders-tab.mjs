import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\COMP\\.gemini\\antigravity\\brain\\635250e4-0548-4dc1-8bde-2759fc1c2648\\screenshots';
const chromeExe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const adminEmail = `admin.portal.orders.${Date.now()}@webcraftly.com`;
  const adminPass = 'WebCraftlyAdmin2026!';

  // Sign up and promote
  const regRes = await fetch('http://localhost:8080/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:8080' },
    body: JSON.stringify({ name: 'Operations Director', email: adminEmail, password: adminPass })
  });
  const regData = await regRes.json();
  const userId = regData?.user?.id;

  const { db, schema } = await import('../src/lib/db/index.ts');
  const { eq } = await import('drizzle-orm');
  await db.update(schema.user).set({ role: 'admin', updatedAt: new Date() }).where(eq(schema.user.id, userId));

  const loginRes = await fetch('http://localhost:8080/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:8080' },
    body: JSON.stringify({ email: adminEmail, password: adminPass })
  });
  const rawCookie = loginRes.headers.get('set-cookie') || '';
  const match = rawCookie.match(/better-auth\.session_token=([^;]+)/);
  const token = match ? match[1] : null;

  const chromeProc = spawn(chromeExe, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9226',
    '--window-size=1380,1100',
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9226/json/list');
      const targets = await res.json();
      if (targets && targets.length > 0 && targets[0].webSocketDebuggerUrl) {
        wsUrl = targets[0].webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  try {
    await send('Network.enable');
    await send('Network.setCookie', {
      name: 'better-auth.session_token',
      value: decodeURIComponent(token),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    });

    await send('Page.navigate', { url: 'http://localhost:8080/admin' });
    await sleep(3000);

    // Click "Orders Management" tab
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const tab = btns.find(b => b.textContent && b.textContent.includes('Orders Management'));
          if (tab) tab.click();
        })();
      `
    });

    await sleep(2000);

    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const dest = path.join(outDir, 'admin-orders-tab.png');
    fs.writeFileSync(dest, buffer);
    console.log(`[✓] Captured admin-orders-tab.png (${Math.round(buffer.length / 1024)} KB)`);

  } finally {
    ws.close();
    chromeProc.kill();
    process.exit(0);
  }
}

run();
