'use strict';
chrome.runtime.onMessage.addListener((msg, sender, send) => {
  if (!msg || msg.type !== 'utp-offcopy') return;
  try {
    const t = document.getElementById('t');
    t.value = msg.text; t.select();
    const ok = document.execCommand('copy');
    t.value = '';
    send({ok});
  } catch(e){ send({ok:false}); }
});
