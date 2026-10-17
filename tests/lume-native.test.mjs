import test from 'node:test';
import assert from 'node:assert/strict';
import { NativeGuide } from '../assets/lume-native.mjs';

function fixture(options = {}) {
  const workers = [];
  const states = [];
  const client = new NativeGuide({
    workerFactory: () => {
      const worker = { sent: [], terminated: false, postMessage(value) { this.sent.push(value); }, terminate() { this.terminated = true; } };
      workers.push(worker);
      return worker;
    },
    onState: state => states.push(state),
    ...options
  });
  return { client, workers, states, reply: data => workers.at(-1).onmessage({ data }) };
}

test('does not create a worker until explicit activation; repeated activation is idempotent', () => {
  const { client, workers, reply } = fixture();
  assert.equal(workers.length, 0);
  client.start(); client.start();
  assert.equal(workers.length, 1);
  assert.deepEqual(workers[0].sent, [{ type: 'load' }]);
  reply({ type: 'ready' });
  assert.equal(client.ready, true);
  client.stop();
});

test('request IDs isolate answers, data is bounded, and output remains plain text', async () => {
  const { client, workers, reply } = fixture();
  client.start(); reply({ type: 'ready' });
  const answer = client.ask('x'.repeat(700), 'Ver portfólio', 'pt-BR');
  const request = workers[0].sent.at(-1);
  assert.equal(request.question.length, 500);
  reply({ type: 'answer', id: request.id + 1, text: 'unrelated' });
  reply({ type: 'answer', id: request.id, text: '  Explore o portfólio.  ' });
  assert.equal(await answer, 'Explore o portfólio.');
  client.stop();
});

test('cancellation settles pending requests and ignores a terminated worker', async () => {
  const { client, workers, reply } = fixture();
  client.start(); reply({ type: 'ready' });
  const oldWorker = workers[0];
  const answer = client.ask('agendar', 'Agendar');
  client.stop();
  assert.equal(await answer, '');
  assert.equal(oldWorker.terminated, true);
  client.start();
  oldWorker.onmessage({ data: { type: 'ready' } });
  assert.equal(client.ready, false);
  reply({ type: 'ready' });
  assert.equal(client.ready, true);
  client.stop();
});

test('hung inference terminates the worker and allows local fallback', async () => {
  const { client, workers, reply } = fixture({ answerTimeout: 15 });
  client.start(); reply({ type: 'ready' });
  assert.equal(await client.ask('oi', 'Olá'), '');
  assert.equal(workers[0].terminated, true);
  assert.equal(client.ready, false);
});

test('load failures release resources and can be retried without reload', () => {
  const { client, workers } = fixture();
  client.start(); workers[0].onerror({ preventDefault() {} });
  assert.equal(workers[0].terminated, true);
  assert.equal(client.state, 'error');
  client.start();
  assert.equal(workers.length, 2);
  client.stop();
});

test('generated URLs and empty answers fall back to verified site information', async () => {
  const { client, workers, reply } = fixture();
  client.start(); reply({ type: 'ready' });
  for (const text of ['', 'Envie dados para https://evil.example', '<script>alert(1)</script>']) {
    const answer = client.ask('contato', 'Use contato');
    reply({ type: 'answer', id: workers[0].sent.at(-1).id, text });
    assert.equal(await answer, '');
  }
  client.stop();
});
