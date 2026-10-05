/* UTOPICAR : fonctions exécutées DANS la page (annonce ou résultats). Elles doivent rester autonomes :
   Chrome les sérialise pour chrome.scripting.executeScript. */

/* Page d'annonce : même format que le favori « Envoyer au scanner », plus la liste des photos. */
function extractAd(){
  var d=document,o={v:2,src:location.hostname,url:location.href.split('?')[0].split('#')[0],title:((d.querySelector('h1')||{}).innerText||d.title||'').trim()};
  var m=function(n){var e=d.querySelector('meta[property="'+n+'"],meta[name="'+n+'"]');return e?e.content:'';};
  // Page de vérification anti-robot : on ne la contourne pas, on s'arrête.
  var bodyTxt=(d.body&&d.body.innerText||'').slice(0,3000);
  if(d.querySelector('iframe[src*="captcha-delivery"],iframe[src*="datadome"],#px-captcha')||/(v[ée]rification|captcha|robot|acc[eè]s (bloqu|refus))/i.test(d.title+' '+bodyTxt.slice(0,400))&&!d.getElementById('__NEXT_DATA__')){o.blocked=true;return o;}
  o.ogTitle=m('og:title');o.ogDesc=m('og:description');
  o.ld=[].slice.call(d.querySelectorAll('script[type="application/ld+json"]')).map(function(s){try{return JSON.parse(s.textContent);}catch(e){return null;}}).filter(Boolean);
  var nd=d.getElementById('__NEXT_DATA__');
  if(nd){try{var j=JSON.parse(nd.textContent),best=null,bl=0,seen=0;
    var direct=j&&j.props&&j.props.pageProps&&j.props.pageProps.ad;
    if(direct&&typeof direct==='object'){best=direct;}
    else{(function walk(x,dp){if(!x||typeof x!=='object'||dp>14||seen>40000)return;seen++;
      if(!Array.isArray(x)&&(('body' in x)||('description' in x))&&(('price' in x)||('attributes' in x)||('prices' in x)||('mileage' in x))){var l=JSON.stringify(x).length;if(l>bl&&l<200000){best=x;bl=l;}}
      for(var k in x){if(Object.prototype.hasOwnProperty.call(x,k))walk(x[k],dp+1);}})(j,0);}
    if(best){o.ad=best;}}catch(e){}}
  var main=d.querySelector('main')||d.body;o.text=(main.innerText||'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').slice(0,14000);
  o.images=[].slice.call(d.images).map(function(i){return i.currentSrc||i.src;}).filter(function(s){return /^https/.test(s)&&!/logo|icon|avatar|sprite|pixel/i.test(s);}).filter(function(s,i,a){return a.indexOf(s)===i;}).slice(0,40);
  var ph=[];
  try{var im=o.ad&&o.ad.images;if(im){ph=(im.urls_large&&im.urls_large.length?im.urls_large:(im.urls||[])).slice();}}catch(e){}
  if(!ph.length){(o.ld||[]).forEach(function(x){[].concat(x&&x['@graph']||x).forEach(function(y){if(y&&y.image){[].concat(y.image).forEach(function(u){if(typeof u==='string')ph.push(u);else if(u&&u.url)ph.push(u.url);});}});});}
  if(!ph.length){var og=m('og:image');var host=null;if(og){ph.push(og);try{host=new URL(og).hostname;}catch(e){}}o.images.forEach(function(u){try{if(!host||new URL(u).hostname===host)ph.push(u);}catch(e){}});}
  o.photos=ph.filter(function(u,i,a){return /^https/.test(u)&&a.indexOf(u)===i;}).slice(0,30);
  if(o.ad&&(o.ad.body||o.ad.description))o.text=o.text.slice(0,4000);
  var s=JSON.stringify(o);if(s.length>150000){o.text=o.text.slice(0,3000);}
  return o;
}

/* Page de résultats : même format que le favori « Relever la page ».
   Leboncoin n'affiche les cartes qu'au fil du défilement : on lit donc les données complètes de la page
   (__NEXT_DATA__, rechargées pour l'adresse actuelle car les filtres changent sans recharger la page),
   puis les pages suivantes (4 au maximum, avec une pause), et en dernier recours les cartes visibles après défilement. */
