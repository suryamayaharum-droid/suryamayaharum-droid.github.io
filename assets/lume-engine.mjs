import { PAGES, PRACTICES } from './lume-knowledge.mjs';
import MiniSearch from './vendor/minisearch-7.2.0.mjs';

export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set('a o as os de da do das dos e em na no nas nos um uma para por com que quero queria preciso posso como onde ver sobre me mostre procurar buscar encontrar estudar por favor qual quais faca faco fazer agora'.split(' '));
const ALIASES = { desenhar: 'desenho', desenhos: 'desenho', aprender: 'aprender', praticar: 'praticas', exercicio: 'exercicios', tattoo: 'tatuagem', custo: 'preco', custa: 'preco', marcar: 'agendar', marcacao: 'agendar', colecoes: 'colecao' };
const processTerm = value => { const token = normalize(value); return token.length > 1 && !STOP.has(token) ? ALIASES[token] || token : null; };
const tokens = value => normalize(value).split(' ').map(processTerm).filter(Boolean);

function buildIndex(pages) {
  const index = new MiniSearch({
    fields: ['title', 'keywords', 'text'],
    processTerm,
    searchOptions: { boost: { title: 3, keywords: 4, text: 0.3 }, prefix: true, fuzzy: term => term.length > 4 ? 0.2 : false }
  });
  index.addAll(pages.map(page => ({ ...page, keywords: (page.keywords || []).join(' ') })));
  return index;
}

export function rankPages(question, pages = PAGES, index = null) {
  const q = normalize(question), query = [...new Set(tokens(q))];
  if (!query.length) return [];
  const byId = new Map(pages.map(page => [page.id, page]));
  return (index || buildIndex(pages)).search(query.join(' ')).map(result => {
    const page = byId.get(result.id);
    const bonus = (page.keywords || []).reduce((sum, phrase) => {
      const key = normalize(phrase);
      return sum + (q.includes(key) && key.length > 2 ? (key.includes(' ') ? 8 : 3) : 0);
    }, 0);
    return { page, score: result.score + bonus, bonus, matched: result.queryTerms?.length || 0 };
  }).filter(result => result.score > 0 && (result.bonus >= 3 || result.matched >= Math.min(2, query.length))).sort((a, b) => b.score - a.score);
}

export class LocalGuide {
  constructor({ page = '/', storage = null } = {}) {
    this.page = page;
    this.storage = storage;
    this.pages = new Map(PAGES.map(item => [item.id, item]));
    this.index = buildIndex(PAGES);
    this.topics = [];
    this.practice = 0;
    try {
      const saved = JSON.parse(storage?.getItem('harum.lume.context.v2') || '{}');
      this.topics = Array.isArray(saved.topics) ? saved.topics.filter(id => this.pages.has(id)).slice(0, 4) : [];
    } catch {}
  }
  addPages(pages) {
    for (const page of pages) {
      if (!page.id || !page.href) continue;
      if (this.pages.get(page.id) === page) continue;
      if (this.pages.has(page.id)) this.index.discard(page.id);
      this.pages.set(page.id, page);
      this.index.add({ ...page, keywords: (page.keywords || []).join(' ') });
    }
  }
  remember(ids) {
    this.topics = ids.filter(id => this.pages.has(id)).slice(0, 4);
    // Persist only reviewed IDs, never queries, messages, names or contact details.
    try { this.storage?.setItem('harum.lume.context.v2', JSON.stringify({ topics: this.topics.filter(id => PAGES.some(page => page.id === id)) })); } catch {}
  }
  clear() {
    this.topics = [];
    try { this.storage?.removeItem('harum.lume.context.v2'); } catch {}
  }
  describe(ids, kind = 'answer', prefix = '') {
    const records = [...new Set(ids)].map(id => this.pages.get(id)).filter(Boolean).slice(0, 4);
    if (!records.length) return this.unknown();
    this.remember(records.map(page => page.id));
    return { kind, text: prefix || records[0].text, actions: records.map(page => ({ href: page.href, label: page.title })) };
  }
  unknown() {
    return { kind: 'unknown', text: 'Posso orientar sobre as páginas e coleções deste site. Experimente “quero aprender desenho”, “buscar mãos”, “projeto noivas” ou “como agendar”.', actions: ['explore', 'method', 'contact'].map(id => ({ href: this.pages.get(id).href, label: this.pages.get(id).title })) };
  }
  answer(question) {
    const q = normalize(String(question).slice(0, 500));
    if (/^(apagar|limpar|esquecer|reiniciar).*(memoria|conversa|contexto|tudo)$/.test(q)) {
      this.clear();
      return { kind: 'clear', text: 'O contexto de navegação desta aba foi apagado. Podemos começar de novo.', actions: [] };
    }
    if (/onde estou|esta pagina|o que (tem|vejo) aqui|explica.*pagina/.test(q)) {
      return this.describe([...this.pages.values()].filter(page => page.href === this.page).map(page => page.id), 'page');
    }
    if (/^(continue|continuar|proximo|proximo passo|e agora|o que faco depois|e depois)$/.test(q)) {
      const current = this.pages.get(this.topics[0]) || [...this.pages.values()].find(page => page.href === this.page);
      return this.describe(current?.next?.length ? current.next : ['explore', 'method'], 'next', 'Para continuar esse percurso, estes são os próximos caminhos:');
    }
    if (/mapa.*site|quais (paginas|secoes)|o que tem no site|todos os caminhos/.test(q)) return this.describe(['explore', 'gallery', 'method', 'noivas'], 'map', 'Estas portas conectam o ecossistema. No mapa geral você encontra as demais páginas e coleções.');
    if (/sugira.*exercicio|exercicio.*(agora|rapido)|pratica.*(rapida|agora)|outro exercicio/.test(q)) {
      const practice = PRACTICES[this.practice++ % PRACTICES.length];
      return this.describe(['method'], 'practice', `${practice.title}. ${practice.text} A prática completa está no Método.`);
    }
    if (/^(oi|ola|bom dia|boa tarde|boa noite|ajuda|quem e voce)$/.test(q)) return this.describe(['explore', 'method', 'booking'], 'welcome', 'Sou Lume, guia do ecossistema Arte Harum. Posso encontrar páginas, sugerir uma prática e continuar um percurso com você.');
    const ranked = rankPages(q, [...this.pages.values()], this.index);
    if (!ranked.length) return this.unknown();
    const first = ranked[0];
    const related = (first.page.next || []).filter(id => this.pages.has(id));
    const kind = first.page.id.startsWith('page:') ? 'discovered' : first.matched < new Set(tokens(q)).size ? 'partial' : 'answer';
    return this.describe([first.page.id, ...related.slice(0, 1)], kind);
  }
}
