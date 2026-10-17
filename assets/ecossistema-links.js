/* Arte Harum · global cross-collection navigation (idempotent) */
(function(){
  function initializeEcosystemNavigation(){
    if(document.querySelector('[data-harum-ecosystem-links]'))return;
    const style=document.createElement('style');
    style.textContent=`
.harum-ecos-bar{position:relative;z-index:35;background:rgba(19,17,15,.97);color:#ede5d6;border-bottom:1px solid rgba(181,155,103,.35);font-family:Manrope,Arial,sans-serif}
.harum-ecos-bar .harum-ecos-inner{max-width:1160px;margin:auto;padding:0 1rem;display:flex;gap:4px;overflow-x:auto;white-space:nowrap;scrollbar-width:thin;scrollbar-color:#9f8452 transparent;align-items:center}
.harum-ecos-bar a{flex:none;display:inline-block;padding:12px 11px;color:#dfd3bc;text-decoration:none;font-size:12px;line-height:1.5;letter-spacing:.03em}
.harum-ecos-bar a:hover,.harum-ecos-bar a:focus-visible,.harum-ecos-bar a[aria-current="page"]{color:#e3c17e;text-decoration:underline;text-underline-offset:5px}
.harum-ecos-bar a.harum-ecos-primary{color:#e3c17e;font-weight:600}
@media(min-width:901px){.top #primary-nav{gap:clamp(.45rem,.85vw,1rem)}.top #primary-nav a{font-size:.68rem}}
@media(min-width:901px) and (max-width:1220px){.top .menu{display:block;border:1px solid rgba(240,236,227,.22);background:transparent;color:#f4efe6;padding:.55rem .7rem}
.top #primary-nav{display:none;position:absolute;top:76px;left:0;right:0;max-height:calc(100svh - 76px);overflow:auto;padding:1rem;background:#090909;flex-direction:column;align-items:flex-start;gap:.7rem}
.top #primary-nav.open{display:flex}}
@media(max-width:600px){.harum-ecos-bar a{padding:11px 10px;font-size:11px}}
`;
    document.head.append(style);
    const primary=document.getElementById('primary-nav');
    if(primary){
      [['/explorar/','Explorar tudo'],['/galeria-viva/','Galeria Viva'],['/metodo/','Método'],['/noivas/','Noivas']].forEach(function(pair){
        if(primary.querySelector('a[href="'+pair[0]+'"]'))return;
        const link=document.createElement('a');
        link.href=pair[0];link.textContent=pair[1];
        const before=primary.querySelector('a[href="/agendar/"]');
        if(before)primary.insertBefore(link,before);
        else primary.append(link);
      });
    }
    if(document.querySelector('.harum-ecos-static'))return;
    const holder=document.querySelector('header.top')||document.querySelector('nav.nav')||document.querySelector('header')||document.querySelector('nav');
    if(!holder)return;
    const bar=document.createElement('nav');
    bar.className='harum-ecos-bar';
    bar.setAttribute('aria-label','Navegação entre coleções Arte Harum');
    bar.dataset.harumEcosystemLinks='';
    const inner=document.createElement('div');
    inner.className='harum-ecos-inner';
    const links=[
      ['/', 'Início'],
      ['/explorar/', 'Todos os caminhos'],
      ['/galeria-viva/', 'Galeria Viva'],
      ['/metodo/', 'Harum Noir Method'],
      ['/noivas/', 'Noivas'],
      ['/harum-noir/modelo-vivo/', 'Modelo vivo'],
      ['https://suryamayaharum-droid.github.io/astro-blog-starter-template/referencias/', 'Atlas 1001']
    ];
    const path=location.pathname;
    links.forEach(function(item){
      const a=document.createElement('a');
      a.href=item[0];a.textContent=item[1];
      if(item[0]==='/explorar/')a.className='harum-ecos-primary';
      if(item[0]==='/'&&path==='/')a.setAttribute('aria-current','page');
      if(item[0]==='/explorar/'&&path.startsWith('/explorar'))a.setAttribute('aria-current','page');
      if(item[0]==='/galeria-viva/'&&path.startsWith('/galeria-viva'))a.setAttribute('aria-current','page');
      if(item[0]==='/metodo/'&&path.startsWith('/metodo'))a.setAttribute('aria-current','page');
      if(item[0]==='/noivas/'&&path.startsWith('/noivas'))a.setAttribute('aria-current','page');
      if(item[0]==='/harum-noir/modelo-vivo/'&&path.startsWith('/harum-noir/modelo-vivo'))a.setAttribute('aria-current','page');
      inner.append(a);
    });
    bar.append(inner);
    holder.insertAdjacentElement('afterend',bar);
  }
  function initialize(){
    initializeEcosystemNavigation();
    import('/assets/lume-native.mjs').then(({mountNativeGuide})=>mountNativeGuide()).catch(()=>{});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
})();
