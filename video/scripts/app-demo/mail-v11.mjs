// L'e-mail d'alerte de la présentation v11, rendu avec le vrai modèle de l'app : copie de mailNouvelles()
// (supabase/functions/veille/index.ts, main du 17 oct. 2026), sur la Clio d'essai et sa cote réelle (cote_marche relue
// le 17 oct. : 9 714 € sur 1 102 annonces). Seul écart : « Utopicar » s'écrit « utopicar » à l'écran (règle de la marque).
// usage : node mail-v11.mjs ../../assets/presente-v11/app
import fs from 'node:fs';
import { chromium } from 'playwright';
const OUT = process.argv[2];
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => n == null ? '' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const SITE_URL = 'https://utopicar.fr/app/recherche', APP_URL = SITE_URL;
function mailNouvelles(v, list) {
  const shown = list.slice(0, 15);
  const card = (a) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    ${a.photo ? `<td style="padding-right:12px;vertical-align:top"><a href="${escH(a.url)}"><img src="${escH(a.photo)}" width="120" style="border-radius:6px;display:block;width:120px;height:auto" alt=""></a></td>` : ''}
    <td style="vertical-align:top;font:14px/1.45 Arial,sans-serif;color:#1d1d1f">
      <a href="${escH(a.url)}" style="color:#15307f;font-weight:bold;text-decoration:none">${escH(a.titre)}</a><br>
      <b style="font-size:16px">${a.prix != null ? fmt(a.prix) + ' €' : 'Prix non indiqué'}</b><br>
      <span style="color:#555">${[a.annee, a.km != null ? fmt(a.km) + ' km' : '', a.energie, a.boite].filter(Boolean).map(escH).join(' · ')}</span><br>
      <span style="color:#777">${escH([a.ville, a.cp].filter(Boolean).join(' '))}${a.fiab ? ' · <span style="color:#0a7a43">modèle fiable</span>' : ''}</span>
      ${a.cote ? `<br><span style="color:${a.cote.ecart >= 0 ? '#0a7a43' : '#9a3412'};font-weight:bold">${a.cote.ecart >= 0 ? fmt(a.cote.ecart) + ' € sous la cote' : fmt(-a.cote.ecart) + ' € au-dessus de la cote'}</span> <span style="color:#777">(cote ${fmt(a.cote.mediane)} € sur ${a.cote.n} annonces)</span>` : ''}
    </td></tr></table></td></tr>`;
  const html = `<div style="max-width:560px;margin:0 auto;font:14px Arial,sans-serif;color:#1d1d1f">
    <p style="font-size:18px;margin:0 0 4px"><b>${list.length} nouvelle${list.length > 1 ? 's' : ''} annonce${list.length > 1 ? 's' : ''}</b></p>
    <p style="margin:0 0 12px;color:#555">Recherche « ${escH(v.nom)} »</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${shown.map(card).join('')}</table>
    ${list.length > shown.length ? `<p style="color:#555">Et ${list.length - shown.length} autre(s) dans l'outil.</p>` : ''}
    <p style="margin:18px 0"><a href="${v.user_id ? SITE_URL : APP_URL}" style="background:${v.user_id ? '#ff5a1f' : '#15307f'};color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">${v.user_id ? 'Voir mes alertes sur utopicar' : 'Ouvrir utopicar (cote, état, analyse)'}</a></p>
    <p style="color:#999;font-size:12px">${v.user_id ? 'Envoyé par votre alerte utopicar. Pour ne plus recevoir ces e-mails, éteignez l\'interrupteur « Alerte e-mail » de la recherche dans Mon espace › Recherche.' : ''}</p></div>`;
  const first = list[0];
  const subject = `${list.length} nouvelle${list.length > 1 ? 's' : ''} ${v.nom}${first && first.prix != null ? ` · dès ${fmt(Math.min(...list.map((x) => x.prix ?? 1e9)))} €` : ''}`;
  return { subject, html };
}
const v = { nom: 'Renault Clio 4', user_id: 'demo' };
const list = [{ titre: 'Renault Clio IV 1.5 dCi 75 Zen', prix: 7650, annee: 2018, km: 88500, energie: 'Diesel', boite: 'Manuelle', ville: 'Villeurbanne', cp: '69100', url: 'https://www.leboncoin.fr/ad/voitures/2870558214', photo: null, cote: { n: 1102, mediane: 9714, ecart: 9714 - 7650 } }];
const m = mailNouvelles(v, list);
// en-tête neutre d'un e-mail ouvert sur le téléphone (aucune application de messagerie imitée)
const page = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#fff;font:14px Arial,sans-serif;color:#1d1d1f}
.tete{padding:18px 18px 14px;border-bottom:1px solid #e5e5e5}.obj{font-size:19px;font-weight:bold;line-height:1.3;margin:0 0 10px}
.de{display:flex;align-items:center;gap:10px;color:#555}.av{width:36px;height:36px;border-radius:50%;background:#1a1310;display:grid;place-items:center;color:#ff5a1f;font-weight:bold}
.corps{padding:16px 18px}</style></head><body>
<div class="tete"><p class="obj">${escH(m.subject)}</p><div class="de"><div class="av">u</div><div><b style="color:#1d1d1f">utopicar</b><br><span style="font-size:12px">à moi · 7:12</span></div></div></div>
<div class="corps">${m.html}</div></body></html>`;
fs.writeFileSync(`${OUT}/mail.html`, page);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await p.setContent(page); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/ecran-mail.png` });
await b.close();
console.log(m.subject);
