/* HARUM NOIR METHOD · curriculum interactive, no trackers, no dependencies */
(()=>{'use strict';
const rooms=[
  ['01','OLHAR','Observar antes de nomear','Percepção, proporção, espaço negativo e leitura de luz.'],
  ['02','ESTRUTURA','Dar corpo ao invisível','Geometria, perspectiva, sólidos e anatomia construtiva.'],
  ['03','GESTO','Deixar o corpo pensar','Peso, ritmo, movimento e desenho de observação.'],
  ['04','ACASO','Suspender o controle','Automatismo, marcas não planejadas e descoberta de formas.'],
  ['05','METAMORFOSE','Entre figura e botânica','Transformações visuais, síntese e composição autoral.'],
  ['06','PRESENÇA','Editar até significar','Valor, emoção, silêncio, processo e obra final.']
];
const raw=[
[0,'Contorno cego','Afinar a relação olho-mão','Sem olhar o papel, percorra com os olhos a borda de uma mão e registre cada mudança de direção.','Continuidade e atenção, não semelhança.',5],
[0,'Espaço negativo','Ver o intervalo em vez do objeto','Desenhe os vazios entre os dedos e o fundo; só depois revele a figura.','Vazios com proporção convincente.',12],
[0,'Medição comparativa','Estabelecer relações visuais','Escolha uma unidade (por exemplo, cabeça) e compare larguras e alturas antes de detalhar.','Proporções verificadas por relações, não memória.',15],
[0,'Linha de prumo','Identificar alinhamentos','Marque vertical e horizontal dos pontos-chave em uma pose real ou foto autorizada.','Pontos de apoio e eixos coerentes.',10],
[0,'Envelope de massas','Captar o todo primeiro','Envolva o motivo num polígono simples e refine cortes antes do contorno final.','Silhueta geral legível à distância.',12],
[0,'Mapa de valores','Ler a luz sem detalhes','Reduza uma imagem de domínio público a três massas: claro, médio e escuro.','Hierarquia tonal clara.',15],
[1,'Esfera, cubo e cilindro','Construir volume','Desenhe os três sólidos sob uma mesma fonte de luz e gire cada um.','Luz e volume constantes.',15],
[1,'Perspectiva de um ponto','Organizar profundidade','Construa um corredor com objetos e um único ponto de fuga.','Arestas convergentes e escala coerente.',20],
[1,'Perspectiva de dois pontos','Projetar formas no espaço','Faça caixas giradas com duas fugas fora do campo central.','Verticais retas e horizontais convergentes.',20],
[1,'Caixas anatômicas','Localizar tórax e bacia','Simplifique tórax e pelve em sólidos inclinados antes de desenhar músculos.','Rotação e contraposto reconhecíveis.',15],
[1,'Elipses em rotação','Compreender seções','Desenhe oito cilindros com elipses orientadas em diferentes eixos.','Coerência entre elipse e eixo.',10],
[1,'Anatomia por marcos','Construir sem decorar','Localize clavículas, acrômios, cristas ilíacas, joelhos e tornozelos em três poses.','Marcos observados e articulações funcionais.',25],
[2,'Linha de ação','Captar uma pose em segundos','Faça oito gestos de 30 segundos, priorizando direção e tensão.','Movimento legível mesmo sem contorno.',6],
[2,'Ritmo e contrapeso','Registrar apoio e equilíbrio','Trace a linha que conecta cabeça, tórax, pelve e pé de sustentação.','Equilíbrio plausível.',10],
[2,'Torção do tronco','Estudar oposição','Em seis poses, contraste rotação das cinturas escapular e pélvica.','Direções opostas claras.',15],
[2,'Mãos expressivas','Desenhar intenção','Estude uma mão abrindo, segurando, apontando e relaxando; comece pela massa da palma.','Articulação e expressão.',20],
[2,'Pés e chão','Ancorar a figura','Observe cinco tipos de apoio e desenhe o plano do chão antes dos dedos.','Peso percebido.',15],
[2,'Gestos sobrepostos','Descrever passagem do tempo','Sobre a mesma folha, registre três momentos sucessivos de um movimento.','Sobreposição sem confusão visual.',12],
[3,'Rabisco automático','Descobrir imagens no gesto','Rabisque por 90 segundos sem assunto definido; circule as formas encontradas depois.','Marcas iniciais preservadas.',8],
[3,'Desenho bilateral','Romper hábitos motores','Desenhe com as duas mãos simultaneamente, buscando relações entre os rastros.','Variedade gestual.',7],
[3,'Frottage','Converter textura em sugestão','Esfregue grafite sobre papel em superfícies seguras; interprete as texturas sem apagá-las.','Nova forma surge do achado.',10],
[3,'Linha contínua afetiva','Converter sensação em ritmo','Desenhe uma emoção com uma linha ininterrupta; depois busque nela uma figura.','Relação expressiva entre ritmo e imagem.',10],
[3,'Associação de formas','Transformar acidente em tema','Gere três manchas ou tramas e transforme cada uma em figura diferente, sem esconder a origem.','Variação e liberdade de interpretação.',15],
[4,'Anatomia botânica','Fundir orgânico e corporal','Faça clavícula, escápula ou mão dialogar com uma rosa, lírio ou peônia por continuidade de direção.','Integração estrutural, não colagem.',25],
[4,'Híbrido de silhuetas','Experimentar metamorfose','Combine duas silhuetas de referências legais e produza três leituras com o mesmo vazio.','Leituras distintas e coerentes.',20],
[4,'Escala impossível','Desafiar previsibilidade','Amplie uma mão ou flor até alterar a perspectiva de uma cena.','Profundidade consciente.',20],
[4,'Fragmento e memória','Trabalhar com ausência','Use um fragmento anatômico e deixe que as margens vazias completem a narrativa.','Espaço negativo intencional.',20],
[4,'Repertório reimaginado','Referenciar sem copiar','Escolha obra em domínio público e reconstrua seus pesos compositivos com figuras próprias.','Decisões novas documentadas.',30],
[5,'Carvão e apagamento','Esculpir a luz','Cubra a folha com tom médio, construa sombra e abra luzes com borracha.','Gama tonal ampla e foco luminoso.',25],
[5,'Drama de três valores','Concentrar narrativa','Conte uma cena apenas com preto, meio-tom e papel cru.','Foco inequívoco.',20],
[5,'Rosto e silêncio','Narrar pela expressão','Desenhe três estados emocionais discretos alterando olhos, boca e direção de cabeça.','Expressões distintas sem exagero obrigatório.',20],
[5,'Edição por subtração','Remover o excesso','Faça duas versões da mesma composição; na segunda, elimine ao menos 30% dos elementos.','Segunda versão mais legível.',15],
[5,'Obra-manifesto','Assinar uma linguagem própria','Combine observação, sólido, gesto, acaso e edição numa prancha autoral com registro de decisões.','Coerência, voz própria e processo visível.',60]
];
const techniques=raw.map((d,i)=>({id:i+1,room:d[0],title:d[1],goal:d[2],practice:d[3],criterion:d[4],time:d[5]}));
const $=(s,p=document)=>p.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grid=$('#hn-techniques');const dialog=$('#hn-practice-dialog');let filtered=techniques.slice();
function show(t){
if(!dialog)return;
$('#hn-dialog-content').innerHTML='<p class="hn-overline">Técnica '+String(t.id).padStart(2,'0')+' / '+rooms[t.room][1]+'</p><h2>'+esc(t.title)+'</h2><p class="hn-intro">'+esc(t.goal)+'</p><h3>Prática guiada · '+t.time+' minutos</h3><p>'+esc(t.practice)+'</p><h3>O que observar</h3><p>'+esc(t.criterion)+'</p><p class="hn-notice">Fotografe ou arquive a prancha com data, tempo e uma decisão que deseja levar à próxima obra. O objetivo não é imitar um artista: é aprender a escolher.</p>';
dialog.showModal();
}
function render(){
if(!grid)return;grid.replaceChildren();
const fragment=document.createDocumentFragment();
filtered.forEach(t=>{let a=document.createElement('article');a.className='hn-practice';a.innerHTML='<span class="hn-mini">'+String(t.id).padStart(2,'0')+' · '+rooms[t.room][1]+' · '+t.time+' min</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.goal)+'</p><p>'+esc(t.practice)+'</p><button type="button">Abrir laboratório ↗</button>';a.querySelector('button').addEventListener('click',()=>show(t));fragment.append(a)});grid.append(fragment);
$('#hn-count').textContent=filtered.length+' práticas disponíveis';
}
if(grid){
const f=$('#hn-phase'),q=$('#hn-search');const apply=()=>{let phase=f.value,search=q.value.trim().toLocaleLowerCase('pt-BR');filtered=techniques.filter(t=>(phase==='all'||String(t.room)===phase)&&(!search||[t.title,t.goal,t.practice,rooms[t.room][1]].join(' ').toLocaleLowerCase('pt-BR').includes(search)));render()};
f.addEventListener('change',apply);q.addEventListener('input',apply);render();
$('#hn-random')?.addEventListener('click',()=>show(filtered[Math.floor(Math.random()*filtered.length)]||techniques[0]));
$('#hn-dialog-close')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
}
let interval=0,ends=0;
const output=$('#hn-clock'),start=$('#hn-timer-start');
function tick(){const left=Math.max(0,Math.ceil((ends-Date.now())/1000)),m=String(Math.floor(left/60)).padStart(2,'0'),s=String(left%60).padStart(2,'0');output.textContent=m+':'+s;if(!left){clearInterval(interval);interval=0;start.textContent='Iniciar estudo';output.setAttribute('aria-label','Tempo concluído')}}
start?.addEventListener('click',()=>{if(interval){clearInterval(interval);interval=0;start.textContent='Continuar / reiniciar';return}ends=Date.now()+(parseInt($('#hn-minutes').value,10)||5)*60000;tick();interval=setInterval(tick,1000);start.textContent='Pausar cronômetro'});
// Art Institute of Chicago public domain API; no rehosting, no image assumed PD unless record flag true.
const sourceBtn=$('#hn-load-references');let loaded=false;
sourceBtn?.addEventListener('click',async()=>{if(loaded)return;sourceBtn.disabled=true;$('#hn-reference-status').textContent='Consultando a coleção pública...';
try{
 const queries=['figure drawing','study hands','old master sketch'];let works=[];
 for(const term of queries){let u=new URL('https://api.artic.edu/api/v1/artworks/search');u.searchParams.set('q',term);u.searchParams.set('limit','12');u.searchParams.set('fields','id,title,artist_display,image_id,is_public_domain,date_display');u.searchParams.set('query[term][is_public_domain]','true');let r=await fetch(u.toString(),{headers:{Accept:'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);let data=await r.json();works.push(...(data.data||[]).filter(x=>x.is_public_domain===true&&x.image_id));}
 works=[...new Map(works.map(x=>[x.id,x])).values()].slice(0,12);
 if(!works.length)throw Error('Nenhuma imagem licenciada encontrada');
 const host=$('#hn-sources');host.replaceChildren();
 for(const w of works){let figure=document.createElement('figure');figure.className='hn-source';let im=document.createElement('img');im.loading='lazy';im.decoding='async';im.alt='Obra: '+w.title;im.src='https://www.artic.edu/iiif/2/'+encodeURIComponent(w.image_id)+'/full/600,/0/default.jpg';let cap=document.createElement('figcaption');let link=document.createElement('a');link.href='https://www.artic.edu/artworks/'+w.id;link.target='_blank';link.rel='noopener noreferrer';link.textContent=w.title;cap.append(link,document.createTextNode(' — '+(w.artist_display||'Artista não identificado')+' · domínio público conforme registro do museu'));figure.append(im,cap);host.append(figure);}
 loaded=true;$('#hn-reference-status').textContent=works.length+' imagens de domínio público carregadas do Art Institute of Chicago. Créditos e links preservados.';
}catch(e){sourceBtn.disabled=false;$('#hn-reference-status').textContent='Não foi possível carregar agora. Consulte a fonte original pelos links abaixo; nenhuma licença foi presumida.';}
});
})();