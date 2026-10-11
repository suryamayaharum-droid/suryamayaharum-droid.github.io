
const year=document.getElementById('year');
if(year) year.textContent=new Date().getFullYear();

const menu=document.querySelector('.menu');
const nav=document.querySelector('#primary-nav');
const closeMenu=()=>{if(!nav||!menu)return;nav.classList.remove('open');menu.setAttribute('aria-expanded','false')};
if(menu&&nav){
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
}

const form=document.querySelector('#brief-form');
if(form)form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(form);
  const place=data.get('local')||'presencial';
  const idea=data.get('ideia')||'';
  const message=`Olá, vim pelo site do Tattoo Studio 23. Preferência de atendimento: ${place}. Minha ideia: ${idea}`;
  location.href='https://wa.me/5571994091575?text='+encodeURIComponent(message);
});

const railSelector='[data-rail-scroller], .discovery-rail, .carousel, .gallery-grid, .pdf-grid, .catalog-grid, .noir-grid';
document.querySelectorAll(railSelector).forEach((box,railIndex)=>{
  if(box.dataset.railReady==='true')return;
  box.dataset.railReady='true';
  const collection=box.closest('[data-carousel]');
  let prev=collection?.querySelector('[data-rail-prev], [data-prev]');
  let next=collection?.querySelector('[data-rail-next], [data-next]');
  let controls=prev?.closest('.carousel-nav')||next?.closest('.carousel-nav')||null;
  if(!prev||!next){
    controls=document.createElement('div');
    controls.className='rail-controls';
    controls.setAttribute('aria-label','Controles da prateleira');
    prev=document.createElement('button');
    next=document.createElement('button');
    prev.type='button'; next.type='button';
    prev.textContent='←'; next.textContent='→';
    prev.setAttribute('aria-label','Itens anteriores');
    next.setAttribute('aria-label','Próximos itens');
    controls.append(prev,next);
    box.parentNode.insertBefore(controls,box);
  }
  const id=box.id||`visual-rail-${railIndex+1}`;
  box.id=id;
  box.setAttribute('role','region');
  if(!box.getAttribute('aria-label'))box.setAttribute('aria-label','Coleção visual — deslize para explorar');
  prev.setAttribute('aria-controls',id); next.setAttribute('aria-controls',id);
  const step=()=>{
    const first=box.firstElementChild;
    const gap=parseFloat(getComputedStyle(box).columnGap||getComputedStyle(box).gap||'16')||16;
    return Math.max(box.clientWidth*.82,(first?.getBoundingClientRect().width||0)+gap);
  };
  const sync=()=>{
    const overflow=box.scrollWidth>box.clientWidth+2;
    if(controls)controls.hidden=!overflow;
    prev.disabled=!overflow||box.scrollLeft<=2;
    next.disabled=!overflow||box.scrollLeft+box.clientWidth>=box.scrollWidth-2;
  };
  prev.addEventListener('click',()=>box.scrollBy({left:-step(),behavior:'smooth'}));
  next.addEventListener('click',()=>box.scrollBy({left:step(),behavior:'smooth'}));
  box.addEventListener('scroll',sync,{passive:true});
  box.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();box.scrollBy({left:-step(),behavior:'smooth'});}
    if(event.key==='ArrowRight'){event.preventDefault();box.scrollBy({left:step(),behavior:'smooth'});}
  });
  window.addEventListener('resize',sync,{passive:true});
  sync();
});

document.querySelectorAll('[data-catalog]').forEach(catalog=>{
  const buttons=[...catalog.querySelectorAll('[data-filter]')];
  const cards=[...catalog.querySelectorAll('.catalog-card')];
  const empty=catalog.querySelector('.catalog-empty');
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    let visible=0;
    cards.forEach(card=>{
      const show=filter==='todos'||card.dataset.styles.split(' ').includes(filter);
      card.hidden=!show;
      if(show)visible++;
    });
    const rail=catalog.querySelector('[data-rail-scroller]');
    if(rail){rail.scrollLeft=0;rail.dispatchEvent(new Event('scroll'));}
    empty?.classList.toggle('show',visible===0);
  }));
});

