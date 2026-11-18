import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\COMP\\.gemini\\antigravity\\brain\\635250e4-0548-4dc1-8bde-2759fc1c2648\\screenshots';
const chromeExe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Launching Chrome with CDP on port 9222...');
  const chromeProc = spawn(chromeExe, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1280,1050',
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
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

  console.log('Connected to CDP at:', wsUrl);

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
    // 1. First navigate to domain to set localStorage
    await send('Page.navigate', { url: 'http://localhost:8080/' });
    await sleep(1500);

    // Set cart in localStorage
    const sampleCart = [
      {
        id: 'cart_' + Date.now(),
        serviceSlug: 'website-development',
        serviceName: 'Website Development',
        packageName: 'Professional',
        packagePrice: 24999,
        addOns: [
          { id: 'cms-setup', name: 'Custom CMS Integration', price: 6999 },
          { id: 'seo-boost', name: 'Advanced Technical SEO', price: 4999 }
        ],
        notes: 'Priority launch needed for Q3 corporate redesign',
        totalPrice: 36997
      }
    ];

    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('webcraftly_cart_store_v2', JSON.stringify(${JSON.stringify(sampleCart)}));
      `
    });

    console.log('Injected active cart into localStorage.');

    // 2. Navigate to /checkout with items in cart
    console.log('Navigating to checkout with populated cart...');
    await send('Page.navigate', { url: 'http://localhost:8080/checkout' });
    await sleep(2500);

    await capture('checkout-with-cart.png');

    // 3. Fill in contact info and submit Step 1 form
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          function setInput(el, val) {
            const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
            const set = Object.getOwnPropertyDescriptor(proto, 'value').set;
            set.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }

          const inputs = document.querySelectorAll('input');
          for (const inp of inputs) {
            if (inp.placeholder && inp.placeholder.includes('Rahul Sharma')) {
              setInput(inp, 'Vikram Malhotra');
            } else if (inp.type === 'email' || (inp.placeholder && inp.placeholder.includes('rahul@company.com'))) {
              setInput(inp, 'vikram.malhotra@techcorp.in');
            } else if (inp.type === 'tel' || (inp.placeholder && inp.placeholder.includes('98765'))) {
              setInput(inp, '+91 98765 43210');
            } else if (inp.placeholder && inp.placeholder.includes('Sharma Enterprises')) {
              setInput(inp, 'TechCorp Innovations India');
            }
          }
        })();
      `
    });

    await sleep(500);
    await capture('checkout-step1-filled.png');

    // Submit Step 1 form
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[type=\"submit\"]');
          if (btn) btn.click();
        })();
      `
    });

    await sleep(1500);

    // Step 2: Fill project requirements
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          function setInput(el, val) {
            const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
            const set = Object.getOwnPropertyDescriptor(proto, 'value').set;
            set.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }

          const textareas = document.querySelectorAll('textarea');
          if (textareas.length > 0) {
            setInput(textareas[0], 'Complete corporate platform overhaul with CMS, client portal, and multi-currency billing.');
          }
          const inputs = document.querySelectorAll('input');
          for (const inp of inputs) {
            if (inp.placeholder && inp.placeholder.includes('https://')) {
              setInput(inp, 'https://techcorp.in');
            }
          }
        })();
      `
    });

    await sleep(500);

    // Submit Step 2 form
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[type=\"submit\"]');
          if (btn) btn.click();
        })();
      `
    });

    await sleep(1500);

    // Step 3: Review summary -> Click "Select Payment Method →"
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Select Payment Method'));
          if (nextBtn) nextBtn.click();
        })();
      `
    });

    await sleep(1000);
    await capture('checkout-step4-whatsapp.png');

    // Click "Order via WhatsApp"
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const submitBtn = btns.find(b => b.textContent && b.textContent.includes('Order via WhatsApp'));
          if (submitBtn) submitBtn.click();
        })();
      `
    });

    console.log('Submitting order via WhatsApp...');
    
    // Wait until step 5 confirmation card is visible
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const check = await send('Runtime.evaluate', {
        expression: `Boolean(document.querySelector('h2') && document.querySelector('h2').textContent.includes('Order Successfully Placed'))`
      });
      if (check.result && check.result.value) {
        console.log('Order confirmation screen reached!');
        break;
      }
    }

    await sleep(500);

    // Capture Step 5: Confirmation screen with Order ID & WhatsApp button
    await capture('checkout-order-confirmed.png');

  } catch (err) {
    console.error('Error during CDP automation:', err);
  } finally {
    ws.close();
    chromeProc.kill();
    console.log('Automation complete.');
  }
}

run();
