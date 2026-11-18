import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\COMP\\.gemini\\antigravity\\brain\\635250e4-0548-4dc1-8bde-2759fc1c2648\\screenshots';
const chromeExe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const custEmail = `customer.vikram.${Date.now()}@techcorp.in`;
  const custPass = 'CustomerPass2026!';

  // 1. Sign up customer
  const regRes = await fetch('http://localhost:8080/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:8080' },
    body: JSON.stringify({
      name: 'Vikram Malhotra',
      email: custEmail,
      password: custPass,
    })
  });
  const regData = await regRes.json();
  const userId = regData?.user?.id;

  // 2. Create an order for this customer
  await fetch('http://localhost:8080/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': regRes.headers.get('set-cookie') || '',
    },
    body: JSON.stringify({
      customerName: 'Vikram Malhotra',
      customerEmail: custEmail,
      customerPhone: '+91 98765 43210',
      customerBusinessName: 'TechCorp India',
      projectDescription: 'Full custom design with WhatsApp commerce integration.',
      deliveryTimeline: 'Standard Timeline',
      items: [
        {
          serviceSlug: 'website-development',
          serviceName: 'Website Development',
          packageName: 'Professional',
          packagePrice: 24999,
          addOns: [{ id: 'cms-setup', name: 'Custom CMS Integration', price: 6999 }],
          notes: 'Corporate portal kickoff'
        }
      ]
    })
  });

  // Extract session token
  const rawCookie = regRes.headers.get('set-cookie') || '';
  const match = rawCookie.match(/better-auth\.session_token=([^;]+)/);
  const token = match ? match[1] : null;

  const chromeProc = spawn(chromeExe, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9227',
    '--window-size=1280,1050',
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9227/json/list');
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

    console.log('Navigating to /account with authenticated customer session...');
    await send('Page.navigate', { url: 'http://localhost:8080/account' });

    // Wait until customer dashboard renders and orders finish loading
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      const check = await send('Runtime.evaluate', {
        expression: `Boolean(document.body.textContent.includes('Vikram Malhotra') && !document.body.textContent.includes('Loading your orders'))`
      });
      if (check.result && check.result.value) {
        console.log('Customer account rendered and orders loaded!');
        break;
      }
    }

    await sleep(2500);

    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const dest = path.join(outDir, 'account-authenticated.png');
    fs.writeFileSync(dest, buffer);
    console.log(`[✓] Captured account-authenticated.png (${Math.round(buffer.length / 1024)} KB)`);

  } finally {
    ws.close();
    chromeProc.kill();
    process.exit(0);
  }
}

run();
