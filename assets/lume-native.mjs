// No model/runtime is fetched until the visitor explicitly activates Lume.
export class NativeGuide {
  constructor({ workerFactory = () => new Worker(new URL('./lume-ai.worker.mjs', import.meta.url), { type: 'module' }), onState = () => {}, answerTimeout = 60000, loadTimeout = 600000 } = {}) {
    Object.assign(this, { workerFactory, onState, answerTimeout, loadTimeout });
    this.state = 'idle';
    this.worker = null;
    this.pending = new Map();
    this.sequence = 0;
  }
  get ready() { return this.state === 'ready'; }
  change(state, detail = {}) { this.state = state; this.onState({ state, ...detail }); }
  start() {
    if (this.worker) return;
    this.change('loading');
    try {
      const worker = this.workerFactory();
      this.worker = worker;
      this.loadTimer = setTimeout(() => this.stop('error'), this.loadTimeout);
      worker.onerror = event => { event.preventDefault?.(); if (worker === this.worker) this.stop('error'); };
      worker.onmessage = ({ data = {} }) => {
        if (worker !== this.worker) return;
        if (data.type === 'ready') {
          clearTimeout(this.loadTimer);
          this.change('ready');
        } else if (data.type === 'error') {
          this.stop('error');
        } else if (data.type === 'backend' || data.type === 'progress') {
          this.onState({ ...data, state: this.state });
        } else if (data.type === 'answer') {
          const pending = this.pending.get(data.id);
          if (!pending) return;
          clearTimeout(pending.timer);
          this.pending.delete(data.id);
          const text = typeof data.text === 'string' ? data.text.trim().slice(0, 640) : '';
          pending.resolve(/https?:|www\.|<[^>]*>|\]\(/i.test(text) ? '' : text);
        }
      };
      worker.postMessage({ type: 'load' });
    } catch { this.stop('error'); }
  }
  ask(question, verifiedAnswer, locale = 'pt') {
    if (!this.ready || this.pending.size) return Promise.resolve('');
    return new Promise(resolve => {
      const id = ++this.sequence;
      const timer = setTimeout(() => this.stop('error'), this.answerTimeout);
      this.pending.set(id, { resolve, timer });
      try {
        this.worker.postMessage({ type: 'ask', id, question: String(question).slice(0, 500), verifiedAnswer: String(verifiedAnswer).slice(0, 640), locale: String(locale).split('-')[0] });
      } catch { this.stop('error'); }
    });
  }
  stop(state = 'idle') {
    clearTimeout(this.loadTimer);
    this.worker?.terminate();
    this.worker = null;
    for (const { resolve, timer } of this.pending.values()) { clearTimeout(timer); resolve(''); }
    this.pending.clear();
    this.change(state);
  }
}

export function installNativeGuide(guide, mode) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('./lume-native.css', import.meta.url).href;
  document.head.append(style);
  const panel = document.createElement('section');
  panel.className = 'lume-native';
  panel.setAttribute('aria-label', 'Inteligência da Lume');
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.lumeActivate = '';
  const note = document.createElement('p');
  note.textContent = 'Opcional: baixa cerca de 500 MB de Hugging Face e jsDelivr no primeiro uso e pode guardar o modelo no cache. Suas perguntas são processadas neste navegador. O modo de navegação continua disponível sem baixar a IA.';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.dataset.lumeStatus = '';
  panel.append(button, status, note);
  mode?.before(panel);
  const client = new NativeGuide({ onState: ({ state, type, progress }) => {
    button.textContent = state === 'loading' ? 'Cancelar download' : state === 'ready' ? 'Desativar IA local' : 'Ativar IA neste aparelho';
    button.setAttribute('aria-pressed', String(state === 'loading' || state === 'ready'));
    status.textContent = state === 'ready' ? 'Lume está pronta neste navegador.' : state === 'error' ? 'Não foi possível executar a IA neste aparelho. A navegação continua funcionando. Você pode tentar novamente.' : state === 'loading' ? (type === 'progress' && Number.isFinite(progress) ? `Carregando arquivo do modelo: ${Math.round(progress)}%.` : 'Preparando o modelo. Você pode continuar navegando ou cancelar.') : 'IA local desativada.';
    if (mode) mode.textContent = state === 'ready' ? 'IA local ativa: reformula as informações públicas; os botões seguem o mapa do site.' : 'Mapa, busca e orientação disponíveis neste site.';
  } });
  client.change('idle');
  button.addEventListener('click', () => client.worker ? client.stop() : client.start());
  window.addEventListener('pagehide', () => client.stop());
  return client;
}
