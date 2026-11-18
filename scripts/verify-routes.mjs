const routes = [
  '/',
  '/services',
  '/services/website-development',
  '/pricing',
  '/checkout',
  '/orders',
  '/account',
  '/admin',
  '/contact',
  '/custom-quote',
  '/cart',
  '/portfolio',
  '/about',
  '/faq',
  '/privacy',
  '/terms'
];

async function checkRoutes() {
  console.log('Testing all 16 routes on http://localhost:8080...\n');
  let successCount = 0;
  for (const r of routes) {
    try {
      const res = await fetch('http://localhost:8080' + r);
      const text = await res.text();
      const isHtml = text.includes('<!DOCTYPE html>') || text.includes('<html');
      if (res.status === 200 && isHtml) {
        console.log(`[✓] ${r.padEnd(32)} HTTP ${res.status} OK (${text.length} bytes)`);
        successCount++;
      } else {
        console.log(`[✗] ${r.padEnd(32)} HTTP ${res.status} (Length: ${text.length})`);
      }
    } catch (err) {
      console.log(`[✗] ${r.padEnd(32)} ERROR: ${err.message}`);
    }
  }
  console.log(`\nResult: ${successCount} / ${routes.length} routes responded HTTP 200 OK!`);
  if (successCount === routes.length) {
    console.log('ALL 16 ROUTES PRESERVED AND OPERATIONAL!');
  } else {
    process.exit(1);
  }
}

checkRoutes();
