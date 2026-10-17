import { MODEL } from './lume-model-config.mjs';
let generator = null;
let loading = null;
let busy = false;
const send = value => self.postMessage(value);

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
    const { pipeline, env } = await import(MODEL.runtime);
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
    try { await load(); } catch { send({ type: 'error', stage: 'load' }); }
  } else if (data.type === 'generate') {
    if (!generator || busy) { send({ type: 'error', id: data.id, stage: 'generate' }); return; }
    busy = true;
    try {
      const messages = (Array.isArray(data.messages) ? data.messages : []).slice(0, 8).filter(message => ['system', 'user', 'assistant'].includes(message.role)).map(message => ({ role: message.role, content: String(message.content).slice(0, 6000) }));
      const prompt = generator.tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true, enable_thinking: false });
      const result = await generator(prompt, { max_new_tokens: Math.max(1, Math.min(MODEL.maxTokens, Number(data.maxTokens) || 160)), do_sample: false, return_full_text: false, repetition_penalty: 1.08 });
      const generated = result?.[0]?.generated_text;
      const text = Array.isArray(generated) ? generated.at(-1)?.content : generated;
      send({ type: 'result', id: data.id, text: String(text || '').replace(/<\|[^|]+\|>/g, '').trim().slice(0, 2200) });
    } catch { send({ type: 'error', id: data.id, stage: 'generate' }); }
    finally { busy = false; }
  }
});
