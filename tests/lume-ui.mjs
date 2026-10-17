// node tests/lume-ui.mjs (Playwright supplied by the development environment).
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
let origin;
const server = createServer(async (req, res) => {
  try {
    let pathname = new URL(req.url, origin).pathname;
    if (pathname === '/novo-acervo-botanico/') {
      res.setHeader('Content-Type', 'text/html');
      res.end('<title>Novo acervo botânico</title><main>Estudos de azaléias e formas vegetais.</main>');
      return;
    }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const filename = path.resolve(root, '.' + pathname);
    if (!filename.startsWith(root)) throw Error('outside root');
    let data = await readFile(filename);
    if (pathname === '/sitemap.xml') {
      data = Buffer.from(data.toString().replaceAll('https://suryamayaharum-droid.github.io', origin).replace('</urlset>', '<url><loc>' + origin + '/novo-acervo-botanico/</loc></url></urlset>'));
    }
    const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.xml': 'application/xml', '.json': 'application/json' };
    res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--disable-gpu', '--no-zygote'] });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [], aiRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/huggingface|jsdelivr|\.onnx|\.gguf/.test(request.url())) aiRequests.push(request.url()); });
    await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await page.addInitScript(() => {
      window.createdModels = 0;
      window.createdWorkers = 0;
      window.modelAvailability = 'downloadable';
      window.Worker = class { constructor() { window.createdWorkers++; throw Error('No model workers allowed'); } };
      Object.defineProperty(window, 'LanguageModel', { configurable: true, value: {
        availability: async () => window.modelAvailability === 'hang' ? new Promise(() => {}) : window.modelAvailability,
        create: async () => { window.createdModels++; throw Error('Must never create downloadable model'); }
      } });
    });
    await page.goto(origin + '/');
    await page.locator('[data-lume-serverless]').waitFor({ state: 'attached' });
    assert.equal(await page.locator('[data-guide-open]').count(), 1);
    await page.locator('[data-guide-open]').click();
    const ask = async question => {
      await page.locator('[data-guide-input]').fill(question);
      await page.locator('[data-guide-form] button[type=submit]').click();
    };
    await ask('Quero aprender desnho');
    await page.locator('.host-answer a[href="/metodo/"]').waitFor();
    await ask('Quero ver as noivas');
    await page.locator('.host-answer a[href="/noivas/"]').waitFor();
    await page.goto(origin + '/metodo/');
    await page.locator('[data-guide-open]').click();
    await ask('continue');
    await page.locator('.host-answer a[href="/noivas/catalogo-completo.html"]').waitFor();
    await ask('novo acervo botanico');
    try { await page.getByText(/Nesta página: Estudos de azaléias/).waitFor({ timeout: 7000 }); }
    catch (error) { console.log('DEBUG', await page.locator('[data-guide-messages]').innerText(), await page.locator('[data-guide-mode]').innerText(), errors); throw error; }
    await ask('enigmatico');
    await page.getByText(/Posso orientar sobre as páginas/).waitFor();
    assert.equal(await page.evaluate(() => window.createdModels), 0);
    assert.equal(await page.evaluate(() => window.createdWorkers), 0);
    assert.deepEqual(aiRequests, []);
    await page.evaluate(() => { window.modelAvailability = 'hang'; });
    await ask('enigmatico');
    await page.getByRole('button', { name: 'Cancelar resposta', exact: true }).click();
    await page.getByText('Consulta cancelada. A navegação local continua disponível.', { exact: true }).waitFor();
    assert.equal(await page.locator('[data-guide-form] button[type=submit]').isEnabled(), true);
    await page.evaluate(() => { window.modelAvailability = 'downloadable'; });
    await ask('<script>window.lumeXss=1</script>');
    assert.equal(await page.evaluate(() => window.lumeXss), undefined);
    await page.getByRole('button', { name: 'Limpar contexto', exact: true }).click();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('harum.lume.context.v2')), null);
    const dialog = page.locator('#harum-guide-dialog');
    const box = await dialog.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= viewport.width + 1);
    await page.screenshot({ path: '/tmp/lume-serverless-' + viewport.width + '.png' });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-guide-open]').evaluate(element => document.activeElement === element), true);
    await page.goto(origin + '/galeria-viva/');
    await page.locator('[data-guide-open]').click();
    await ask('onde estou?');
    await page.locator('.host-answer a[href="/galeria-viva/"]').waitFor();
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS UI ' + viewport.width + 'px: existing/new shell, cross-page context, discovery, no downloads, XSS, keyboard and layout');
  }
} finally { await browser.close(); server.close(); }
