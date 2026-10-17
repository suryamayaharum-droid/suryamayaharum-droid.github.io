const plain = value => String(value || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// A bounded, read-only internet tool. No arbitrary URL fetch, credentials or JSONP.
export class WebResearch {
  constructor({ fetcher = (...args) => globalThis.fetch(...args), timeout = 8000 } = {}) {
    Object.assign(this, { fetcher, timeout });
  }
  async search(query, { signal, provider = 'wikipedia', question = '' } = {}) {
    if (signal?.aborted) return [];
    const clean = plain(query).replace(/^(search\s+(for\s+)?(information\s+)?(about\s+)?|information about\s+|pesquis(e|ar)\s+(sobre\s+)?)/i, '').slice(0, 180);
    if (!clean) return [];
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, this.timeout);
    const aborted = new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('cancelled')), { once: true }));
    const read = async url => {
      const request = (async () => {
        const response = await this.fetcher(url, { mode: 'cors', credentials: 'omit', redirect: 'error', signal: controller.signal, headers: { accept: 'application/json' } });
        if (!response.ok) throw new Error('source_unavailable');
        return response.json();
      })();
      return Promise.race([request, aborted]);
    };
    const fact = async () => {
      const input = plain(question || query).replace(/[?.!]+$/, '');
      const relations = [
        [/capital\s+(?:do|da|de)\s+(.+)/i, 'P36', 'capital'],
        [/autor\s+(?:do|da|de)\s+(.+)/i, 'P50', 'autor'],
        [/criador\s+(?:do|da|de)\s+(.+)/i, 'P170', 'criador'],
        [/nacionalidade\s+(?:do|da|de)\s+(.+)/i, 'P27', 'nacionalidade'],
        [/local de nascimento\s+(?:do|da|de)\s+(.+)/i, 'P19', 'local de nascimento'],
        [/data de nascimento\s+(?:do|da|de)\s+(.+)/i, 'P569', 'data de nascimento'],
        [/data de morte\s+(?:do|da|de)\s+(.+)/i, 'P570', 'data de morte']
      ];
      const relation = relations.find(([pattern]) => pattern.test(input));
      if (!relation) return [];
      const [, property, label] = relation;
      const entityName = input.match(relation[0])[1].trim().slice(0, 100);
      const endpoint = params => { const url = new URL('https://www.wikidata.org/w/api.php'); url.search = new URLSearchParams({ format: 'json', origin: '*', ...params }); return url; };
      const search = await read(endpoint({ action: 'wbsearchentities', search: entityName, language: 'pt', uselang: 'pt', type: 'item', limit: '1' }));
      const id = search.search?.[0]?.id;
      if (!/^Q[1-9][0-9]*$/.test(id || '')) return [];
      const data = await read(endpoint({ action: 'wbgetentities', ids: id, props: 'claims|labels', languages: 'pt|en' }));
      const entity = data.entities?.[id];
      const claims = (entity?.claims?.[property] || []).filter(claim => claim.rank !== 'deprecated');
      const preferred = claims.filter(claim => claim.rank === 'preferred');
      const now = Date.now();
      const current = claims.filter(claim => {
        const times = key => (claim.qualifiers?.[key] || []).map(snak => Date.parse(String(snak.datavalue?.value?.time || '').replace(/^\+/, ''))).filter(Number.isFinite);
        return !times('P582').some(time => time <= now) && !times('P580').some(time => time > now);
      });
      const values = (preferred.length ? preferred : current).slice(0, 3).map(claim => claim.mainsnak?.datavalue?.value).filter(Boolean);
      if (!values.length) return [];
      const ids = values.map(value => value.id).filter(id => /^Q[1-9][0-9]*$/.test(id || ''));
      let labels = {};
      if (ids.length) labels = (await read(endpoint({ action: 'wbgetentities', ids: ids.join('|'), props: 'labels', languages: 'pt|en' }))).entities || {};
      const text = values.map(value => value.id ? labels[value.id]?.labels?.pt?.value || labels[value.id]?.labels?.en?.value : value.time ? value.time.replace(/^\+/, '').slice(0, 10) : typeof value === 'string' ? value : '').filter(Boolean).join('; ');
      const name = entity.labels?.pt?.value || entity.labels?.en?.value || entityName;
      return text ? [{ title: plain(name + ' · ' + label).slice(0, 150), url: 'https://www.wikidata.org/wiki/' + id, excerpt: plain(name + ' — ' + label + ': ' + text + '.').slice(0, 650), provider: 'Wikidata' }] : [];
    };
    const wiki = async () => {
      const url = new URL('https://pt.wikipedia.org/w/api.php');
      const common = { action: 'query', prop: 'extracts|info|pageprops', ppprop: 'disambiguation', exintro: '1', explaintext: '1', exchars: '650', inprop: 'url', format: 'json', formatversion: '2', origin: '*' };
      const pages = data => (data.query?.pages || []).filter(page => Number.isSafeInteger(page.pageid) && page.pageid > 0 && typeof page.title === 'string' && page.extract && !Object.hasOwn(page.pageprops || {}, 'disambiguation'));
      // Resolve the actual article/redirect first; title ranking can otherwise
      // prefer loosely related list pages over the entity asked about.
      url.search = new URLSearchParams({ ...common, titles: clean, redirects: '1' });
      let found = pages(await read(url));
      if (!found.length && !controller.signal.aborted) {
        url.search = new URLSearchParams({ ...common, generator: 'search', gsrsearch: clean, gsrlimit: '3' });
        found = pages(await read(url));
      }
      return found.sort((a, b) => (a.index || 0) - (b.index || 0)).slice(0, 3).map(page => ({ title: plain(page.title).slice(0, 150), url: 'https://pt.wikipedia.org/?curid=' + page.pageid, excerpt: plain(page.extract).slice(0, 650), provider: 'Wikipedia' }));
    };
    const museum = async () => {
      const url = new URL('https://api.artic.edu/api/v1/artworks/search');
      url.search = new URLSearchParams({ q: clean, limit: '3', fields: 'id,title,artist_display,date_display,medium_display' });
      const data = await read(url);
      return (data.data || []).filter(item => Number.isSafeInteger(item.id) && item.id > 0 && item.title).slice(0, 3).map(item => ({ title: plain(item.title).slice(0, 150), url: 'https://www.artic.edu/artworks/' + item.id, excerpt: plain([item.title, item.artist_display, item.date_display, item.medium_display].filter(Boolean).join('. ')).slice(0, 650), provider: 'Art Institute of Chicago' }));
    };
    try {
      const tools = provider === 'museum' ? [museum, wiki] : [fact, wiki, museum];
      for (const tool of tools) {
        if (controller.signal.aborted) return [];
        try { const results = await tool(); if (results.length) return results; } catch {}
      }
      return [];
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
  }
}