document.querySelectorAll('[data-sound-toggle]').forEach(button=>button.addEventListener('click',()=>{
  const video=document.getElementById(button.dataset.soundToggle);
  if(!video)return;
  video.muted=!video.muted;
  if(!video.muted) video.play().catch(()=>{});
  button.setAttribute('aria-pressed',String(!video.muted));
  button.textContent=video.muted?'Ouvir ambiente':'Silenciar ambiente';
}));

const libraryRoot=document.querySelector('[data-library]');
if(libraryRoot){
  const manifestNode=libraryRoot.querySelector('#library-manifest');
  const manifest=manifestNode?JSON.parse(manifestNode.textContent):null;
  const grid=libraryRoot.querySelector('[data-library-grid]');
  const status=libraryRoot.querySelector('[data-library-status]');
  const more=libraryRoot.querySelector('[data-library-more]');
  const sentinel=libraryRoot.querySelector('[data-library-sentinel]');
  const end=libraryRoot.querySelector('[data-library-end]');
  const filters=[...libraryRoot.querySelectorAll('[data-library-filter]')];
  const dialog=libraryRoot.querySelector('[data-library-dialog]');
  const viewerImage=libraryRoot.querySelector('[data-viewer-image]');
  const viewerTitle=libraryRoot.querySelector('[data-viewer-title]');
  const viewerKind=libraryRoot.querySelector('[data-viewer-kind]');
  const viewerDescription=libraryRoot.querySelector('[data-viewer-description]');
  if(manifest&&grid){
    let active=new URLSearchParams(location.search).get('categoria')||'todos';
    if(active!=='todos'&&!manifest.categories.some(item=>item.id===active))active='todos';
    let visibleItems=[];
    let cursor=0;
    let selected=0;
    let lastFocused=null;
    const batch=manifest.batchSize||24;
    const makeCard=(item,index)=>{
      const button=document.createElement('button');
      button.className='library-card';
      button.type='button';
      button.dataset.libraryIndex=String(index);
      button.setAttribute('aria-label','Abrir '+item.title);
      const media=document.createElement('span');
      media.className='library-media';
      const img=document.createElement('img');
      img.src=item.src;
      img.alt=item.alt;
      if(item.srcset)img.srcset=item.srcset;
      img.sizes='(max-width: 420px) 100vw, (max-width: 700px) 50vw, (max-width: 1000px) 33vw, 25vw';
      if(item.width)img.width=item.width;
      if(item.height)img.height=item.height;
      img.loading='lazy';
      img.decoding='async';
      media.append(img);
      const meta=document.createElement('span');
      meta.className='library-meta';
      const kind=document.createElement('span');
      kind.textContent=item.kind;
      const title=document.createElement('strong');
      title.textContent=item.title;
      const category=document.createElement('small');
      category.textContent=(item.categoryLabels||[item.categoryLabel]).join(' · ');
      meta.append(kind,title,category);
      button.append(media,meta);
      button.addEventListener('click',()=>openViewer(index));
      return button;
    };
    const updateStatus=()=>{
      if(status){
        const count=visibleItems.length;
        const noun=count===1?'imagem':'imagens';
        status.textContent=String(Math.min(cursor,count))+' de '+String(count)+' '+noun+' nesta coleção';
      }
      if(more)more.hidden=cursor>=visibleItems.length;
      if(end)end.hidden=visibleItems.length===0||cursor<visibleItems.length;
    };
    const appendBatch=()=>{
      if(cursor>=visibleItems.length)return;
      const start=cursor;
      const fragment=document.createDocumentFragment();
      visibleItems.slice(start,start+batch).forEach((item,offset)=>fragment.append(makeCard(item,start+offset)));
      grid.append(fragment);
      cursor=Math.min(start+batch,visibleItems.length);
      updateStatus();
    };
    const setFilter=(value,updateUrl=true)=>{
      active=value;
      visibleItems=active==='todos'?manifest.items:manifest.items.filter(item=>(item.categories||[item.category]).includes(active));
      filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.libraryFilter===active)));
      grid.replaceChildren();
      cursor=0;
      if(updateUrl){
        const query=active==='todos'?'':'?categoria='+encodeURIComponent(active);
        history.replaceState(null,'',location.pathname+query);
      }
      appendBatch();
    };
    const showViewer=()=>{
      const item=visibleItems[selected];
      if(!item)return;
      viewerImage.src=item.src;
      viewerImage.alt=item.alt;
      viewerImage.loading='eager';
      viewerImage.decoding='async';
      viewerImage.fetchPriority='high';
      viewerTitle.textContent=item.title;
      viewerKind.textContent=item.kind;
      viewerDescription.textContent=item.alt;
    };
    function openViewer(index){
      selected=index;
      lastFocused=document.activeElement;
      showViewer();
      if(dialog&&dialog.showModal)dialog.showModal();
      else if(dialog)dialog.setAttribute('open','');
    }
    const moveViewer=step=>{
      if(!visibleItems.length)return;
      selected=(selected+step+visibleItems.length)%visibleItems.length;
      showViewer();
    };
    filters.forEach(button=>button.addEventListener('click',()=>setFilter(button.dataset.libraryFilter)));
    more?.addEventListener('click',appendBatch);
    const closeViewer=()=>{
      if(!dialog)return;
      if(typeof dialog.close==='function' && dialog.open)dialog.close();
      else{
        dialog.removeAttribute('open');
        if(lastFocused&&document.contains(lastFocused))lastFocused.focus();
      }
    };
    libraryRoot.querySelector('[data-viewer-close]')?.addEventListener('click',closeViewer);
    libraryRoot.querySelector('[data-viewer-prev]')?.addEventListener('click',()=>moveViewer(-1));
    libraryRoot.querySelector('[data-viewer-next]')?.addEventListener('click',()=>moveViewer(1));
    dialog?.addEventListener('close',()=>{if(lastFocused&&document.contains(lastFocused))lastFocused.focus();});
    dialog?.addEventListener('click',event=>{if(event.target===dialog)closeViewer()});
    document.addEventListener('keydown',event=>{
      if(!dialog?.open)return;
      if(event.key==='ArrowLeft')moveViewer(-1);
      if(event.key==='ArrowRight')moveViewer(1);
    });
    if('IntersectionObserver'in window&&sentinel){
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting))appendBatch();
      },{rootMargin:'850px 0px'});
      observer.observe(sentinel);
    }
    window.addEventListener('popstate',()=>{
      const requested=new URLSearchParams(location.search).get('categoria')||'todos';
      const valid=requested==='todos'||manifest.categories.some(item=>item.id===requested);
      setFilter(valid?requested:'todos',false);
    });
    setFilter(active,false);
  }
}

