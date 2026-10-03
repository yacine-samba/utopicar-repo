// Récupère une photo de l'annonce (le service worker a accès aux domaines d'images).
function toBase64(buf){
  let s = ''; const b = new Uint8Array(buf); const step = 0x8000;
  for (let i = 0; i < b.length; i += step) s += String.fromCharCode.apply(null, b.subarray(i, i + step));
  return btoa(s);
}
// Seules les pages d'annonces des sites suivis peuvent demander une image, et seule une image est rendue.
const SITES = /^https:\/\/([a-z0-9-]+\.)*(leboncoin\.fr|lacentrale\.fr|autoscout24\.fr|leparking\.fr)\//;
const MAX_OCTETS = 8 * 1024 * 1024;
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg && msg.type === 'utp-fetch-image'){
    const page = (sender && sender.tab && sender.tab.url) || '';
    if (!SITES.test(page) || typeof msg.url !== 'string' || !/^https:\/\//.test(msg.url)){ reply({ ok: false, error: 'refusé' }); return false; }
    fetch(msg.url, { credentials: 'omit' })
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const type = (r.headers.get('content-type') || '').split(';')[0];
        if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(type)) throw new Error('pas une image');
        if (+(r.headers.get('content-length') || 0) > MAX_OCTETS) throw new Error('image trop lourde');
        return Promise.all([r.arrayBuffer(), type]);
      })
      .then(([buf, type]) => reply({ ok: true, dataUrl: 'data:' + type.split(';')[0] + ';base64,' + toBase64(buf) }))
      .catch(e => reply({ ok: false, error: String(e) }));
    return true;
  }
});
