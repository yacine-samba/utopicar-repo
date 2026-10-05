// Utopicar : pont entre l'extension et le site. La page annonce qu'elle est prête (« pret »),
// on lui transmet l'envoi gardé par l'extension (annonce, lot ou relevé, moins de 30 minutes), puis on l'efface.
// Rien ne passe par un serveur tiers : tout reste dans le navigateur.
(function(){
  'use strict';
  window.addEventListener('message', function(e){
    var d = e.data;
    if (e.source !== window || !d || d.source !== 'utopicar-page' || d.type !== 'pret') return;
    chrome.storage.local.get('utp-envoi', function(r){
      var p = r && r['utp-envoi'];
      if (!p || p.type !== d.attend || Date.now() - (p.t || 0) > 30 * 60 * 1000) return;
      chrome.storage.local.remove('utp-envoi');
      window.postMessage({ source: 'utopicar-extension', type: p.type, brut: p.brut, images: p.images || [] }, location.origin);
    });
  });
})();
