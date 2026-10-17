import test from 'node:test';
import assert from 'node:assert/strict';
import { QuantizedModel, LumeAgent } from '../assets/lume-quantized.mjs';
import { WebResearch } from '../assets/lume-web-research.mjs';

function fixture(options = {}) {
  const workers = [], states = [];
  const model = new QuantizedModel({ workerFactory: () => {
    const worker = { sent: [], postMessage(data) { this.sent.push(data); }, terminate() { this.dead = true; } };
    workers.push(worker); return worker;
  }, onState: value => states.push(value), ...options });
  return { model, workers, states, reply: data => workers.at(-1).onmessage({ data }) };
}

test('no worker or model download before explicit activation; load is idempotent', () => {
  const { model, workers, reply } = fixture();
  assert.equal(workers.length, 0);
  model.start(); model.start();
  assert.equal(workers.length, 1);
  assert.equal(workers[0].sent[0].type, 'load');
  reply({ type: 'ready', backend: 'CPU · 8 bits' });
  assert.equal(model.ready, true);
  model.stop();
});

test('cancelling settles inference, terminates worker and ignores late messages', async () => {
  const { model, workers, reply } = fixture();
  model.start(); reply({ type: 'ready' });
  const pending = model.generate([{ role: 'user', content: 'Olá' }]);
  const old = workers[0];
  model.stop();
  assert.equal(await pending, '');
  assert.equal(old.dead, true);
  old.onmessage({ data: { type: 'ready' } });
  assert.equal(model.ready, false);
});

test('inference timeout restores local mode instead of locking the form', async () => {
  const { model, reply } = fixture({ answerTimeout: 10 });
  model.start(); reply({ type: 'ready' });
  assert.equal(await model.generate([{ role: 'user', content: 'Olá' }]), '');
  assert.equal(model.ready, false);
});

test('request IDs isolate messages and bounds are enforced at worker boundary', async () => {
  const { model, workers, reply } = fixture();
  model.start(); reply({ type: 'ready' });
  const pending = model.generate([{ role: 'user', content: 'x'.repeat(10000) }], { maxTokens: 999 });
  const request = workers[0].sent.at(-1);
  assert.ok(request.messages[0].content.length <= 6000);
  assert.ok(request.maxTokens <= 192);
  reply({ type: 'result', id: request.id + 1, text: 'wrong' });
  reply({ type: 'result', id: request.id, text: 'Olá' });
  assert.equal(await pending, 'Olá'); model.stop();
});

test('agent generates its own answer and does not search when online access is off', async () => {
  let searches = 0;
  const agent = new LumeAgent({ model: { generate: async () => 'Olá, Harum.' }, web: { search: async () => { searches++; return []; } } });
  const result = await agent.answer('Olá', { online: false, siteContext: 'Arte Harum' });
  assert.equal(result.text, 'Olá, Harum.');
  assert.equal(searches, 0);
});

test('model can select a search tool and use retrieved sources in the final answer', async () => {
  const calls = [], queries = [];
  const source = { title: 'Desenho', url: 'https://pt.wikipedia.org/wiki/Desenho', excerpt: 'O desenho é uma arte visual.', provider: 'Wikipedia' };
  const model = { generate: async messages => { calls.push(messages); return calls.length === 1 ? '{"action":"search","query":"desenho"}' : 'O desenho é uma arte visual [1].'; } };
  const agent = new LumeAgent({ model, web: { search: async query => { queries.push(query); return [source]; } } });
  const result = await agent.answer('desenho', { online: true });
  assert.deepEqual(queries, ['desenho']);
  assert.equal(result.sources[0].url, source.url);
  assert.ok(calls[1].some(message => message.content.includes('O desenho é uma arte visual.')));
});

test('explicit research does not depend on a valid model plan', async () => {
  let searches = 0;
  const agent = new LumeAgent({ model: { generate: async () => 'not JSON' }, web: { search: async () => { searches++; return []; } } });
  await agent.answer('Pesquise Leonardo da Vinci', { online: true });
  assert.equal(searches, 1);
});

