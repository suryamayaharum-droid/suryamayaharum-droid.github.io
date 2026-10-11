(function(){
  if (window.__studio23Finalized) return;
  window.__studio23Finalized = true;

  const routeMeta = {
    '/portfolio/':{label:'Portfólio', prompt:'Explore os projetos e desenhos disponíveis no estúdio.'},
    '/biblioteca/':{label:'Biblioteca', prompt:'Veja estudos, referências e categorias visuais.'},
    '/agendar/':{label:'Agendar', prompt:'Organize sua ideia e prepare a conversa inicial.'},
    '/faq/':{label:'FAQ', prompt:'Confira dúvidas frequentes antes de começar o projeto.'},
    '/cuidados/':{label:'Cuidados', prompt:'Entenda a rotina correta após a sessão.'},
    '/sobre/':{label:'Sobre', prompt:'Conheça o ateliê, a linguagem e a proposta artística.'},
    '/localizacao/':{label:'Localização', prompt:'Veja como chegar ao ateliê em Salvador.'},
    '/contato/':{label:'Contato', prompt:'Entre em contato e envie sua ideia.'}
  };

  const addStickyCta = () => {
    if (document.querySelector('[data-sticky-cta]')) return;
    const dock = document.createElement('div');
    dock.className = 'sticky-cta';
    dock.dataset.stickyCta = 'true';
    dock.setAttribute('aria-label', 'Ações rápidas do Studio 23');

    const portfolio = document.createElement('a');
    portfolio.href = '/portfolio/';
    portfolio.textContent = 'Portfólio';

    const agendar = document.createElement('a');
    agendar.href = '/agendar/';
    agendar.className = 'primary';
    agendar.textContent = 'Agendar';

    dock.append(portfolio, agendar);
    document.body.appendChild(dock);
  };

  const highlightCurrentNav = () => {
    const nav = document.querySelector('#primary-nav');
    if (!nav) return;
    const current = window.location.pathname.replace(/\/$/, '') || '/';
    nav.querySelectorAll('a').forEach((link) => {
      const href = (link.getAttribute('href') || '').replace(/\/$/, '');
      if ((current === '/' && href === '') || href === current) {
        link.classList.add('current');
        link.setAttribute('aria-current', 'page');
      }
    });
  };

  const setupWhatsAppForms = () => {
    const forms = document.querySelectorAll('#brief-form, form[data-brief], form[data-cta-form]');
    forms.forEach((form) => {
      if (form.dataset.studio23Bound === 'true') return;
      form.dataset.studio23Bound = 'true';
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const place = data.get('local') || data.get('atendimento') || 'presencial';
        const idea = data.get('ideia') || data.get('idea') || 'Quero começar um projeto';
        const message = `Olá, vim pelo site do Tattoo Studio 23. Preferência de atendimento: ${place}. Minha ideia: ${idea}`;
        window.location.href = 'https://wa.me/5571994091575?text=' + encodeURIComponent(message);
      });
    });
  };

  const setupHarumAi = () => {
    const existing = document.querySelector('[data-harum-ai]');
    if (existing) return;

    const route = routeMeta[window.location.pathname] || {label:'Página atual', prompt:'Use o site para entender melhor o fluxo do estúdio.'};

    const aiKnowledge = {
      intro: 'Olá! Sou o assistente do Studio 23. Posso te ajudar com estilo, processo, portfólio e agendamento.',
      quick: ['Quero uma tatuagem minimalista','Como funciona o agendamento?','Qual estilo combina comigo?','Mostre o portfólio','Preciso de uma referência'],
      styles: {
        minimalista: 'Minimalista: traço limpo, leitura rápida e presença elegante. Funciona muito bem em áreas delicadas e peças com intenção mais discreta.',
        floral: 'Floral: ornamento, movimento, volume e presença botânica. É uma direção rica para criar peças marcantes e sensíveis.',
        blackwork: 'Blackwork: contraste intenso, peso visual e grafismo. Fica muito forte em peças com identidade marcante.',
        realista: 'Realista: detalhe, volume e linguagem mais teatral. Ideal para temas com profundidade, anatomia e cenas fortes.',
        ornamental: 'Ornamental: simetria, padrões e presença decorativa. Excelente quando a arte precisa comunicar movimento, ritual e elegância.',
        fine_line: 'Fine line: delicadeza, traço fino e leitura leve. Tem um caráter moderno e sofisticado.'
      }
    };

    const addMessage = (text, type = 'bot') => {
      const el = document.createElement('div');
      el.className = 'harum-ai-message ' + type;
      el.textContent = text;
      return el;
    };

    const detectStyle = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes('minimal') || lower.includes('fine line') || lower.includes('fineline')) return aiKnowledge.styles.fine_line;
      if (lower.includes('floral') || lower.includes('botan') || lower.includes('flor')) return aiKnowledge.styles.floral;
      if (lower.includes('blackwork') || lower.includes('preto') || lower.includes('grafite')) return aiKnowledge.styles.blackwork;
      if (lower.includes('realist') || lower.includes('detal') || lower.includes('anatom')) return aiKnowledge.styles.realista;
      if (lower.includes('ornamen') || lower.includes('padr')) return aiKnowledge.styles.ornamental;
      return null;
    };

    const answer = (question) => {
      const value = (question || '').trim();
      if (!value) return 'Claro. Me diga o que você imagina ou escolha uma opção abaixo.';
      const low = value.toLowerCase();
      const context = `Você está em ${route.label}. ${route.prompt}`;

      if (low.includes('agendar') || low.includes('como funciona') || low.includes('processo') || low.includes('atendimento')) {
        return `${context} O processo começa com uma conversa inicial: você conta a ideia, referências e o que deseja sentir no corpo. Depois, o estúdio orienta estilo, posição e viabilidade do projeto e você pode seguir para o WhatsApp para fechar a conversa.`;
      }
      if (low.includes('portifolio') || low.includes('portfolio') || low.includes('trabalhos')) {
        return `${context} Você pode navegar pelo portfólio do Studio 23 e pela Biblioteca Harum Noir para entender melhor a linguagem visual e a variedade de estilos dentro do ateliê.`;
      }
      if (low.includes('faq') || low.includes('duvida') || low.includes('dúvida') || low.includes('perguntas')) {
        return `${context} A área de FAQ responde dúvidas práticas sobre projeto, estética e comportamento antes e depois da sessão. É a melhor primeira parada antes de agendar.`;
      }
      if (low.includes('cuidados') || low.includes('pós') || low.includes('pos')) {
        return `${context} A etapa de cuidados é essencial para a cicatrização e preservação do trabalho. A orientação correta ajuda a manter a peça nítida e segura no processo.`;
      }
      if (low.includes('estilo') || low.includes('combina') || low.includes('refe') || low.includes('refer')) {
        const style = detectStyle(low);
        if (style) return `${context} ${style} Se quiser, você pode me contar mais sobre a peça que imagina e eu te direciono para a melhor proposta.`;
        return `${context} A melhor direção depende do corpo, do tema, da intenção e do nível de detalhe. Minimalista, floral, blackwork, ornamental e realista são caminhos muito comuns no ateliê.`;
      }
      if (low.includes('ola') || low.includes('oi') || low.includes('hello')) return aiKnowledge.intro;
      if (low.includes('valor') || low.includes('preço') || low.includes('preco') || low.includes('orcamento')) {
        return `${context} O valor depende de tamanho, traço, complexidade, técnica e tempo de execução. O melhor é compartilhar a ideia e a referência para ter uma conversa mais precisa.`;
      }
      if (low.includes('whatsapp') || low.includes('contato') || low.includes('falar')) {
        return `${context} Você pode abrir conversa direta com o estúdio pelo WhatsApp para levar a ideia, a referência e os detalhes do projeto.`;
      }
      if (low.includes('sobre') || low.includes('studio') || low.includes('arte harum')) {
        return `${context} O Studio 23 e a Arte Harum conectam tatuagem autoral, estudos visuais e processo de criação. O foco está em fazer a arte funcionar como identidade, memória e presença.`;
      }
      const style = detectStyle(low);
      if (style) return `${context} ${style} Se quiser, posso te ajudar a transformar isso em uma proposta de projeto mais clara e objetiva.`;
      return `${context} Posso te ajudar a navegar pelo portfólio, entender o processo, escolher um estilo e te direcionar para o agendamento. Conte-me um pouco da sua ideia e eu te retorno com uma direção melhor.`;
    };

    const panel = document.createElement('aside');
    panel.className = 'harum-ai-panel';
    panel.dataset.harumAi = 'true';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Assistente do Studio 23');

    const head = document.createElement('div');
    head.className = 'harum-ai-header';
    head.innerHTML = '<div><span>Harum AI</span><strong>Studio 23</strong></div><button type="button" class="harum-ai-close" aria-label="Fechar assistente">×</button>';

    const messages = document.createElement('div');
    messages.className = 'harum-ai-messages';
    messages.setAttribute('aria-live', 'polite');
    messages.appendChild(addMessage(aiKnowledge.intro));

    const quick = document.createElement('div');
    quick.className = 'harum-ai-quick';
    aiKnowledge.quick.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'harum-ai-chip';
      button.textContent = item;
      button.addEventListener('click', () => {
        const input = panel.querySelector('.harum-ai-form input');
        if (!input) return;
        input.value = item;
        panel.querySelector('.harum-ai-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      });
      quick.appendChild(button);
    });

    const contextLinks = document.createElement('div');
    contextLinks.className = 'harum-context-links';
    [['/portfolio/','Portfólio'], ['/biblioteca/','Biblioteca'], ['/agendar/','Agendar'], ['/faq/','FAQ']].forEach(([href, label]) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      contextLinks.appendChild(a);
    });

    const form = document.createElement('form');
    form.className = 'harum-ai-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Pergunte sobre o projeto...';
    input.setAttribute('aria-label', 'Digite sua pergunta');
    const send = document.createElement('button');
    send.type = 'submit';
    send.textContent = 'Enviar';
    form.append(input, send);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      messages.appendChild(addMessage(question, 'user'));
      input.value = '';
      window.setTimeout(() => {
        messages.appendChild(addMessage(answer(question)));
        messages.scrollTop = messages.scrollHeight;
      }, 180);
    });

    panel.append(head, messages, quick, contextLinks, form);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'harum-ai-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'harum-ai-panel');
    toggle.innerHTML = '<span>Harum AI</span>';

    const close = () => {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      input.focus();
    };

    toggle.addEventListener('click', () => (panel.hidden ? open() : close()));
    head.querySelector('.harum-ai-close').addEventListener('click', close);

    document.body.appendChild(panel);
    document.body.appendChild(toggle);
  };

  document.addEventListener('DOMContentLoaded', () => {
    addStickyCta();
    highlightCurrentNav();
    setupWhatsAppForms();
    setupHarumAi();

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    const menu = document.querySelector('.menu');
    const nav = document.querySelector('#primary-nav');
    const closeMenu = () => {
      if (!nav || !menu) return;
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    };
    if (menu && nav) {
      menu.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', String(open));
      });
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });
    }
  });
})();
