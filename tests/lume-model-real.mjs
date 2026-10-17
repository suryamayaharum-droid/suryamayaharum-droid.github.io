// Real browser/ONNX inference. Requires downloaded pinned weights and runtime,
// not mocks. QA serves those same bytes locally to avoid downloading them twice.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MODEL } from '../assets/lume-model-config.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const runtime = process.env.TRANSFORMERS_DIST;
const cache = process.env.LUME_MODEL_CACHE;
assert.ok(runtime && cache, 'Set TRANSFORMERS_DIST and LUME_MODEL_CACHE to the installed runtime and downloaded pinned model');
let origin;
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, origin).pathname;
    let filename;
    if (pathname.startsWith('/runtime/')) filename = path.join(runtime, path.basename(pathname));
    else if (pathname.startsWith('/models/' + MODEL.id + '/')) filename = path.join(cache, MODEL.id, MODEL.revision, pathname.slice(('/models/' + MODEL.id + '/').length));
    else filename = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.xml': 'application/xml' };
    res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    if (pathname === '/assets/lume-model-config.mjs' || pathname === '/assets/lume-model.worker.mjs') {
      let data = await readFile(filename, 'utf8');
      if (pathname.endsWith('config.mjs')) data = data.replace(MODEL.runtime, origin + '/runtime/transformers.min.js');
      else data = data.replace('env.useBrowserCache = true;', "env.useBrowserCache = false; env.allowLocalModels = true; env.allowRemoteModels = false; env.localModelPath = '/models/'; env.backends.onnx.wasm.wasmPaths = '/runtime/';");
      res.end(data); return;
    }
    res.setHeader('Content-Length', (await stat(filename)).size);
    createReadStream(filename).pipe(res);
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--disable-gpu', '--no-zygote'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.text().startsWith('MODEL')) console.log(message.text()); });
  const progress = [];
  page.on('console', message => { if (message.text().startsWith('TOKEN ')) progress.push(message.text()); });
  const modelRequests = [];
  page.on('request', request => { if (/\.onnx|\.wasm|transformers\.min/.test(request.url())) modelRequests.push(request.url()); });
  await page.addInitScript(() => {
    const OriginalWorker = window.Worker;
    window.Worker = class extends OriginalWorker {
      constructor(...args) { super(...args); this.addEventListener('message', ({ data }) => { if (['backend', 'ready', 'error'].includes(data.type)) console.log('MODEL ' + JSON.stringify(data)); if (data.type === 'generating') console.log('TOKEN ' + data.tokens); }); }
    };
  });
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith(origin)) { await route.continue(); return; }
    if (!['pt.wikipedia.org', 'www.wikidata.org', 'api.artic.edu'].includes(new URL(url).hostname)) { await route.abort(); return; }
    // Real public API bytes fetched with TLS verification through the host proxy.
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    await route.fulfill({ status: response.status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: await response.text() });
  });
  await page.goto(origin);
  await page.locator('[data-lume-serverless]').waitFor({ state: 'attached' });
  await page.locator('[data-guide-open]').click();
  await page.locator('.lume-ai-panel summary').click();
  await page.locator('[data-lume-online]').check();
  await page.locator('[data-guide-input]').fill('Qual é a capital do Brasil?');
  await page.locator('[data-guide-form] button[type=submit]').click();
  await page.getByText(/Trechos das fontes consultadas/).waitFor();
  assert.match(await page.locator('.host-answer').last().innerText(), /Brasília/);
  assert.deepEqual(modelRequests, []);
  console.log('PASS: live internet research without any model or runtime download');
  await page.getByRole('button', { name: 'Limpar contexto', exact: true }).click();
  await page.locator('[data-lume-model]').click();
  await page.getByRole('button', { name: 'Desativar IA quantizada', exact: true }).waitFor({ timeout: 240000 });
  console.log('MODEL LOADED IN REAL BROWSER', await page.locator('[data-lume-model-status]').innerText());
  await page.locator('[data-lume-online]').check();
  await page.locator('[data-guide-input]').fill('Qual é a capital do Brasil?');
  await page.locator('[data-guide-form] button[type=submit]').click();
  await page.locator('.host-answer a[href^="https://www.wikidata.org/"]').first().waitFor({ timeout: 180000 });
  await page.locator('.host-answer').filter({ hasText: /Brasília/i }).waitFor({ timeout: 180000 });
  const answer = await page.locator('.host-answer').last().innerText();
  console.log('ACTUAL GENERATED ANSWER WITH LIVE INTERNET', answer);
  assert.match(answer, /bras[ií]lia/i);
  assert.ok(progress.length > 0, 'real token progress reached the UI');
  assert.ok(!answer.includes('sem síntese de IA'), 'actual model generated the response');
  assert.deepEqual(errors, []);
  await page.locator('[data-lume-model]').click();
  await page.screenshot({ path: '/tmp/lume-quantized-real.png' });
  console.log('PASS: pinned quantized weights + real browser WASM inference + real public internet sources');
} finally { await browser.close(); server.close(); }
