
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



// Lume shares one lightweight browser-only engine across the public pages.
const lumeLauncher=document.querySelector('[data-guide-open]');
const lumeReady=import('/assets/lume-native.mjs').then(({mountNativeGuide})=>mountNativeGuide()).catch(()=>{});
// Retain a visitor's first click while the shared modules are still in flight.
lumeLauncher?.addEventListener('click',()=>{
  const dialog=document.querySelector('#harum-guide-dialog');
  if(dialog?.dataset.lumeMounted)return;
  lumeLauncher.setAttribute('aria-busy','true');
  lumeReady.then(()=>{
    if(lumeLauncher.isConnected&&dialog?.dataset.lumeMounted&&!dialog.open)lumeLauncher.click();
  }).finally(()=>lumeLauncher.removeAttribute('aria-busy'));
},{once:true});

/* Cross-site ecosystem links; implemented in a separate shared module. */
(function(){if(document.querySelector('script[data-harum-ecos-loader]'))return;var s=document.createElement('script');s.src='/assets/ecossistema-links.js';s.defer=true;s.dataset.harumEcosLoader='';document.head.append(s)})();
