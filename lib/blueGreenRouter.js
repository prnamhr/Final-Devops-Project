
const http = require('http');
const fs = require('fs');

const args = process.argv.slice(2);
const cfgIdx = args.indexOf('--config');
if (cfgIdx === -1 || !args[cfgIdx + 1]) {
  console.error('Usage: node blueGreenRouter.js --config <path>');
  process.exit(2);
}
const cfg = JSON.parse(fs.readFileSync(args[cfgIdx + 1], 'utf8'));
const LISTEN = Number(cfg.listen);
const BLUE   = Number(cfg.bluePort);
const GREEN  = Number(cfg.greenPort);
const HC     = String(cfg.healthcheck || '/');

let active = null; // 'green' | 'blue' | null
let lastHealthy = { blue: false, green: false };

function check(port, path) {
  return new Promise(resolve => {
    const req = http.get({ host: '127.0.0.1', port, path, timeout: 1500 }, res => {
      resolve(res.statusCode < 500);
    });
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.on('error', () => resolve(false));
  });
}

async function healthLoop() {
  const [g, b] = await Promise.all([check(GREEN, HC), check(BLUE, HC)]);
  lastHealthy = { blue: b, green: g };
  if (g) active = 'green';
  else if (b) active = 'blue';
  else active = null;
}
setInterval(healthLoop, 2000);
healthLoop();

function proxy(req, res, port) {
  const opts = {
    host: '127.0.0.1',
    port,
    method: req.method,
    path: req.url,
    headers: req.headers
  };
  const p = http.request(opts, pres => {
    res.writeHead(pres.statusCode || 502, pres.headers);
    pres.pipe(res);
  });
  p.on('error', () => {
    res.statusCode = 502;
    res.end('Upstream error');
  });
  req.pipe(p);
}

const server = http.createServer((req, res) => {
  if (req.url === '/_status') {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ active, healthy: lastHealthy, ports: { blue: BLUE, green: GREEN } }));
    return;
  }
  if (active === 'green') return proxy(req, res, GREEN);
  if (active === 'blue') return proxy(req, res, BLUE);
  res.statusCode = 503;
  res.end('No healthy backend');
});

server.listen(LISTEN, '0.0.0.0', () => {
  console.log(`blue-green router listening on :${LISTEN} (green=${GREEN}, blue=${BLUE}, hc="${HC}")`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
