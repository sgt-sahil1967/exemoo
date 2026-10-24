/**
 * LAN mode helpers: phones only expose motion sensors to secure pages, so for local play the
 * server also listens on HTTPS with a self-signed certificate covering this machine's LAN IPs.
 * Not used in production, where the host (Render, Fly...) terminates TLS.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function lanIps() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.internal || a.family !== 'IPv4' || a.address.startsWith('169.254.')) continue;
      out.push({ name, address: a.address });
    }
  }
  // Prefer typical home/office LAN ranges and physical interfaces over VPN/bridges.
  const score = ({ name, address }) =>
    (address.startsWith('192.168.') ? 0 : address.startsWith('10.') ? 1 : address.startsWith('172.') ? 2 : 3) * 10 +
    (/^(en|eth|wl|wlan|Wi-Fi|Ethernet)/i.test(name) ? 0 : 5);
  out.sort((a, b) => score(a) - score(b));
  return [...new Set(out.map((x) => x.address))];
}

/** Load (or generate and cache) a self-signed certificate for localhost + LAN IPs. */
export async function loadCert(certDir, log = () => {}) {
  const ips = lanIps();
  const hostname = os.hostname();
  const keyFile = path.join(certDir, 'key.pem');
  const certFile = path.join(certDir, 'cert.pem');
  const metaFile = path.join(certDir, 'meta.json');
  try {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    const fresh = new Date(meta.notAfter).getTime() - Date.now() > 30 * 86400_000;
    const covers = ips.every((ip) => meta.ips.includes(ip)) && meta.hostname === hostname;
    if (fresh && covers) return { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) };
  } catch {
    /* (re)generate */
  }
  const { generate } = await import('selfsigned');
  const notBeforeDate = new Date(Date.now() - 86400_000);
  const notAfterDate = new Date(Date.now() + 360 * 86400_000); // Apple: ≤ 398 days
  const dns = [...new Set(['localhost', hostname, `${hostname.replace(/\.local$/, '')}.local`])];
  const pems = await generate([{ name: 'commonName', value: 'EXEMOO local' }], {
    keySize: 2048,
    algorithm: 'sha256',
    notBeforeDate,
    notAfterDate,
    extensions: [
      { name: 'basicConstraints', cA: false },
      { name: 'keyUsage', digitalSignature: true, keyEncipherment: true, critical: true },
      { name: 'extKeyUsage', serverAuth: true },
      {
        name: 'subjectAltName',
        altNames: [
          ...dns.map((value) => ({ type: 2, value })),
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '::1' },
          ...ips.map((ip) => ({ type: 7, ip })),
        ],
      },
    ],
  });
  fs.mkdirSync(certDir, { recursive: true });
  fs.writeFileSync(keyFile, pems.private, { mode: 0o600 });
  fs.writeFileSync(certFile, pems.cert);
  fs.writeFileSync(metaFile, JSON.stringify({ ips, hostname, notAfter: notAfterDate.toISOString() }, null, 2));
  log(`  Generated self-signed certificate in ${certDir}`);
  return { key: pems.private, cert: pems.cert };
}
