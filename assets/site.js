
const year=document.getElementById('year');
if(year) year.textContent=new Date().getFullYear();

const menu=document.querySelector('.menu');
const nav=document.querySelector('#primary-nav');
const closeMenu=()=>{if(!nav||!menu)return;nav.classList.remove('open');menu.setAttribute('aria-expanded','false')};
if(menu&&nav){
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open))});
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
}

const form=document.querySelector('#brief-form');
if(form)form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(form);
  const place=data.get('local'), idea=data.get('ideia')||'';
  const message=`Olá, vim pelo site do Tattoo Studio 23. Preferência de atendimento: ${place}. Minha ideia: ${idea}`;
  location.href='https://wa.me/5571994091575?text='+encodeURIComponent(message);
});

const railScrollBehavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
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
  prev.addEventListener('click',()=>box.scrollBy({left:-step(),behavior:railScrollBehavior}));
  next.addEventListener('click',()=>box.scrollBy({left:step(),behavior:railScrollBehavior}));
  box.addEventListener('scroll',sync,{passive:true});
  box.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();box.scrollBy({left:-step(),behavior:railScrollBehavior});}
    if(event.key==='ArrowRight'){event.preventDefault();box.scrollBy({left:step(),behavior:railScrollBehavior});}
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
  const roomKicker=libraryRoot.querySelector('[data-library-room-kicker]');
  const roomTitle=libraryRoot.querySelector('[data-library-room-title]');
  const roomDescription=libraryRoot.querySelector('[data-library-room-description]');
  const roomAll=libraryRoot.querySelector('[data-library-room-all]');
  const related=libraryRoot.querySelector('[data-library-related]');
  const copyLink=libraryRoot.querySelector('[data-library-copy-link]');
  const copyStatus=libraryRoot.querySelector('[data-library-copy-status]');
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
    const updateRoom=()=>{
      const category=active==='todos'?null:manifest.categories.find(item=>item.id===active);
      if(roomKicker)roomKicker.textContent=category?(category.count<5?'Estudo em expansão':'Coleção Harum Noir'):(manifest.total+' imagens únicas · '+manifest.categories.length+' categorias');
      if(roomTitle)roomTitle.textContent=category?category.label:'Todas as categorias';
      if(roomDescription)roomDescription.textContent=category?category.description:'Explore o acervo inteiro ou entre em uma linguagem específica.';
      if(roomAll)roomAll.hidden=active==='todos';
      document.title=category?(category.label+' — Biblioteca Harum Noir | Arte Harum'):'Biblioteca Harum Noir — '+manifest.total+' imagens em '+manifest.categories.length+' categorias | Arte Harum';
      if(related){
        related.replaceChildren();
        const scores=new Map();
        if(category){
          visibleItems.forEach(item=>(item.categories||[item.category]).forEach(id=>{if(id!==active)scores.set(id,(scores.get(id)||0)+1);}));
        }
        const choices=manifest.categories.filter(item=>item.id!==active).sort((a,b)=>(scores.get(b.id)||0)-(scores.get(a.id)||0)||b.count-a.count).slice(0,5);
        choices.forEach(item=>{
          const link=document.createElement('a');
          link.href='/biblioteca/?categoria='+encodeURIComponent(item.id);
          link.textContent=item.label;
          link.addEventListener('click',event=>{event.preventDefault();setFilter(item.id,true);});
          related.append(link);
        });
      }
    };
    const setFilter=(value,updateUrl=true)=>{
      active=value;
      visibleItems=active==='todos'?manifest.items:manifest.items.filter(item=>(item.categories||[item.category]).includes(active));
      filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.libraryFilter===active)));
      grid.replaceChildren();
      cursor=0;
      if(updateUrl){
        const query=active==='todos'?'':'?categoria='+encodeURIComponent(active);
        history.pushState(null,'',location.pathname+query);
      }
      updateRoom();
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
    roomAll?.addEventListener('click',event=>{event.preventDefault();setFilter('todos',true);});
    copyLink?.addEventListener('click',async()=>{
      const value=location.href;
      let copied=false;
      try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true;}}catch{}
      if(!copied){
        const field=document.createElement('textarea');field.value=value;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();
        try{copied=document.execCommand('copy');}catch{}
        field.remove();
      }
      if(copyStatus)copyStatus.textContent=copied?'Link da coleção copiado.':'Não foi possível copiar automaticamente.';
    });
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



