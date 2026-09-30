const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  const tunnel = await localtunnel({ port: 3000 });
  const url = tunnel.url;
  console.log('TUNNEL_URL=' + url);
  fs.writeFileSync('tunnel-url.txt', url + '\n');
  console.log('Tunnel is live at: ' + url);
  tunnel.on('close', () => console.log('Tunnel closed'));
  tunnel.on('error', (err) => console.error('Tunnel error:', err));
})();
