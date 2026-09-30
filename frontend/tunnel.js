const localtunnel = require('./node_modules/localtunnel');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function getPublicIP() {
  return new Promise((resolve) => {
    https.get('https://ipv4.icanhazip.com', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data.trim()));
    }).on('error', () => resolve('Not available'));
  });
}

(async () => {
  try {
    console.log('Fetching tunnel IP...');
    const ip = await getPublicIP();
    console.log('Connecting to localtunnel on port 3000...');
    const tunnel = await localtunnel({ port: 3000 });

    const info = `
=========================================
🚀 LIVE PUBLIC PREVIEW LINK FOR TEAMMATES:
${tunnel.url}

Endpoint: ${tunnel.url}
Password (if prompted by loca.lt): ${ip}
=========================================
`;
    console.log(info);

    const logPath = path.join(__dirname, 'tunnel-url.txt');
    fs.writeFileSync(logPath, info);

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err);
  }
})();
