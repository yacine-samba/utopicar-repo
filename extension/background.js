// Récupère une photo de l'annonce (le service worker a accès aux domaines d'images).
function toBase64(buf){
  let s = ''; const b = new Uint8Array(buf); const step = 0x8000;
  for (let i = 0; i < b.length; i += step) s += String.fromCharCode.apply(null, b.subarray(i, i + step));
  return btoa(s);
}
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg && msg.type === 'utp-fetch-image'){
    fetch(msg.url, { credentials: 'omit' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return Promise.all([r.arrayBuffer(), r.headers.get('content-type') || 'image/jpeg']); })
      .then(([buf, type]) => reply({ ok: true, dataUrl: 'data:' + type.split(';')[0] + ';base64,' + toBase64(buf) }))
      .catch(e => reply({ ok: false, error: String(e) }));
    return true;
  }
});
