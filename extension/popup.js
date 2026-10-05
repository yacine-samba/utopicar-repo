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
$('#again').addEventListener('click', async () => { const r = await chrome.runtime.sendMessage({type:'utp-copylast'}); status(r && r.ok ? 'Recopié : sur UTOPICAR, faites Ctrl+V.' : (r && r.err) || 'Copie refusée.', r && r.ok ? 'ok' : 'bad'); });
$('#go').addEventListener('click', async () => { await chrome.runtime.sendMessage({type:'utp-open'}); window.close(); });

function showJob(j){
  if (!j) return;
  const bar = $('#bar');
  if (j.running){ bar.style.display = 'block'; bar.firstElementChild.style.width = Math.round(100 * (j.done || 0) / Math.max(1, j.total || 1)) + '%'; status(j.msg || 'Lecture en cours…'); $('#stop').style.display = j.kind === 'batch' || j.kind === 'releve' ? 'block' : 'none'; $('#batch').disabled = true; $('#ad').disabled = true; }
  else { bar.style.display = 'none'; $('#stop').style.display = 'none'; if (j.msg) status(j.msg, j.status === 'bad' ? 'bad' : 'ok'); $('#ad').disabled = false; updBatch(); }
}
chrome.storage.onChanged.addListener((ch, area) => { if (area === 'session' && ch.job) showJob(ch.job.newValue); if (area === 'local' && ch.lastMeta) $('#again').style.display = 'block'; });

(async () => {
  tab = await currentTab(); const u = tab && tab.url || '';
  const isAd = /\/ad\/|annonce-|\/offres\/[^/]+-[0-9a-f-]{8,}|\/detail/i.test(u);
  const { job } = await chrome.storage.session.get('job');
  const { lastMeta } = await chrome.storage.local.get('lastMeta');
  if (lastMeta) $('#again').style.display = 'block';
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
