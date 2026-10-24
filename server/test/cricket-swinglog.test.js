// Cricket training log endpoint (dev server only).
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('POST /api/swings appends JSONL when enabled, 404 when off', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { startServer } = await import('../index.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exemoo-swings-'));
  const opts = { port: 0, host: '127.0.0.1', quiet: true, publicDir: dir, gamesDir: dir, swingLogDir: path.join(dir, 'logs') };
  const on = await startServer({ ...opts, swingLog: true });
  const off = await startServer({ ...opts, swingLog: false });
  try {
    const post = (app, body) => fetch(`http://127.0.0.1:${app.port}/api/swings`, { method: 'POST', body });
    assert.equal((await post(off, '{"a":1}')).status, 404);
    assert.equal((await post(on, 'nope')).status, 400);
    assert.equal((await post(on, '[1]')).status, 400);
    assert.equal((await post(on, JSON.stringify({ label: { zone: 'cover' } }))).status, 204);
    const [file] = fs.readdirSync(path.join(dir, 'logs'));
    const line = JSON.parse(fs.readFileSync(path.join(dir, 'logs', file), 'utf8').trim());
    assert.equal(line.label.zone, 'cover');
    assert.equal((await (await fetch(`http://127.0.0.1:${on.port}/api/info`)).json()).swingLog, true);
  } finally {
    await on.close();
    await off.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