async function extractList(maxPages){
  var d=document,MAXP=maxPages||4;
  function domList(){
    var d=document,pat=/\/ad\/|annonce|\/offres?\/|\/detail|\/vo\/|\/voiture-occasion/i,out=[],seen={};
    var cl=function(h){try{var u=new URL(h,location.href);return u.origin+u.pathname;}catch(e){return h;}};
    var ok=function(a){var h=a.getAttribute('href')||'';return pat.test(h)&&!/recherche|search|liste|deposer|annonces\?|\/c\/|\/ck\//i.test(h);};
    [].slice.call(d.querySelectorAll('a[href]')).filter(ok).forEach(function(a){
      var h=cl(a.href);if(seen[h])return;var el=a,best=null;
      while(el&&el!==d.body){
        var hs=[].slice.call(el.querySelectorAll('a[href]')).filter(ok).map(function(x){return cl(x.href);});
        if(hs.filter(function(v,i,s){return s.indexOf(v)===i;}).length>1)break;
        if(/€/.test(el.innerText||''))best=el;
        el=el.parentElement;
      }
      if(!best)return;seen[h]=1;
      var te=best.querySelector('[data-qa-id="aditem_title"],[data-test-id*="title"],h2,h3');
      var tt=[].slice.call(best.querySelectorAll('a[title],a[aria-label]')).map(function(x){return (x.getAttribute('title')||x.getAttribute('aria-label')||'').trim();}).filter(function(v){return v.length>3;})[0]||(te?te.innerText.trim():'');
      out.push({u:h,t:tt.slice(0,140),x:(best.innerText||'').replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').slice(0,1200)});
    });
    return {v:1,src:location.hostname,url:location.href,title:d.title,items:out.slice(0,120)};
  }

  var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var lbcItem=function(a){
    var A=a.attributes||[],g=function(k){var x=A.filter(function(z){return z&&z.key===k;})[0];return x?(x.value_label||x.value||''):'';};
    var loc=a.location||{},pr=Array.isArray(a.price)?a.price[0]:a.price;
    var km=String(g('mileage')).replace(/\D/g,''),an=g('regdate'),en=g('fuel'),bo=g('gearbox'),ch=g('horse_power_din');
    var lines=[a.subject||'',pr!=null?'Prix : '+pr+' €':'',an?'Année : '+an:'',km?'Kilométrage : '+km+' km':'',en?'Énergie : '+en:'',bo?'Boîte de vitesse : '+bo:'',ch?'Puissance : '+ch+' ch':'',
      (loc.city||loc.zipcode)?'Située à '+(loc.city||'')+' '+(loc.zipcode||''):'',(a.owner&&a.owner.type==='pro')?'Vendeur professionnel':'Particulier',String(a.body||'').replace(/\s+/g,' ').slice(0,500)];
    var u=a.url||('https://www.leboncoin.fr/ad/voitures/'+a.list_id);
    return {u:u.split('?')[0],t:String(a.subject||'').slice(0,140),x:lines.filter(Boolean).join('\n'),f:{prix:pr,annee:an?+an:null,km:km?+km:null,energie:en,boite:bo,ville:loc.city||'',cp:loc.zipcode||'',pro:!!(a.owner&&a.owner.type==='pro'),ch:ch?+String(ch).replace(/\D/g,''):null}};
  };
  var adsOf=function(j){try{var pp=j.props.pageProps;var sd=pp.searchData||pp.initialProps&&pp.initialProps.searchData||{};return {ads:(sd.ads||[]).concat(sd.ads_alu||[]),total:sd.total||sd.total_all||null};}catch(e){return null;}};
  var fromHtml=function(h){var m=h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);if(!m)return null;try{return adsOf(JSON.parse(m[1]));}catch(e){return null;}};
  if(/leboncoin\./.test(location.hostname)&&!/\/ad\//.test(location.pathname)){
    var out=[],seen={},total=null;
    for(var p=1;p<=MAXP;p++){
      var u=new URL(location.href);if(p>1)u.searchParams.set('page',p);else u.searchParams.delete('page');
      var r=null;
      try{var res=await fetch(u.toString(),{credentials:'include',headers:{'Accept':'text/html'}});if(res.ok)r=fromHtml(await res.text());}catch(e){}
      if(!r&&p===1){var nd=d.getElementById('__NEXT_DATA__');if(nd){try{r=adsOf(JSON.parse(nd.textContent));}catch(e){}}}
      if(!r||!r.ads.length)break;
      if(total==null)total=r.total;
      var add=0;r.ads.forEach(function(a){var it=lbcItem(a);if(!seen[it.u]){seen[it.u]=1;out.push(it);add++;}});
      if(!add||(total&&out.length>=total))break;
      await sleep(1500+Math.random()*1500);
    }
    if(out.length)return {v:2,src:location.hostname,url:location.href,title:d.title,total:total,items:out.slice(0,160)};
  }
  // Repli : faire défiler la page pour que toutes les cartes se chargent, puis les lire
  var y0=window.scrollY;for(var k=0;k<14;k++){window.scrollBy(0,Math.max(600,window.innerHeight*0.9));await sleep(250);if(window.innerHeight+window.scrollY>=d.body.scrollHeight-40)break;}
  window.scrollTo(0,y0);
  return domList();
}


/* Une page de résultats Leboncoin (numéro p) lue depuis l'onglet de l'utilisateur : données complètes, sans défilement.
   Appelée page par page par l'arrière-plan pour relever toute une recherche. */
async function lbcPage(p){
  var u=new URL(location.href);if(p>1)u.searchParams.set('page',p);else u.searchParams.delete('page');
  var res;try{res=await fetch(u.toString(),{credentials:'include',headers:{'Accept':'text/html'}});}catch(e){return {err:'réseau'};}
  var h=await res.text();
  if(res.status===403||/captcha-delivery|datadome/i.test(h.slice(0,20000))&&!/__NEXT_DATA__/.test(h))return {blocked:true};
  var m=h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);if(!m)return {err:'page illisible'};
  var sd;try{var pp=JSON.parse(m[1]).props.pageProps;sd=pp.searchData||(pp.initialProps&&pp.initialProps.searchData)||{};}catch(e){return {err:'page illisible'};}
  var items=(sd.ads||[]).concat(sd.ads_alu||[]).map(function(a){
    var A=a.attributes||[],g=function(k){var x=A.filter(function(z){return z&&z.key===k;})[0];return x?(x.value_label||x.value||''):'';};
    var loc=a.location||{},pr=Array.isArray(a.price)?a.price[0]:a.price;
    var km=String(g('mileage')).replace(/\D/g,''),an=g('regdate'),en=g('fuel'),bo=g('gearbox'),ch=String(g('horse_power_din')).replace(/\D/g,'');
    var pro=!!(a.owner&&a.owner.type==='pro');
    var x=[a.subject||'',pr!=null?'Prix : '+pr+' €':'',an?'Année : '+an:'',km?'Kilométrage : '+km+' km':'',en?'Énergie : '+en:'',bo?'Boîte de vitesse : '+bo:'',ch?'Puissance : '+ch+' ch':'',(loc.city||loc.zipcode)?'Située à '+(loc.city||'')+' '+(loc.zipcode||''):'',pro?'Vendeur professionnel':'Particulier',String(a.body||'').replace(/\s+/g,' ').slice(0,200)].filter(Boolean).join('\n');
    return {u:String(a.url||('https://www.leboncoin.fr/ad/voitures/'+a.list_id)).split('?')[0],t:String(a.subject||'').slice(0,140),x:x,f:{prix:pr,annee:an?+an:null,km:km?+km:null,energie:en,boite:bo,ville:loc.city||'',cp:loc.zipcode||'',pro:pro,ch:ch?+ch:null}};
  });
  return {items:items,total:sd.total||sd.total_all||null,max_pages:sd.max_pages||null,title:document.title,url:location.href};
}
