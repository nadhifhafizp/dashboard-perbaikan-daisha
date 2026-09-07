const os = require('os');
const nets = os.networkInterfaces();
let ip = 'localhost';

for (const n of Object.keys(nets)) {
  for (const net of nets[n]) {
    if (net.family === 'IPv4' && !net.internal) {
      ip = net.address;
      break;
    }
  }
  if (ip !== 'localhost') break;
}

console.log(ip);
