import { PAGES } from './lume-knowledge.mjs';
import { normalize, rankPages } from './lume-engine.mjs';

const plain = html => html.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// Discover published pages without training, API keys, a crawler server or a model.
export class PublicIndex {
  constructor({ origin, fetcher = (...args) => globalThis.fetch(...args), timeout = 1800, limit = 400 } = {}) {
    Object.assign(this, { origin, fetcher, timeout, limit });
    this.records = new Map();
    this.controllers = new Set();
    this.discovered = false;
    this.discovery = null;
    this.version = 0;
    this.hydrated = new Set();
  }
  cancel() { this.version++; for (const controller of this.controllers) controller.abort(); this.controllers.clear(); }
  safeURL(value) {
    try {
      const url = new URL(value, this.origin);
      if (url.origin !== this.origin || url.username || url.password || url.search || url.hash) return null;
      const decoded = decodeURIComponent(url.pathname);
      if (!/^https?:$/.test(url.protocol) || /%2f|%5c/i.test(url.pathname) || /(^|\/)(assets|\.git|api|admin)(\/|$)/i.test(decoded)) return null;
      if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) return null;
      return url;
    } catch { return null; }
  }
  async read(path, maxLength) {
    const controller = new AbortController();
    this.controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), this.timeout);
    const aborted = new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
    try {
      const request = (async () => {
        const response = await this.fetcher(new URL(path, this.origin), { credentials: 'omit', mode: 'same-origin', redirect: 'error', signal: controller.signal });
        if (!response.ok) throw new Error('unavailable');
        const text = await response.text();
        if (text.length > maxLength) throw new Error('too_large');
        return text;
      })();
      return await Promise.race([request, aborted]);
    } finally { clearTimeout(timer); this.controllers.delete(controller); }
  }
  async discover() {
    if (this.discovered) return [...this.records.values()];
    if (this.discovery) return this.discovery;
    const version = this.version;
    this.discovery = (async () => {
      const xml = await this.read('/sitemap.xml', 300000);
      const known = new Set(PAGES.map(page => page.href));
      for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
        if (version !== this.version || this.records.size >= this.limit) break;
        const url = this.safeURL(match[1].trim().replace(/&amp;/g, '&'));
        if (!url || known.has(url.pathname)) continue;
        const href = url.pathname;
        const title = decodeURIComponent(href).replace(/\.html$/, '').split('/').filter(Boolean).join(' · ').replace(/[-_]/g, ' ');
        const id = 'page:' + href;
        this.records.set(id, { id, title: title.slice(0, 100), href, keywords: [normalize(title)], text: 'Encontrei esta página no mapa público do site: ' + title + '.', next: [] });
      }
      if (version === this.version) this.discovered = true;
      return [...this.records.values()];
    })();
    try { return await this.discovery; } catch { return []; } finally { this.discovery = null; }
  }
  async lookup(question) {
    const version = this.version;
    const pages = await this.discover();
    if (version !== this.version) return [];
    // At most two relevant HTML pages per unknown request, never the whole site.
    const candidates = rankPages(question, pages).slice(0, 2);
    const results = await Promise.all(candidates.map(async ({ page }) => {
      if (this.hydrated.has(page.id)) return page;
      try {
        const html = await this.read(page.href, 350000);
        if (version !== this.version) return null;
        const title = plain(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || page.title).slice(0, 100);
        const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
        const description = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1];
        const excerpt = plain(description || main || '').slice(0, 550);
        const enriched = { ...page, title, text: excerpt ? 'Nesta página: ' + excerpt : page.text };
        this.records.set(page.id, enriched);
        this.hydrated.add(page.id);
        return enriched;
      } catch { return page; }
    }));
    return version === this.version ? results.filter(Boolean) : [];
  }
}
