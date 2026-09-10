import os from 'os';

export interface ServerInfo {
  ip: string;
  port: number;
  url: string;
  formattedTitle: string;
}

/**
 * Mendeteksi IP Address lokal (IPv4) yang aktif.
 * Memprioritaskan adapter fisik (Wi-Fi, Ethernet, LAN) dan menyaring adapter virtual (WSL, VM, Docker, vEthernet).
 */
const VIRTUAL_REGEX = /virtual|vethernet|wsl|vmware|docker|loopback/i;
const PREFERRED_REGEX = /wi-?fi|ethernet|lan|wlan|local/i;

export function getLocalIp(): string {
  const nets = os.networkInterfaces();
  const candidates: { name: string; ip: string; isPreferred: boolean }[] = [];

  for (const [name, list] of Object.entries(nets)) {
    for (const net of list || []) {
      const isIpv4 = net.family === 'IPv4' || (net.family as unknown) === 4;
      if (!isIpv4 || net.internal) continue;

      const isVirtual = VIRTUAL_REGEX.test(name);
      const isPreferred = !isVirtual && PREFERRED_REGEX.test(name);

      candidates.push({ name, ip: net.address, isPreferred });
    }
  }

  const best = candidates.find((c) => c.isPreferred) || candidates[0];
  return best ? best.ip : 'localhost';
}

export function getServerPort(): number {
  return Number(process.env.PORT) || 3000;
}

export function getServerInfo(): ServerInfo {
  const ip = getLocalIp();
  const port = getServerPort();
  const isLocal = ip === 'localhost' || ip === '127.0.0.1';
  const url = `http://${isLocal ? 'localhost' : ip}:${port}`;
  const ipDisplay = !isLocal ? ` [IP: ${ip}:${port}]` : ` [Port: ${port}]`;

  return {
    ip,
    port,
    url,
    formattedTitle: `Daisha Maintenance | PT Bridgestone Tire Indonesia${ipDisplay}`,
  };
}
