// Run against a local static server. Requires Playwright, supplied by the host.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    const external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/huggingface|jsdelivr|onnx/.test(request.url())) external.push(request.url()); });
    await page.addInitScript(() => {
      window.workerCount = 0;
      window.Worker = class {
        constructor() { window.workerCount++; }
        postMessage(data) {
          const reply = data.type === 'load' ? { type: 'ready' } : { type: 'answer', id: data.id, text: 'Explore as práticas de desenho do Método.' };
          setTimeout(() => this.onmessage?.({ data: reply }), 30);
        }
        terminate() {}
      };
    });
    await page.goto(process.env.SITE_URL || 'http://127.0.0.1:8765/');
    await page.locator('[data-guide-open]').click();
    const activate = page.locator('[data-lume-activate]');
    await activate.waitFor();
    assert.equal(await page.evaluate(() => window.workerCount), 0);
    assert.deepEqual(external, []);
    await page.locator('[data-guide-input]').fill('Quero praticar desenho no método');
    await page.locator('[data-guide-form] button').click();
    await page.locator('[data-guide-messages] a[href="/metodo/"]').waitFor();
    await activate.click();
    await page.getByText('Lume está pronta neste navegador.', { exact: true }).waitFor();
    await page.locator('[data-guide-input]').fill('Quero praticar desenho no método');
    await page.locator('[data-guide-form] button').click();
    await page.getByText('Explore as práticas de desenho do Método.', { exact: true }).waitFor();
    assert.equal(await page.locator('[data-guide-messages] a[href="/metodo/"]').count(), 2);
    assert.equal(await page.locator('[data-guide-form] button').isEnabled(), true);
    await activate.click();
    await page.getByText('IA local desativada.', { exact: true }).waitFor();
    const box = await activate.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= viewport.width);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `/tmp/lume-${viewport.width}.png` });
    await page.close();
    console.log(`PASS: native UI, opt-in, navigation, inference boundary and cancellation at ${viewport.width}px`);
  }
} finally { await browser.close(); }