// Lume is a quiet, opt-in guide. Navigation remains deterministic and
// allow-listed even when an AI endpoint is enabled.
const guide=document.querySelector('#harum-guide-dialog');
const guideLauncher=document.querySelector('[data-guide-open]');
if(guide&&guideLauncher){
  const guideClose=guide.querySelector('[data-guide-close]');
  const guideInput=guide.querySelector('[data-guide-input]');
  const guideForm=guide.querySelector('[data-guide-form]');
  const guideMessages=guide.querySelector('[data-guide-messages]');
  const guideMode=guide.querySelector('[data-guide-mode]');
  const guideEndpoint=guide.dataset.guideEndpoint||'';
  const guideRoutes=new Set(['/','/sobre/','/servicos/','/portfolio/','/harum-noir/','/harum-noir/modelo-vivo/','/harum-noir/modelo-vivo/diario/','/harum-noir/modelo-vivo/recentes/','/biblioteca/','/agendar/','/cuidados/','/localizacao/','/contato/','/faq/','/privacidade/']);
  const guideCategoryRoutes=new Set([
    '/biblioteca/?categoria=selecao','/biblioteca/?categoria=figura','/biblioteca/?categoria=maos',
    '/biblioteca/?categoria=olhos','/biblioteca/?categoria=rosto','/biblioteca/?categoria=expressoes',
    '/biblioteca/?categoria=nariz','/biblioteca/?categoria=boca','/biblioteca/?categoria=pranchas',
    '/biblioteca/?categoria=narrativas','/biblioteca/?categoria=editorial','/biblioteca/?categoria=fantasia-oriental',
    '/biblioteca/?categoria=passaros','/biblioteca/?categoria=propostas','/biblioteca/?categoria=releituras'
  ]);
  const guideExternalRoutes=new Set(['https://suryamayaharum-droid.github.io/astro-blog-starter-template/referencias/']);
  const currentPage=guideRoutes.has(location.pathname)?location.pathname:'/';
  const pageInfo={
    '/':{text:'Esta é a entrada do Studio 23 e Arte Harum, com acesso ao portfólio, ao universo Harum Noir e aos estudos recentes de poses.',actions:[['/harum-noir/modelo-vivo/recentes/','Estudos recentes de poses'],['/harum-noir/','Conhecer Harum Noir']]},
    '/sobre/':{text:'Esta página apresenta o ateliê e a relação entre desenho, pintura e tatuagem.',actions:[['/portfolio/','Explorar portfólio'],['/agendar/','Começar um projeto']]},
    '/servicos/':{text:'Aqui você encontra o contexto dos serviços e pode seguir para o início de um projeto.',actions:[['/agendar/','Abrir agendamento'],['/portfolio/','Ver portfólio']]},
    '/portfolio/':{text:'Aqui ficam tatuagens, projetos e estudos organizados com separação entre trabalhos realizados e material de estudo.',actions:[['/agendar/','Começar um projeto'],['/harum-noir/','Conhecer Harum Noir']]},
    '/harum-noir/':{text:'Esta é a porta editorial para desenho, carvão, observação e processo autoral.',actions:[['/harum-noir/modelo-vivo/recentes/','Estudos recentes de poses'],['https://suryamayaharum-droid.github.io/astro-blog-starter-template/referencias/','Abrir Atlas de artistas']]},
    '/harum-noir/modelo-vivo/':{text:'Esta página reúne 54 poses e uma coleção de estudos recentes; use o atalho para abrir as pranchas de gesto, apoio e anatomia.',actions:[['/harum-noir/modelo-vivo/recentes/','Abrir estudos recentes de poses'],['/harum-noir/','Voltar a HARUM NOIR']]},
    '/harum-noir/modelo-vivo/diario/':{text:'Dez cadernos de anatomia, balé, emoção e carvão, com um roteiro de 24 cenas da modelo viva.',actions:[['/harum-noir/modelo-vivo/','Ver 54 poses'],['/harum-noir/','Harum Noir']]},
    '/harum-noir/modelo-vivo/recentes/':{text:'Galeria completa com estudos de pose, colagens, referências fotográficas e status de importação atualizado.',actions:[['/harum-noir/modelo-vivo/','Caderno de modelo vivo'],['/biblioteca/','Biblioteca Harum Noir']]},
    '/biblioteca/':{text:'A Biblioteca reúne estudos e imagens por categoria, sem apresentar estudos como tatuagens executadas.',actions:[['/harum-noir/','Conhecer Harum Noir'],['/portfolio/','Ver portfólio']]},
    '/agendar/':{text:'Aqui você prepara o primeiro contato sobre um projeto; disponibilidade e local são confirmados pela equipe.',actions:[['/portfolio/','Ver portfólio'],['/faq/','Abrir FAQ']]},
    '/cuidados/':{text:'Esta página reúne orientações gerais de cuidado. Questões específicas devem ser confirmadas com a equipe.',actions:[['/contato/','Falar com a equipe'],['/faq/','Abrir FAQ']]},
    '/localizacao/':{text:'Aqui explicamos Paripe e Pituba sem expor o endereço privado antes do agendamento.',actions:[['/agendar/','Abrir agendamento'],['/contato/','Ver contato']]},
    '/contato/':{text:'Esta página reúne os canais oficiais do ecossistema.',actions:[['/agendar/','Abrir agendamento'],['/portfolio/','Explorar portfólio']]},
    '/faq/':{text:'Aqui ficam respostas frequentes sobre projeto, atendimento, localização e próximos passos.',actions:[['/agendar/','Abrir agendamento'],['/contato/','Falar com a equipe']]},
    '/privacidade/':{text:'Esta página explica como o contato é tratado e quais serviços externos são usados.',actions:[['/contato/','Ver canais oficiais'],['/faq/','Abrir FAQ']]}
  };
  if(guideMode)guideMode.textContent=guideEndpoint
    ?'Mapa e busca públicos são locais; IA responde apenas dúvidas abertas com navegação limitada.'
    :'Mapa, busca e navegação contextual funcionam localmente; a IA ainda não foi habilitada.';
  const openGuide=()=>{
    if(typeof guide.show==='function')guide.show();
    else guide.setAttribute('open','');
    guideInput?.focus();
  };
  const closeGuide=()=>{
    if(typeof guide.close==='function'&&guide.open)guide.close();
    else guide.removeAttribute('open');
    guideLauncher.focus();
  };
  guideLauncher.addEventListener('click',openGuide);
  guideClose?.addEventListener('click',closeGuide);
  guide.addEventListener('click',event=>{if(event.target===guide)closeGuide()});
  guide.addEventListener('close',()=>guideLauncher.focus());

  const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const makeActions=(pairs,limit=2)=>(pairs||[]).slice(0,limit).map(([href,label])=>({href,label}));
  const siteMapPairs=[
    ['/portfolio/','Portfólio'],['/harum-noir/','Harum Noir'],['/harum-noir/modelo-vivo/recentes/','Estudos recentes de poses'],['/biblioteca/','Biblioteca'],
    ['/agendar/','Agendar'],['/contato/','Contato']
  ];
  const searchIndex=[
    {keywords:['portfolio','tatuagem','tatuagens','trabalhos realizados','galeria'],action:['/portfolio/','Explorar portfólio']},
    {keywords:['harum noir','carvao','desenho autoral','processo autoral'],action:['/harum-noir/','Conhecer Harum Noir']},
    {keywords:['estudos recentes','estudo recente','estudos de pose','poses recentes','galeria de poses','poses','modelo vivo','modelo viva'],action:['/harum-noir/modelo-vivo/recentes/','Abrir estudos recentes de poses']},
    {keywords:['bale','anatomia','mãos da modelo','24 horas','diario da modelo'],action:['/harum-noir/modelo-vivo/diario/','Abrir diário de modelo vivo']},
    {keywords:['biblioteca','acervo','estudos','desenhos'],action:['/biblioteca/','Abrir biblioteca']},
    {keywords:['agendar','agendamento','marcar','sessao','horario'],action:['/agendar/','Abrir agendamento']},
    {keywords:['servicos','orcamento','preco','valor'],action:['/servicos/','Ver serviços']},
    {keywords:['localizacao','endereco','paripe','pituba'],action:['/localizacao/','Ver localização']},
    {keywords:['cuidados','cicatrizacao','aftercare','pos tatuagem'],action:['/cuidados/','Ler cuidados']},
    {keywords:['contato','whatsapp','instagram','youtube'],action:['/contato/','Ver canais oficiais']},
    {keywords:['faq','duvidas','perguntas frequentes'],action:['/faq/','Abrir FAQ']},
    {keywords:['atlas','artistas','referencias','inspiracao','videos de referencia'],action:['https://suryamayaharum-droid.github.io/astro-blog-starter-template/referencias/','Abrir Atlas de artistas']},
    {keywords:['selecao','principal','destaques'],action:['/biblioteca/?categoria=selecao','Seleção principal · 14']},
    {keywords:['figura','modelo','gesto','modelo vivo','corpo'],action:['/biblioteca/?categoria=figura','Figura, modelo e gesto · 50']},
    {keywords:['maos','mao','gesto das maos'],action:['/biblioteca/?categoria=maos','Mãos e gesto · 18']},
    {keywords:['olhos','olho','anatomia dos olhos','olhar'],action:['/biblioteca/?categoria=olhos','Olhos e anatomia · 15']},
    {keywords:['rosto','face','expressao facial'],action:['/biblioteca/?categoria=rosto','Rosto e expressão · 6']},
    {keywords:['expressoes','sombrio','sombrias','terror gotico'],action:['/biblioteca/?categoria=expressoes','Expressões sombrias · 19']},
    {keywords:['nariz','anatomia do nariz'],action:['/biblioteca/?categoria=nariz','Anatomia do nariz · 3']},
    {keywords:['boca','labios','lingua'],action:['/biblioteca/?categoria=boca','Boca, lábios e língua · 13']},
    {keywords:['pranchas','prancha','portfolio de desenho'],action:['/biblioteca/?categoria=pranchas','Pranchas de portfólio · 11']},
    {keywords:['narrativas','atelie','narrativas do atelie'],action:['/biblioteca/?categoria=narrativas','Narrativas do ateliê · 32']},
    {keywords:['editorial','identidade','branding'],action:['/biblioteca/?categoria=editorial','Editorial e identidade · 8']},
    {keywords:['fantasia oriental','tinta oriental','oriental'],action:['/biblioteca/?categoria=fantasia-oriental','Fantasia oriental em tinta · 4']},
    {keywords:['passaros','passaro','aves'],action:['/biblioteca/?categoria=passaros','Pássaros autorais · 2']},
    {keywords:['propostas','composicao','composicoes','projeto de tatuagem'],action:['/biblioteca/?categoria=propostas','Propostas de composição · 1']},
    {keywords:['releituras','personagens','anime autoral','reinterpretacoes'],action:['/biblioteca/?categoria=releituras','Releituras autorais · 4']}
  ];
  const searchLocalActions=value=>{
    const q=normalize(value);
    const tokens=q.split(/[^a-z0-9]+/).filter(token=>token.length>=3);
    const ranked=searchIndex.map((item,index)=>{
      let score=0;
      item.keywords.forEach(keyword=>{
        const normalizedKeyword=normalize(keyword);
        if(q.includes(normalizedKeyword))score+=normalizedKeyword.includes(' ')?6:4;
        const keywordTokens=normalizedKeyword.split(/[^a-z0-9]+/).filter(token=>token.length>=3);
        score+=keywordTokens.filter(token=>tokens.includes(token)).length;
      });
      return {index,score,action:item.action};
    }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);
    const seen=new Set(),pairs=[];
    ranked.forEach(item=>{
      if(pairs.length>=4||seen.has(item.action[0]))return;
      seen.add(item.action[0]);pairs.push(item.action);
    });
    return pairs.length?makeActions(pairs,4):makeActions([['/biblioteca/','Abrir biblioteca'],['/faq/','Abrir FAQ']]);
  };
  const defaultActions=()=>makeActions(pageInfo[currentPage]?.actions||[['/contato/','Falar com a equipe'],['/agendar/','Abrir agendamento']]);
  const localAnswer=value=>{
    const q=normalize(value);
    if(/esta pagina|onde estou|o que (tem|vejo) aqui|explica.*pagina/.test(q)){
      const info=pageInfo[currentPage]||pageInfo['/'];
      return {text:info.text,actions:makeActions(info.actions)};
    }
    if(/mapa do site|mapa.*site|quais (paginas|secoes)|navegacao do site|o que tem no site|mostrar.*site/.test(q))return {text:'Mapa público do ecossistema: Portfólio, Harum Noir, Estudos recentes, Biblioteca, Agendar e Contato.',actions:makeActions(siteMapPairs,6)};
    if(/buscar|procuro|procurar|encontrar|pesquisar|pesquisa|onde encontro|onde tem/.test(q)||/\b(maos?|olhos?|rosto|nariz|boca|labios?|lingua|expressoes?|passaros?|releituras?|pranchas?)\b/.test(q)||/fantasia oriental|modelo vivo|narrativas do atelie|propostas de composicao/.test(q))return {text:'Encontrei estes caminhos no índice público do site e da Biblioteca.',actions:searchLocalActions(q)};
    if(/agend|marc|horario|sessao|vaga/.test(q))return {text:'Para iniciar um projeto, acesse Agendar e conte sua ideia. A equipe confirma disponibilidade e local conforme a agenda.',actions:makeActions([['/agendar/','Abrir agendamento'],['/portfolio/','Ver portfólio']])};
    if(/valor|preco|orcament|custo/.test(q))return {text:'Os valores variam conforme tamanho e detalhes do projeto. Veja os serviços e fale com a equipe para receber uma orientação.',actions:makeActions([['/servicos/','Ver serviços'],['/contato/','Falar com a equipe']])};
    if(/local|endereco|onde|paripe|pituba/.test(q))return {text:'O ateliê privado fica em Paripe. Também há atendimento em outro estúdio na Pituba, conforme agenda. O endereço de Paripe é enviado após o agendamento.',actions:makeActions([['/localizacao/','Ver localização'],['/agendar/','Abrir agendamento']])};
    if(/cuidad|cicatriz|cicatriza|pos.tatu|aftercare/.test(q))return {text:'As orientações gerais estão na página de Cuidados. Para uma reação ou dúvida específica, fale com a equipe de tatuagem.',actions:makeActions([['/cuidados/','Ler cuidados'],['/contato/','Falar com a equipe']])};
    if(/portfolio|tatuagem|tatuar|trabalho|galeria/.test(q))return {text:'Explore o portfólio. Tatuagens realizadas aparecem separadas de estudos e propostas artísticas.',actions:makeActions([['/portfolio/','Explorar portfólio'],['/harum-noir/','Conhecer Harum Noir']])};
    if(/atlas|artista|referencia|inspiracao|video.*referencia|referencia.*video/.test(q))return {text:'O Atlas Harum Noir reúne artistas, desenho, carvão, gesto e vídeos da fonte original para estudo.',actions:makeActions([['https://suryamayaharum-droid.github.io/astro-blog-starter-template/referencias/','Abrir Atlas de artistas'],['/harum-noir/','Conhecer Harum Noir']])};
    if(/biblioteca|harum noir|noir|acervo|estudo|desenho|carvao/.test(q))return {text:'A Biblioteca reúne estudos e imagens por tema. Harum Noir é o selo editorial de desenho, carvão e processo autoral.',actions:makeActions([['/biblioteca/','Abrir biblioteca'],['/harum-noir/','Conhecer Harum Noir']])};
    return {text:'Posso explicar esta página e orientar sobre agendamento, serviços, localização, cuidados, portfólio e biblioteca.',actions:defaultActions()};
  };

  const sanitizeActions=value=>{
    if(!Array.isArray(value))return [];
    return value.slice(0,6).flatMap(action=>{
      if(!action||typeof action.href!=='string'||typeof action.label!=='string')return [];
      if(!guideRoutes.has(action.href)&&!guideCategoryRoutes.has(action.href)&&!guideExternalRoutes.has(action.href))return [];
      return [{href:action.href,label:action.label.trim().slice(0,70)||'Continuar'}];
    });
  };
  const addMessage=(text,actions=[])=>{
    if(!guideMessages)return;
    const item=document.createElement('div');
    item.className='host-answer';
    const paragraph=document.createElement('p');
    paragraph.textContent=text;
    item.append(paragraph);
    sanitizeActions(actions).forEach(action=>{
      const link=document.createElement('a');
      link.href=action.href;
      link.textContent=action.label;
      if(guideExternalRoutes.has(action.href)){
        link.target='_blank';
        link.rel='noopener';
      }
      item.append(link);
    });
    guideMessages.append(item);
    item.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  };
  guideForm?.addEventListener('submit',async event=>{
    event.preventDefault();
    const question=guideInput?.value.trim().slice(0,500)||'';
    if(!question)return;
    guideInput.value='';
    if(!guideEndpoint){
      const answer=localAnswer(question);
      addMessage(answer.text,answer.actions);
      return;
    }
    const submit=guideForm.querySelector('button[type="submit"]');
    if(submit)submit.disabled=true;
    addMessage('Estou consultando as informações públicas do site…');
    try{
      const response=await fetch(guideEndpoint,{
        method:'POST',
        mode:'cors',
        credentials:'omit',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          message:question,
          page:currentPage,
          locale:document.documentElement.lang||navigator.language||'pt-BR'
        })
      });
      if(!response.ok)throw new Error('guide_request_failed');
      const payload=await response.json();
      const answer=typeof payload.answer==='string'?payload.answer.slice(0,1400):'';
      if(!answer)throw new Error('guide_answer_empty');
      const actions=sanitizeActions(payload.actions);
      addMessage(answer,actions.length?actions:defaultActions());
    }catch(_error){
      const answer=localAnswer(question);
      addMessage(answer.text,answer.actions);
    }finally{
      if(submit)submit.disabled=false;
      guideInput?.focus();
    }
  });
}
