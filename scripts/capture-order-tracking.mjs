import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\COMP\\.gemini\\antigravity\\brain\\635250e4-0548-4dc1-8bde-2759fc1c2648\\screenshots';
const chromeExe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching Chrome to test Order Tracking UI...');
  const chromeProc = spawn(chromeExe, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    '--window-size=1280,1100',
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9223/json/list');
      const targets = await res.json();
      if (targets && targets.length > 0 && targets[0].webSocketDebuggerUrl) {
        wsUrl = targets[0].webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('Failed to get CDP WebSocket URL');
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

  async function capture(fileName) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const dest = path.join(outDir, fileName);
    fs.writeFileSync(dest, buffer);
    console.log(`[✓] Captured ${fileName} (${Math.round(buffer.length / 1024)} KB)`);
  }

  try {
    // 1. Navigate to /orders
    console.log('Navigating to /orders...');
    await send('Page.navigate', { url: 'http://localhost:8080/orders' });
    await sleep(2000);

    // 2. Focus input and type order ID WC-2026-89060 using CDP Input.insertText
    console.log('Focusing input and typing WC-2026-89060...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const inp = document.querySelector('input');
          if (inp) inp.focus();
        })();
      `
    });

    await sleep(200);
    await send('Input.insertText', { text: 'WC-2026-89060' });
    await sleep(400);

    // Click submit button
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[type="submit"]');
          if (btn) btn.click();
        })();
      `
    });

    console.log('Submitted search query. Waiting for Neon DB response...');
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const check = await send('Runtime.evaluate', {
        expression: `Boolean(document.querySelector('button[type="submit"]') && document.querySelector('button[type="submit"]').textContent.includes('Track'))`
      });
      if (check.result && check.result.value) {
        console.log('Search completed!');
        break;
      }
    }
    await sleep(500);

    await capture('order-tracking-live.png');

  } catch (err) {
    console.error('Error during CDP tracking test:', err);
  } finally {
    ws.close();
    chromeProc.kill();
    console.log('Done.');
  }
}

run();
