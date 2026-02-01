
const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec: localExec } = require('./exec');

const PID_DIR = path.join(process.cwd(), '.bg');
const PID_FILE = path.join(PID_DIR, 'router.pid');
const CFG_FILE = path.join(PID_DIR, 'router.config.json');

async function runShell(cmd, cwd = process.cwd()) {
  if (process.platform === 'win32') {
    const shell = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
    await localExec(shell, ['/d', '/s', '/c', cmd], { cwd });
  } else {
    await localExec('/bin/bash', ['-lc', cmd], { cwd });
  }
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function isProcessAlive(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function stopExistingRouter() {
  try {
    if (!fs.existsSync(PID_FILE)) return;
    const pid = Number(fs.readFileSync(PID_FILE, 'utf8'));
    if (pid && isProcessAlive(pid)) {
      process.kill(pid, 'SIGTERM');
      const start = Date.now();
      while (Date.now() - start < 1500 && isProcessAlive(pid)) {}
      if (isProcessAlive(pid)) process.kill(pid, 'SIGKILL');
    }
    fs.rmSync(PID_FILE, { force: true });
  } catch (e) {
  }
}

async function waitForPort(port, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ok = await new Promise(res => {
      const req = http.get({ host: '127.0.0.1', port, path: '/_status', timeout: 800 }, r => {
        res(r.statusCode >= 200 && r.statusCode < 500);
      });
      req.on('timeout', () => { req.destroy(); res(false); });
      req.on('error', () => res(false));
    });
    if (ok) return true;
    await new Promise(r => setTimeout(r, 200));
  }
  return false;
}

async function startRouter({ listen, bluePort, greenPort, healthcheck }) {
  ensureDir(PID_DIR);
  stopExistingRouter();
  const routerPath = path.join(__dirname, 'blueGreenRouter.js');
  const config = { listen, bluePort, greenPort, healthcheck };
  fs.writeFileSync(CFG_FILE, JSON.stringify(config, null, 2));
  const { spawn } = require('child_process');
  const child = spawn(process.execPath, [routerPath, '--config', CFG_FILE], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
  fs.writeFileSync(PID_FILE, String(child.pid));
  const ok = await waitForPort(listen, 8000);
  if (!ok) throw new Error(`blue-green router failed to start on :${listen}`);
}

class BlueGreenDeployer {
  /**
   * spec = { runs: [blueCmd, greenCmd], ports: [bluePort, greenPort], healthcheck: '/path', listen?: number }
   */
  static async run({ spec, cwd = process.cwd() }) {
    if (!spec || !Array.isArray(spec.runs) || spec.runs.length !== 2) {
      throw new Error('blue-green.runs must be a list of exactly 2 commands: [blueCmd, greenCmd]');
    }
    if (!Array.isArray(spec.ports) || spec.ports.length !== 2) {
      throw new Error('blue-green.ports must be a list of exactly 2 ports: [bluePort, greenPort]');
    }
    if (!spec.healthcheck || typeof spec.healthcheck !== 'string') {
      throw new Error('blue-green.healthcheck must be a string route like "/" or "/health"');
    }

    const [blueCmd, greenCmd] = spec.runs;
    const [bluePort, greenPort] = spec.ports.map(Number);
    const listen = spec.listen ? Number(spec.listen) : 8080;
    const healthcheck = spec.healthcheck;

    console.log(`→ Starting BLUE with: ${blueCmd}`);
    await runShell(blueCmd, cwd);

    console.log(`→ Starting GREEN with: ${greenCmd}`);
    await runShell(greenCmd, cwd);

    console.log(`→ (Re)starting blue-green router on :${listen} (prefers GREEN, HC=${healthcheck})`);
    await startRouter({ listen, bluePort, greenPort, healthcheck });

    console.log(`✅ Router listening on http://localhost:${listen}  (routes to GREEN when healthy, else BLUE)`);
    console.log(`   Status: http://localhost:${listen}/_status`);
  }
}

module.exports = { BlueGreenDeployer };
