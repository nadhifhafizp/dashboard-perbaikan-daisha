const os = require('os');

const IS_DEBUG = process.argv.includes('--debug') || Boolean(process.env.DEBUG);
const VIRTUAL_REGEX = /virtual|vethernet|wsl|vmware|docker|loopback/i;
const PREFERRED_REGEX = /wi-?fi|ethernet|lan|wlan|local/i;

function getLocalIp() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const [name, list] of Object.entries(nets)) {
    for (const net of list || []) {
      const isIpv4 = net.family === 'IPv4' || net.family === 4;
      if (!isIpv4 || net.internal) continue;

      const isVirtual = VIRTUAL_REGEX.test(name);
      const isPreferred = !isVirtual && PREFERRED_REGEX.test(name);

      candidates.push({ name, ip: net.address, isPreferred, isVirtual });
    }
  }

  if (IS_DEBUG) {
    console.error('[DEBUG] Network candidates:', candidates);
  }

  const best = candidates.find((c) => c.isPreferred) || candidates[0];
  return best ? best.ip : 'localhost';
}

console.log(getLocalIp());

