import test from 'node:test';
import assert from 'node:assert/strict';
import { PublicIndex } from '../assets/lume-public-index.mjs';
import { LocalGuide } from '../assets/lume-engine.mjs';

const origin = 'https://suryamayaharum-droid.github.io';
const xml = '<urlset><url><loc>' + origin + '/anatomia-botanica/</loc></url><url><loc>https://evil.example/foreign/</loc></url><url><loc>' + origin + '/assets/image.png</loc></url><url><loc>' + origin + '/admin/</loc></url><url><loc>' + origin + '/privada/?token=foo</loc></url></urlset>';

test('the default fetch adapter preserves the browser global receiver', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async function () { assert.equal(this, globalThis); return { ok: true, text: async () => xml }; };
  try { assert.equal((await new PublicIndex({ origin }).discover()).length, 1); }
  finally { globalThis.fetch = previous; }
});

test('encoded administrative paths and malformed URLs are not fetched', () => {
  const index = new PublicIndex({ origin });
  for (const path of ['/%61dmin/', '/%2fapi/', '/%ZZ/', 'https://evil.example/pagina/', '/assets/model.html', '/private/?token=secret']) assert.equal(index.safeURL(path), null);
});

test('discovers new public routes while excluding external hosts, assets, admin and query strings', async () => {
  const requests = [];
  const index = new PublicIndex({ origin, fetcher: async (url, options) => { requests.push([String(url), options]); return { ok: true, text: async () => xml }; } });
  const pages = await index.discover();
  assert.deepEqual(pages.map(page => page.href), ['/anatomia-botanica/']);
  await index.discover();
  assert.equal(requests.length, 1);
  assert.equal(requests[0][1].credentials, 'omit');
  assert.equal(requests[0][1].redirect, 'error');
});

test('hydrates relevant pages, removes executable markup and updates the local index', async () => {
  const requests = [];
  const index = new PublicIndex({ origin, fetcher: async url => {
    requests.push(String(url));
    return { ok: true, text: async () => String(url).endsWith('sitemap.xml') ? xml : '<title>Anatomia Botânica</title><main><script>steal()</script><nav>menu</nav><p>Estudos de rosas e figura humana.</p></main>' };
  } });
  const guide = new LocalGuide();
  guide.addPages(await index.discover());
  const enriched = await index.lookup('anatomia botânica');
  guide.addPages(enriched);
  const answer = guide.answer('anatomia botânica');
  assert.equal(answer.actions[0].href, '/anatomia-botanica/');
  assert.match(answer.text, /rosas e figura humana/);
  assert.ok(!answer.text.includes('steal'));
  await index.lookup('anatomia botânica');
  assert.equal(requests.length, 2);
});

test('a partial match in the built-in catalog still allows discovery of a more specific new page', async () => {
  const guide = new LocalGuide();
  const question = 'novo acervo botanico';
  assert.equal(guide.answer(question).kind, 'partial');
  const index = new PublicIndex({ origin, fetcher: async url => ({ ok: true, text: async () => String(url).endsWith('xml') ? '<urlset><url><loc>' + origin + '/novo-acervo-botanico/</loc></url></urlset>' : '<title>Novo acervo botânico</title><main>Azaléias para estudo.</main>' }) });
  guide.addPages(await index.lookup(question));
  assert.equal(guide.answer(question).actions[0].href, '/novo-acervo-botanico/');
});

test('discovery is bounded and only fetches at most two matching pages', async () => {
  let requests = 0;
  const sitemap = '<urlset>' + Array.from({ length: 600 }, (_, i) => '<url><loc>' + origin + '/rose-study-' + i + '/</loc></url>').join('') + '</urlset>';
  const index = new PublicIndex({ origin, limit: 25, fetcher: async url => { requests++; return { ok: true, text: async () => String(url).endsWith('xml') ? sitemap : '<main>Rose study</main>' }; } });
  assert.equal((await index.discover()).length, 25);
  await index.lookup('rose study');
  assert.equal(requests, 3);
});

test('a hanging or failed sitemap does not hang the guide', async () => {
  const index = new PublicIndex({ origin, timeout: 10, fetcher: () => new Promise(() => {}) });
  assert.deepEqual(await index.lookup('anything'), []);
  const failed = new PublicIndex({ origin, fetcher: async () => ({ ok: false }) });
  assert.deepEqual(await failed.discover(), []);
});

test('cancelled discovery is retryable and late responses cannot modify the index', async () => {
  let resolve;
  const index = new PublicIndex({ origin, fetcher: () => new Promise(r => { resolve = r; }) });
  const pending = index.discover();
  index.cancel();
  resolve({ ok: true, text: async () => xml });
  assert.deepEqual(await pending, []);
  assert.equal(index.records.size, 0);
  index.fetcher = async () => ({ ok: true, text: async () => xml });
  assert.equal((await index.discover()).length, 1);
});