(function(){
  const aiKnowledge = {
    brand: 'Studio 23 / Arte Harum',
    city: 'Salvador',
    intro: 'Olá! Sou o assistente do Studio 23. Posso te ajudar com estilo, processo, portfólio, FAQ e agendamento.',
    quick: [
      'Quero uma tatuagem minimalista',
      'Como funciona o agendamento?',
      'Qual estilo combina comigo?',
      'Mostre o portfólio',
      'Preciso de uma referência'
    ],
    styles: {
      minimalista: 'Minimalista: traço limpo, leitura rápida e presença elegante. Funciona muito bem em áreas delicadas e peças com intenção mais discreta.',
      floral: 'Floral: ornamento, movimento, volume e presença botânica. É uma direção rica para criar peças marcantes e sensíveis.',
      blackwork: 'Blackwork: contraste intenso, peso visual e grafismo. Fica muito forte em peças com identidade mais marcante.',
      realista: 'Realista: detalhe, volume e linguagem mais teatral. Ideal para temas com profundidade, anatomia e cenas fortes.',
      ornamental: 'Ornamental: simetria, padrões e presença decorativa. Excelente quando a arte precisa comunicar movimento, ritual e elegância.',
      fine_line: 'Fine line: delicadeza, traço fino e leitura leve. Tem um caráter moderno e sofisticado.'
    }
  };

  function addMessage(text, type='bot') {
    const el=document.createElement('div');
    el.className='harum-ai-message '+type;
    el.textContent=text;
    return el;
  }

  function detectStyle(text) {
    const lower=text.toLowerCase();
    if(lower.includes('minimal')||lower.includes('fine line')||lower.includes('fineline')) return aiKnowledge.styles.fine_line;
    if(lower.includes('floral')||lower.includes('botan')||lower.includes('flor')) return aiKnowledge.styles.floral;
    if(lower.includes('blackwork')||lower.includes('preto')||lower.includes('grafite')) return aiKnowledge.styles.blackwork;
    if(lower.includes('realist')||lower.includes('detal')||lower.includes('anatom')) return aiKnowledge.styles.realista;
    if(lower.includes('ornamen')||lower.includes('padr')) return aiKnowledge.styles.ornamental;
    return null;
  }

  function answer(question) {
    const value=(question||'').trim();
    if(!value) return 'Claro. Me diga o que você imagina ou escolha uma opção abaixo.';
    const lower=value.toLowerCase();

    if(lower.includes('agendar')||lower.includes('como funciona')||lower.includes('processo')||lower.includes('atendimento')){
      return 'O processo começa com uma conversa inicial: você conta a ideia, referências e o que deseja sentir no corpo. Depois, o estúdio orienta estilo, posição e viabilidade do projeto, e você pode seguir para o WhatsApp para fechar a conversa.';
    }
    if(lower.includes('portifolio')||lower.includes('portfólio')||lower.includes('trabalhos')||lower.includes('portfolio')){
      return 'Você pode navegar pelo portfólio do Studio 23 e pela Biblioteca Harum Noir para entender melhor a linguagem visual e a variedade de estilos dentro do ateliê.';
    }
    if(lower.includes('faq')||lower.includes('duvida')||lower.includes('dúvida')||lower.includes('perguntas')){
      return 'A área de FAQ responde dúvidas práticas sobre projeto, critérios, estética e comportamento antes e depois da sessão. É a melhor primeira parada antes de agendar.';
    }
    if(lower.includes('cuidados')||lower.includes('pos')||lower.includes('pós')){
      return 'A etapa de cuidados é essencial para a cicatrização e preservação do trabalho. A orientação correta ajuda a manter a peça nítida e segura no processo.';
    }
    if(lower.includes('salvador')||lower.includes('local')||lower.includes('onde')){
      return 'O Studio 23 está em Salvador e trabalha entre tatuagem autoral, estudos visuais e um processo mais cuidadoso de criação e atendimento.';
    }
    if(lower.includes('estilo')||lower.includes('combina')||lower.includes('refe')||lower.includes('refer')){
      const style=detectStyle(lower);
      if(style) return style + ' Se quiser, você pode me contar mais sobre a peça que imagina e eu te direciono para a melhor proposta.';
      return 'A melhor direção depende do corpo, do tema, da intenção e do nível de detalhe que você quer. Minimalista, floral, blackwork, ornamental e realista são caminhos muito comuns no ateliê.';
    }
    if(lower.includes('ola')||lower.includes('oi')||lower.includes('hello')) return aiKnowledge.intro;
    if(lower.includes('valor')||lower.includes('preço')||lower.includes('preco')||lower.includes('orcamento')){
      return 'O valor depende de tamanho, traço, complexidade, técnica e tempo de execução. O melhor é compartilhar a ideia e a referência para ter uma conversa mais precisa.';
    }
    if(lower.includes('whatsapp')||lower.includes('contato')||lower.includes('falar')){
      return 'Você pode abrir conversa direta com o estúdio pelo WhatsApp para levar a ideia, a referência e os detalhes do projeto.';
    }
    if(lower.includes('sobre')||lower.includes('studio')||lower.includes('arte harum')){
      return 'O Studio 23 e a Arte Harum conectam tatuagem autoral, estudos visuais e processo de criação. O foco está em fazer a arte funcionar como identidade, memória e presença.';
    }

    const style=detectStyle(lower);
    if(style) return style + ' Se quiser, posso te ajudar a transformar isso em uma proposta de projeto mais clara e objetiva.';
    return 'Posso te ajudar a navegar pelo portfólio, entender o processo, escolher um estilo e te direcionar para o agendamento. Conte-me um pouco da sua ideia e eu te retorno com uma direção melhor.';
  }

  const existing=document.querySelector('[data-harum-ai]');
  if(existing) return;

  const panel=document.createElement('aside');
  panel.className='harum-ai-panel';
  panel.dataset.harumAi='true';
  panel.hidden=true;
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Assistente do Studio 23');

  const head=document.createElement('div');
  head.className='harum-ai-header';
  head.innerHTML='<div><span>Harum AI</span><strong>Studio 23</strong></div><button type="button" class="harum-ai-close" aria-label="Fechar assistente">×</button>';

  const messages=document.createElement('div');
  messages.className='harum-ai-messages';
  messages.setAttribute('aria-live','polite');
  messages.appendChild(addMessage(aiKnowledge.intro));

  const quick=document.createElement('div');
  quick.className='harum-ai-quick';
  aiKnowledge.quick.forEach(item=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='harum-ai-chip';
    button.textContent=item;
    button.addEventListener('click',()=>{
      const form = panel.querySelector('.harum-ai-form');
      const input = form && form.querySelector('input');
      if(!input) return;
      input.value = item;
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    quick.appendChild(button);
  });

  const form=document.createElement('form');
  form.className='harum-ai-form';
  const input=document.createElement('input');
  input.type='text';
  input.placeholder='Pergunte sobre o projeto...';
  input.setAttribute('aria-label','Digite sua pergunta');
  const send=document.createElement('button');
  send.type='submit';
  send.textContent='Enviar';
  form.append(input, send);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const question=input.value.trim();
    if(!question) return;
    messages.appendChild(addMessage(question,'user'));
    input.value='';
    window.setTimeout(()=>{
      messages.appendChild(addMessage(answer(question)));
      messages.scrollTop=messages.scrollHeight;
    },180);
  });

  panel.append(head, messages, quick, form);

  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='harum-ai-toggle';
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls','harum-ai-panel');
  toggle.innerHTML='<span>Harum AI</span>';

  const close=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false');};
  const open=()=>{panel.hidden=false;toggle.setAttribute('aria-expanded','true');input.focus();};
  toggle.addEventListener('click',()=> panel.hidden ? open() : close());
  head.querySelector('.harum-ai-close').addEventListener('click',close);

  document.body.appendChild(panel);
  document.body.appendChild(toggle);
  messages.scrollTop=messages.scrollHeight;
})();

window.addEventListener('load',()=>{
  const forms=document.querySelectorAll('#brief-form, form[data-brief]');
  forms.forEach(form=>{
    if(form.dataset.harumReady==='true') return;
    form.dataset.harumReady='true';
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const data=new FormData(form);
      const place=data.get('local')||'presencial';
      const idea=data.get('ideia')||data.get('idea')||'Quero começar um projeto';
      const text=`Olá, vim pelo site do Studio 23. Preferência de atendimento: ${place}. Minha ideia: ${idea}`;
      window.location.href='https://wa.me/5571994091575?text='+encodeURIComponent(text);
    });
  });
});

