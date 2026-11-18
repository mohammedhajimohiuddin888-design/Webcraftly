import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { db, schema } from '../src/lib/db/index.ts';
import { eq } from 'drizzle-orm';

const outDir = 'C:\\Users\\COMP\\.gemini\\antigravity\\brain\\635250e4-0548-4dc1-8bde-2759fc1c2648\\screenshots';
const chromeExe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Preparing admin session for dashboard capture...');
  const adminEmail = `admin.portal.${Date.now()}@webcraftly.com`;
  const adminPass = 'WebCraftlyAdmin2026!';

  // 1. Sign up
  const regRes = await fetch('http://localhost:8080/api/auth/sign-up/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:8080',
    },
    body: JSON.stringify({
      name: 'Operations Director',
      email: adminEmail,
      password: adminPass,
    })
  });
  const regData = await regRes.json();
  const userId = regData?.user?.id;
  if (!userId) {
    console.error('Failed to create admin user:', regData);
    return;
  }

  // 2. Promote to admin in Neon
  await db
    .update(schema.user)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(eq(schema.user.id, userId));
  console.log(`Promoted user ${adminEmail} to admin.`);

  // 3. Login via API to extract session cookie
  const loginRes = await fetch('http://localhost:8080/api/auth/sign-in/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:8080',
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPass,
    })
  });

  const rawCookie = loginRes.headers.get('set-cookie') || '';
  console.log('Login set-cookie:', rawCookie);

  // Extract session token name and value
  const match = rawCookie.match(/better-auth\.session_token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    console.error('Could not extract session token from response');
    return;
  }

  // 4. Launch Chrome
  console.log('Launching Chrome to capture Admin Dashboard...');
  const chromeProc = spawn(chromeExe, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--window-size=1380,1100',
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9225/json/list');
      const targets = await res.json();
      if (targets && targets.length > 0 && targets[0].webSocketDebuggerUrl) {
        wsUrl = targets[0].webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    chromeProc.kill();
    return;
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
    // Set cookie in browser with decoded token
    await send('Network.enable');
    await send('Network.setCookie', {
      name: 'better-auth.session_token',
      value: decodeURIComponent(token),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    });
    console.log('Injected admin session cookie into browser.');

    // Navigate to /admin
    console.log('Navigating to /admin with authenticated session...');
    await send('Page.navigate', { url: 'http://localhost:8080/admin' });

    // Query inside browser context to see response
    const browserCheck = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          try {
            const r = await fetch('/api/admin/orders');
            const data = await r.json();
            return { status: r.status, data };
          } catch (e) {
            return { error: e.message };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('In-page fetch(/api/admin/orders) result:', JSON.stringify(browserCheck));

    // Wait until dashboard loads and orders table renders rows
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      const check = await send('Runtime.evaluate', {
        expression: `Boolean(document.querySelectorAll('tbody tr').length > 0 || (document.querySelector('h3') && document.querySelector('h3').textContent.includes('Recent Orders')))`
      });
      if (check.result && check.result.value) {
        console.log('Admin dashboard live view rendered!');
        break;
      }
    }

    // Additional settle time for metrics and order rows to render
    await sleep(4000);

    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const dest = path.join(outDir, 'admin-dashboard-live.png');
    fs.writeFileSync(dest, buffer);
    console.log(`[✓] Captured admin-dashboard-live.png (${Math.round(buffer.length / 1024)} KB)`);

  } catch (err) {
    console.error('Error during admin capture:', err);
  } finally {
    ws.close();
    chromeProc.kill();
    console.log('Done.');
    process.exit(0);
  }
}

run();