test('tool instructions cannot execute code, invent source URLs or trigger unbounded loops', async () => {
  let calls = 0, searches = 0;
  const agent = new LumeAgent({ model: { generate: async () => ++calls === 1 ? '{"action":"execute","query":"javascript:alert(1)"}' : 'Texto https://evil.example [9]' }, web: { search: async () => { searches++; return []; } } });
  const result = await agent.answer('Olá', { online: true });
  assert.equal(calls, 2);
  assert.equal(searches, 0);
  assert.ok(!result.text.includes('https://evil.example'));
  assert.ok(!result.text.includes('[9]'));
});

test('cancellation after tool selection prevents network and final generation', async () => {
  const controller = new AbortController(); let searches = 0;
  const agent = new LumeAgent({ model: { generate: async () => { controller.abort(); return '{"action":"search","query":"desenho"}'; } }, web: { search: async () => { searches++; } } });
  assert.equal((await agent.answer('Olá', { online: true, signal: controller.signal })).text, '');
  assert.equal(searches, 0);
});

test('internet tool only contacts fixed public APIs without credentials', async () => {
  const requests = [];
  const web = new WebResearch({ fetcher: async (url, options) => {
    requests.push([new URL(url), options]);
    return { ok: true, json: async () => ({ query: { pages: [{ pageid: 123, title: 'Desenho', fullurl: 'https://evil.example/steal', extract: '<script>1</script>Arte visual.' }] } }) };
  } });
  const result = await web.search('desenho');
  assert.ok(result[0].url.startsWith('https://pt.wikipedia.org/'));
  assert.equal(requests[0][0].hostname, 'pt.wikipedia.org');
  assert.equal(requests[0][1].credentials, 'omit');
  assert.ok(!result[0].excerpt.includes('<script>'));
});

test('failed or hanging public APIs settle within their deadline', async () => {
  const web = new WebResearch({ timeout: 10, fetcher: () => new Promise(() => {}) });
  assert.deepEqual(await web.search('desenho'), []);
});

test('canonical articles and redirects take precedence over broad search lists', async () => {
  const requests = [];
  const web = new WebResearch({ fetcher: async url => { requests.push(new URL(url)); return { ok: true, json: async () => ({ query: { pages: [{ pageid: 100, title: 'Artigo canônico', extract: 'Descrição da entidade.' }] } }) }; } });
  assert.equal((await web.search('entidade'))[0].title, 'Artigo canônico');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].searchParams.get('titles'), 'entidade');
  assert.equal(requests[0].searchParams.get('redirects'), '1');
});

test('structured properties resolve entity labels instead of inferring from unrelated lists', async () => {
  const calls = [];
  const web = new WebResearch({ fetcher: async value => {
    const url = new URL(value); calls.push(url);
    const data = url.searchParams.get('action') === 'wbsearchentities' ? { search: [{ id: 'Q100' }] } : url.searchParams.get('props') === 'claims|labels' ? { entities: { Q100: { labels: { pt: { value: 'Exemplo' } }, claims: { P36: [{ qualifiers: { P582: [{ datavalue: { value: { time: '+1960-01-01T00:00:00Z' } } }] }, mainsnak: { datavalue: { value: { id: 'Q199' } } } }, { mainsnak: { datavalue: { value: { id: 'Q200' } } } }] } } } } : { entities: { Q200: { labels: { pt: { value: 'Cidade Alfa' } } } } };
    return { ok: true, json: async () => data };
  } });
  const result = await web.search('capital de Exemplo');
  assert.equal(result[0].excerpt, 'Exemplo — capital: Cidade Alfa.');
  assert.equal(result[0].url, 'https://www.wikidata.org/wiki/Q100');
  assert.equal(calls.length, 3);
  assert.ok(calls.every(url => url.hostname === 'www.wikidata.org'));
});

