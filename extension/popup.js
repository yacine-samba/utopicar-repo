'use strict';
const MAX = 10;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status = (t, cls) => { const el = $('#status'); el.textContent = t || ''; el.className = cls || ''; };
let page = null, sel = new Set(), tab = null;

async function currentTab(){ const [t] = await chrome.tabs.query({active:true, currentWindow:true}); return t; }
async function runInTab(func, args){
  if (!tab || !/^https?:/.test(tab.url || 'https:')) throw new Error('Ouvrez d\'abord une page d\'annonce ou de résultats.');
  const [res] = await chrome.scripting.executeScript({target:{tabId: tab.id}, func, args: args || []});
  return res && res.result;
}
function copyText(text){
  const h = e => { e.clipboardData.setData('text/plain', text); e.preventDefault(); };
  document.addEventListener('copy', h); const ok = document.execCommand('copy'); document.removeEventListener('copy', h);
  if (!ok) throw new Error('Le navigateur a refusé la copie.');
}
function card(it){
  const x = it.x || '';
  const pr = (x.match(/(\d{1,3}(?:[\s  .]\d{3})+|\d{3,6})\s*€/) || [])[1];
  const km = (x.match(/(\d{1,3}(?:[\s  .]\d{3})+|\d{4,6})\s*km\b/i) || [])[1];
  const an = (x.match(/(?:^|[·\s(|,"])((?:19[89]|20[0-3])\d)(?=[·\s)|,"]|$)/m) || [])[1];
  const ville = (x.match(/(?:Situ[ée]e? à\s+)?([A-ZÀ-Ý][^\n\d€:]{1,40}?)\s+(\d{5})(?=\s|\.|$)/) || [])[1];
  return {prix: pr ? pr.replace(/[\s  .]/g,' ') + ' €' : '', meta: [an, km ? km.replace(/[\s  .]/g,' ') + ' km' : '', ville].filter(Boolean).join(' · '), pro: /Vendeur professionnel|(^|\n)Pro(\n|$)/.test(x)};
}
function renderPicker(){
  const items = page.items;
  $('#plist').innerHTML = items.map((it, i) => { const c = card(it); return `<label class="pit"><input type="checkbox" data-i="${i}" ${sel.has(i) ? 'checked' : ''}><span><b>${esc(it.t || 'Annonce')}</b><span>${esc(c.meta)}${c.pro ? ' · pro' : ''}</span></span><span class="pr">${esc(c.prix)}</span></label>`; }).join('');
  updBatch();
}
function updBatch(){ $('#batchT').textContent = `Lire en entier (${sel.size})`; $('#batch').disabled = !sel.size; $('#pcount').textContent = sel.size ? `${sel.size} cochée${sel.size > 1 ? 's' : ''} sur ${MAX} au maximum` : `Cochez jusqu'à ${MAX} annonces`; }
$('#plist').addEventListener('change', e => {
  const c = e.target.closest('[data-i]'); if (!c) return; const i = +c.dataset.i;
  if (c.checked){ if (sel.size >= MAX){ c.checked = false; status(`${MAX} annonces au maximum par lecture.`, 'bad'); return; } sel.add(i); } else sel.delete(i);
  status(''); updBatch();
});
$('#pall').addEventListener('click', () => { sel = new Set(page.items.slice(0, MAX).map((_, i) => i)); renderPicker(); });
$('#pnone').addEventListener('click', () => { sel.clear(); renderPicker(); });

$('#ad').addEventListener('click', async () => {
  $('#ad').disabled = true; status('Lecture de l\'annonce…');
  const r = await chrome.runtime.sendMessage({type:'utp-single', tabId: tab.id});
  $('#ad').disabled = false;
  if (!r || !r.ok) status((r && r.err) || 'Lecture impossible.', 'bad');
});
$('#batch').addEventListener('click', async () => {
  const urls = [...sel].sort((a,b) => a - b).map(i => page.items[i].u);
  const r = await chrome.runtime.sendMessage({type:'utp-batch', urls, windowId: tab.windowId, src: page.src});
  if (!r || !r.ok) status((r && r.err) || 'Lecture impossible.', 'bad');
  else { status(`Lecture de ${urls.length} annonce${urls.length > 1 ? 's' : ''} lancée. Vous pouvez fermer cette fenêtre.`, 'ok'); sel.clear(); renderPicker(); }
});
$('#list').addEventListener('click', async () => {
  if (!tab || !/^https?:/.test(tab.url || '')){ status('Ouvrez d\'abord une page de résultats.', 'bad'); return; }
  const r = await chrome.runtime.sendMessage({type:'utp-releve', tabId: tab.id, url: tab.url});
  if (!r || !r.ok) status((r && r.err) || 'Relevé impossible.', 'bad');
  else status('Relevé de toutes les pages lancé. Vous pouvez fermer cette fenêtre : une notification arrive à la fin.', 'ok');
});
$('#stop').addEventListener('click', () => chrome.runtime.sendMessage({type:'utp-stop'}).then(() => status('Arrêt après l\'annonce en cours…')));
$('#again').addEventListener('click', async () => { const r = await chrome.runtime.sendMessage({type:'utp-copylast'}); status(r && r.ok ? 'Recopié : sur Utopicar, faites Ctrl+V.' : (r && r.err) || 'Copie refusée.', r && r.ok ? 'ok' : 'bad'); });
$('#go').addEventListener('click', async () => { await chrome.runtime.sendMessage({type:'utp-open'}); window.close(); });
$('#reopen').addEventListener('click', async () => { const r = await chrome.runtime.sendMessage({type:'utp-renvoyer'}); if (r && r.ok) window.close(); else status((r && r.err) || 'Rien à rouvrir.', 'bad'); });

/* ---- relevé automatique des cotes ---- */
const nb = v => Number(v || 0).toLocaleString('fr-FR');
function showBal(b){
  const enCours = !!(b && b.actif), pause = enCours && !!b.pause, envoi = b && b.envoi && b.envoi.etat === 'en cours';
  $('#balBar').style.display = enCours || envoi ? 'block' : 'none';
  const pct = envoi ? b.envoi.envoyees / Math.max(1, b.lues) : b && b.nMarques ? b.marquesFaites / b.nMarques : 0;
  $('#balBar').firstElementChild.style.width = Math.round(100 * pct) + '%';
  $('#balMsg').textContent = b && b.msg || '';
  $('#balMsg').style.color = pause && b.pause !== 'arret' ? 'var(--perte)' : '';
  $('#balStats').textContent = b && b.prepare ? `Marques ${nb(b.marquesFaites)} / ${nb(b.nMarques)} · ${nb(b.recherches)} recherches · ${nb(b.lues)} annonces lues · ${nb(b.coupees)} coupée(s) à 100 pages` + (b.envoi && b.envoi.etat === 'fini' ? ' · envoyées à Utopicar' : '') : '';
  $('#balPause').style.display = enCours && !pause ? 'block' : 'none';
  $('#balReprendre').style.display = pause ? 'block' : 'none';
  $('#balAbandon').style.display = enCours ? 'block' : 'none';
  $('#balEnvoyer').style.display = b && b.lues && !envoi && (!enCours || pause) ? 'block' : 'none';
  $('#balEnvoyer').textContent = b && b.envoi && b.envoi.etat === 'fini' ? 'Renvoyer le bilan' : 'Envoyer à Utopicar';
  $('#balBilan').style.display = b && b.recherches ? 'block' : 'none';
  $('#balGo').style.display = enCours || envoi ? 'none' : 'grid';
  $('#balFiltreL').style.display = enCours || envoi ? 'none' : '';
  $('#balGoT').textContent = b && b.recherches ? 'Lancer un nouveau relevé des cotes' : 'Lancer le relevé des cotes';
}
$('#balGo').addEventListener('click', async () => {
  const { bal } = await chrome.storage.local.get('bal');
  if (bal && bal.lues && !(bal.envoi && bal.envoi.etat === 'fini') && !confirm(`Le relevé précédent (${nb(bal.lues)} annonces) n'a pas été envoyé à Utopicar. Le remplacer quand même ?`)) return;
  $('#balGo').disabled = true; $('#balMsg').textContent = 'Démarrage…';
  const r = await chrome.runtime.sendMessage({type: 'utp-bal-start', marques: $('#balFiltre').value});
  $('#balGo').disabled = false;
  if (!r || !r.ok) $('#balMsg').textContent = (r && r.err) || 'Lancement impossible.';
});
$('#balPause').addEventListener('click', () => chrome.runtime.sendMessage({type: 'utp-bal-pause'}).then(() => { $('#balMsg').textContent = 'Pause après la page en cours…'; }));
$('#balReprendre').addEventListener('click', () => chrome.runtime.sendMessage({type: 'utp-bal-reprendre'}).then(r => { if (!r || !r.ok) $('#balMsg').textContent = (r && r.err) || 'Reprise impossible.'; }));
$('#balAbandon').addEventListener('click', () => { if (confirm('Arrêter définitivement ce relevé ? Les annonces déjà relevées restent dans l\'extension et peuvent être envoyées à Utopicar.')) chrome.runtime.sendMessage({type: 'utp-bal-abandon'}); });
$('#balEnvoyer').addEventListener('click', () => { $('#balMsg').textContent = 'Envoi à Utopicar…'; chrome.runtime.sendMessage({type: 'utp-bal-envoyer'}).then(r => { if (r && !r.ok && r.err) $('#balMsg').textContent = r.err; }); });
$('#balBilan').addEventListener('click', async () => { const r = await chrome.runtime.sendMessage({type: 'utp-bal-bilan'}); if (r && r.ok) window.close(); else $('#balMsg').textContent = (r && r.err) || 'Pas de bilan.'; });

function showJob(j){
  if (!j) return;
  const bar = $('#bar');
  if (j.running){ bar.style.display = 'block'; bar.firstElementChild.style.width = Math.round(100 * (j.done || 0) / Math.max(1, j.total || 1)) + '%'; status(j.msg || 'Lecture en cours…'); $('#stop').style.display = j.kind === 'batch' || j.kind === 'releve' ? 'block' : 'none'; $('#batch').disabled = true; $('#ad').disabled = true; }
  else { bar.style.display = 'none'; $('#stop').style.display = 'none'; if (j.msg) status(j.msg, j.status === 'bad' ? 'bad' : 'ok'); $('#ad').disabled = false; updBatch(); }
}
chrome.storage.onChanged.addListener((ch, area) => { if (area === 'session' && ch.job) showJob(ch.job.newValue); if (area === 'local' && ch.bal) showBal(ch.bal.newValue); if (area === 'local' && ch.lastMeta){ $('#again').style.display = 'block'; $('#reopen').style.display = 'block'; } });

(async () => {
  tab = await currentTab(); const u = tab && tab.url || '';
  const isAd = /\/ad\/|annonce-|\/offres\/[^/]+-[0-9a-f-]{8,}|\/detail/i.test(u);
  const { job } = await chrome.storage.session.get('job');
  const { lastMeta } = await chrome.storage.local.get('lastMeta');
  const { bal } = await chrome.storage.local.get('bal');
  showBal(bal);
  if (lastMeta){ $('#again').style.display = 'block'; $('#reopen').style.display = 'block'; }
  if (isAd){ $('#ad').classList.add('main'); }
  else if (/^https?:/.test(u)){
    try { page = await runInTab(extractList, [1]); } catch(e){ page = null; }
    if (page && page.items.length){
      $('#ad').style.display = 'none'; $('#picker').style.display = 'block'; $('#batch').style.display = 'grid';
      renderPicker();
    } else { $('#ad').classList.add('main'); }
  }
  showJob(job);
})();
