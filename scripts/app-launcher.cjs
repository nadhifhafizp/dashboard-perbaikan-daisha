const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const PROJECT_ROOT = path.resolve(__dirname, '..');

const net = require('net');

// Helper untuk mengecek apakah server di port 3000 sudah berjalan (TCP check)
function checkServerReady() {
  return new Promise((resolve) => {
    const client = net.createConnection({ port: PORT, host: '127.0.0.1' }, () => {
      client.end();
      resolve(true);
    });
    client.on('error', () => {
      resolve(false);
    });
    client.setTimeout(2000, () => {
      client.destroy();
      resolve(false);
    });
  });
}

// Menyiapkan Prisma / SQLite jika belum ada
function prepareDatabase() {
  const dbPath = path.join(PROJECT_ROOT, 'prisma', 'dev.db');
  const prismaBin = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'prisma.cmd');
  const prismaCmd = fs.existsSync(prismaBin) ? `"${prismaBin}"` : 'npx prisma';

  try {
    if (!fs.existsSync(dbPath)) {
      console.log('[DAISHA] Menyiapkan database SQLite pertama kali...');
      execSync(`${prismaCmd} db push --skip-generate`, { cwd: PROJECT_ROOT, stdio: 'ignore' });
    }
    console.log('[DAISHA] Menyiapkan Prisma Client...');
    execSync(`${prismaCmd} generate`, { cwd: PROJECT_ROOT, stdio: 'ignore' });
  } catch (err) {
    console.error('[DAISHA] Warning saat inisialisasi database:', err.message);
  }
}

// Mencari executable Edge / Chrome di Windows
function getAppBrowserPath() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe')
  ];

  for (const p of paths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

async function main() {
  console.log('[DAISHA] Memeriksa status server...');

  let isReady = await checkServerReady();

  if (!isReady) {
    console.log('[DAISHA] Menyiapkan database...');
    prepareDatabase();

    console.log('[DAISHA] Menjalankan server Next.js di background...');
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    
    const out = fs.openSync(path.join(PROJECT_ROOT, '.next-server.log'), 'a');
    const err = fs.openSync(path.join(PROJECT_ROOT, '.next-server.err'), 'a');

    const serverProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: PROJECT_ROOT,
      detached: true,
      stdio: ['ignore', out, err],
      windowsHide: true,
      shell: process.platform === 'win32'
    });
    serverProcess.unref();

    // Tunggu hingga server siap (maksimal 60 detik)
    const startTime = Date.now();
    while (!isReady && (Date.now() - startTime < 60000)) {
      await new Promise(r => setTimeout(r, 1000));
      isReady = await checkServerReady();
    }
  }

  if (isReady) {
    console.log('[DAISHA] Server siap. Membuka aplikasi desktop...');
    const browserPath = getAppBrowserPath();

    if (browserPath) {
      // Buka dalam App Mode (Tanpa address bar / tab, otomatis layar penuh)
      const appProc = spawn(browserPath, [`--app=${URL}`, '--start-maximized', '--user-data-dir=' + path.join(PROJECT_ROOT, '.daisha-profile')], {
        detached: true,
        stdio: 'ignore'
      });
      appProc.unref();
    } else {
      // Fallback ke browser bawaan sistem
      const startCmd = process.platform === 'win32' ? 'start' : 'open';
      spawn(startCmd, [URL], { shell: true, detached: true, stdio: 'ignore' }).unref();
    }
  } else {
    console.error('[DAISHA] Server gagal siap dalam batas waktu 30 detik.');
  }
}

main();