test('factual questions search before inference and need only one model pass', async () => {
  const order = [];
  const source = { title: 'Brasil', url: 'https://www.wikidata.org/wiki/Q155', excerpt: 'Brasil — capital: Brasília.' };
  const agent = new LumeAgent({ model: { generate: async () => { order.push('generate'); return 'Brasília [1].'; } }, web: { search: async () => { order.push('search'); return [source]; } } });
  await agent.answer('Qual é a capital do Brasil?', { online: true, onSources: sources => { assert.equal(sources[0], source); order.push('sources'); } });
  assert.deepEqual(order, ['search', 'sources', 'generate']);
});

test('retrieved evidence remains readable if local inference fails after loading', async () => {
  const source = { title: 'Brasil', url: 'https://www.wikidata.org/wiki/Q155', excerpt: 'Brasil — capital: Brasília.' };
  const agent = new LumeAgent({ model: { generate: async () => '' }, web: { search: async () => [source] } });
  const result = await agent.answer('Qual é a capital do Brasil?', { online: true });
  assert.equal(result.mode, 'sources');
  assert.match(result.text, /Trechos das fontes/);
  assert.match(result.text, /Brasília/);
  assert.equal(result.sources[0].url, source.url);
});

test('online research works without loading weights or running a model', async () => {
  let generations = 0;
  const agent = new LumeAgent({ model: { generate: async () => { generations++; throw Error('must not run'); } }, web: { search: async () => [{ title: 'Monet', excerpt: 'Pintor francês.', url: 'https://pt.wikipedia.org/?curid=1' }] } });
  const result = await agent.answer('Monet', { online: true, useModel: false });
  assert.equal(generations, 0);
  assert.equal(result.mode, 'sources');
  assert.match(result.text, /Pintor francês/);
});

test('worker progress reports activity without mixing request IDs', async () => {
  const { model, reply, workers } = fixture();
  model.start(); reply({ type: 'ready' });
  const chunks = [];
  const pending = model.generate([{ role: 'user', content: 'Olá' }], { onProgress: value => chunks.push(value) });
  const id = workers[0].sent.at(-1).id;
  reply({ type: 'generating', id: id + 1, tokens: 10 });
  reply({ type: 'generating', id, tokens: 1 });
  reply({ type: 'result', id, text: 'Olá' });
  await pending;
  assert.deepEqual(chunks, [1]);
  model.stop();
});

test('memory failures remain distinguishable from download errors in the interface state', () => {
  const { model, reply, states } = fixture();
  model.start(); reply({ type: 'error', stage: 'generate', code: 'memory' });
  assert.equal(states.at(-1).code, 'memory');
  assert.equal(states.at(-1).state, 'error');
});

test('a timed out loaded worker still returns retrieved facts and releases the model', async () => {
  const { model, reply } = fixture({ answerTimeout: 10 });
  model.start(); reply({ type: 'ready' });
  const agent = new LumeAgent({ model, web: { search: async () => [{ title: 'Brasil', url: 'https://www.wikidata.org/wiki/Q155', excerpt: 'Brasil — capital: Brasília.' }] } });
  const result = await agent.answer('Qual é a capital do Brasil?', { online: true });
  assert.match(result.text, /Brasília/);
  assert.equal(result.mode, 'sources');
  assert.equal(model.worker, null);
});

test('plural factual questions bypass the planner on a slow device', async () => {
  const order = [];
  const agent = new LumeAgent({ model: { generate: async () => { order.push('generate'); return ''; } }, web: { search: async () => { order.push('search'); return [{ title: 'Cores', excerpt: 'Cores primárias.', url: 'https://pt.wikipedia.org/?curid=1' }]; } } });
  const result = await agent.answer('Quais são as cores primárias?', { online: true });
  assert.deepEqual(order, ['search', 'generate']);
  assert.equal(result.mode, 'sources');
});

test('a failed implicit search plan still retrieves sources instead of trying inference twice', async () => {
  let searched = false;
  const agent = new LumeAgent({ model: { generate: async () => '' }, web: { search: async () => { searched = true; return [{ title: 'Monet', excerpt: 'Pintor francês.', url: 'https://pt.wikipedia.org/?curid=1' }]; } } });
  const result = await agent.answer('Me conte sobre Monet', { online: true });
  assert.equal(searched, true);
  assert.equal(result.mode, 'sources');
});
