import { MODEL } from './lume-model-config.mjs';
let generator = null;
let loading = null;
let busy = false;
let TextStreamer;
const send = value => self.postMessage(value);
const failure = (error, stage) => /memory|allocat|Array buffer|bad_alloc/i.test(String(error?.message || '')) ? 'memory' : /fetch|network|download|404|403/i.test(String(error?.message || '')) ? 'network' : stage;

async function load() {
  if (generator) return;
  if (loading) return loading;
  loading = (async () => {
    let device = 'wasm', dtype = 'q8', backend = 'CPU · 8 bits · cerca de 618 MB';
    try {
      const adapter = await self.navigator?.gpu?.requestAdapter();
      if (adapter?.features.has('shader-f16')) { device = 'webgpu'; dtype = 'q4f16'; backend = 'GPU · 4 bits · cerca de 570 MB'; }
    } catch {}
    send({ type: 'backend', backend });
    const runtime = await import(MODEL.runtime);
    const { pipeline, env } = runtime;
    TextStreamer = runtime.TextStreamer;
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.proxy = false;
    const options = { dtype, revision: MODEL.revision, progress_callback: info => send({ type: 'progress', file: String(info.file || ''), progress: Number.isFinite(info.progress) ? info.progress : null, status: info.status }) };
    if (device === 'webgpu') options.device = device;
    generator = await pipeline('text-generation', MODEL.id, options);
    send({ type: 'ready', backend });
  })();
  try { await loading; } finally { loading = null; }
}

self.addEventListener('message', async ({ data = {} }) => {
  if (data.type === 'load') {
    try { await load(); } catch (error) { send({ type: 'error', stage: 'load', code: failure(error, 'load') }); }
  } else if (data.type === 'generate') {
    if (!generator || busy) { send({ type: 'error', id: data.id, stage: 'generate' }); return; }
    busy = true;
    try {
      const messages = (Array.isArray(data.messages) ? data.messages : []).slice(0, 8).filter(message => ['system', 'user', 'assistant'].includes(message.role)).map(message => ({ role: message.role, content: String(message.content).slice(0, 6000) }));
      const prompt = generator.tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true, enable_thinking: false });
      let tokens = 0;
      const streamer = new TextStreamer(generator.tokenizer, { skip_prompt: true, callback_function: () => {}, token_callback_function: () => { send({ type: 'generating', id: data.id, tokens: ++tokens }); } });
      const result = await generator(prompt, { streamer, max_new_tokens: Math.max(1, Math.min(MODEL.maxTokens, Number(data.maxTokens) || 160)), do_sample: false, return_full_text: false, repetition_penalty: 1.08 });
      const generated = result?.[0]?.generated_text;
      const text = Array.isArray(generated) ? generated.at(-1)?.content : generated;
      send({ type: 'result', id: data.id, text: String(text || '').replace(/<\|[^|]+\|>/g, '').trim().slice(0, 2200) });
    } catch (error) { send({ type: 'error', id: data.id, stage: 'generate', code: failure(error, 'generate') }); }
    finally { busy = false; }
  }
});
