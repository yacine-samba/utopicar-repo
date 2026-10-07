/* eslint-disable */
/* Moteur de l'outil UTOPICAR Garage, repris tel quel : référentiel marque → modèle → génération,
   reconnaissance par règles fixes, cote par régression sur la même génération (âge, km, vendeur pro, boîte,
   finition, puissance, équipements, annonces aberrantes écartées). Source : legacy/garage/index.html. */
const escRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const num = v => { if (v === '' || v == null || typeof v === 'boolean') return null; if (typeof v === 'number') return isFinite(v) ? v : null; const n = Number(String(v).replace(/[\s\u00a0\u202f€]/g,'').replace(',','.')); return isFinite(n) ? n : null; };
const normEn = s => { s = String(s||'').toLowerCase(); return /diesel|gazole/.test(s) ? 'diesel' : /hybride/.test(s) ? 'hybride' : /essence/.test(s) ? 'essence' : /lectrique/.test(s) ? 'electrique' : /gpl/.test(s) ? 'gpl' : ''; };
const normBo = s => { s = String(s||'').toLowerCase(); return /auto|edc|dsg|bva/.test(s) ? 'auto' : /manu|bvm/.test(s) ? 'manuelle' : ''; };
const median = a => { const s = [...a].sort((x,y)=>x-y); if (!s.length) return null; const m = Math.floor(s.length/2); return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2; };
const flat = s => String(s || '').toLowerCase().replace(/[àâäá]/g,'a').replace(/[éèêë]/g,'e').replace(/[îïí]/g,'i').replace(/[ôöó]/g,'o').replace(/[ùûüú]/g,'u').replace(/ç/g,'c').replace(/[’‘]/g,"'");
const flatA = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const FUEL_CODE = {essence:'1', diesel:'2', electrique:'4', hybride:'6'};
/* ================= Référentiel marque → modèle → génération (liste fixe, jamais par l'IA) =================
   Génération : [id, année début, année fin (0 = encore vendue), libellé facultatif, options]
   Années = années de 1re immatriculation en France, fins de stock comprises : deux générations se chevauchent
   pendant la transition (ces années-là, l'année seule ne suffit pas).
   Options : a = autres façons de l'écrire, c = codes châssis (reconnus partout dans le texte),
             d0 = mois de lancement (aucune voiture de cette génération immatriculée avant),
             t = [regex, année] version qui a survécu à la génération (ex. cabriolet), fp = moteurs ou finitions propres à cette génération.
   Modèle : [nom, clé, nom Leboncoin ou '', autres noms séparés par des virgules, générations, style]
   style : '' = « Golf 7 », 'R' = « 208 II », 'C' = « Série 1 (E87) », 'U' = génération unique. */
const CAT = [
 ['Renault', 'RENAULT', 1, '', [
  ['Twingo', 'twingo', 'Twingo', '', [['1', 1993, 2007], ['2', 2007, 2014, '', {d0: '2007-05', fp: /\b1\.2 ?16v|\b1\.2 ?(60|75)\b|\b1\.5 ?dci|quickshift|\brs ?133\b|gordini/}], ['3', 2014, 2024, '', {d0: '2014-08', fp: /\bsce ?(65|70|75)\b|\btce ?(90|110)\b|0\.9 ?tce|e-?tech|electric/}]]],
  ['Clio', 'clio', 'Clio', '', [['1', 1990, 1998], ['2', 1998, 2005, '', {t: [/\bcampus\b/, 2009], fp: /\bcampus\b|\b1\.2 ?(8v|60 ?ch)\b|\bdci ?(65|80|82)\b|\bd ?65\b/}], ['3', 2005, 2013, '', {d0: '2005-09', fp: /\btce ?100\b|\bdci ?(68|70|85|86|88|105|106)\b|\b1\.6 ?16v|\bauthentique\b|rip ?curl|night ?(and|&|et) ?day|\bexception\b|\brs ?(197|203)\b/}], ['4', 2012, 2019, '', {d0: '2012-10', fp: /\b0\.9 ?tce|\btce ?(90|120)\b|\b1\.2 ?tce|\bdci ?(75|90|110)\b|\benergy\b|\brs ?(200|220)\b|trophy ?220/}], ['5', 2019, 2026, '', {d0: '2019-09', fp: /\b1\.0 ?tce|\btce ?(100|130|140)\b|\bsce ?(65|75)\b|blue ?dci|e-?tech|\btechno\b|\bevolution\b|esprit alpine|\biconic\b/}], ['6', 2025, 0, '', {d0: '2025-12'}]]],
  ['Mégane', 'megane', 'Megane', '', [['1', 1995, 2002], ['2', 2002, 2009, '', {fp: /\bdci ?(80|82|85|100|105|106|120|150)\b|\b1\.4 ?16v|\b1\.6 ?16v ?(105|110|115)\b|\b2\.0 ?16v/}], ['3', 2008, 2016, '', {d0: '2008-10', fp: /\bdci ?(90|95|110|130|160)\b|\btce ?(115|130|180)\b|\bbose\b|\brs ?(250|265|275)\b/}], ['4', 2016, 2023, '', {d0: '2016-02', fp: /\b1\.3 ?tce|blue ?dci|\btce ?(140|160)\b|\b1\.7 ?dci|e-?tech plug/}]]],
  ['Mégane E-Tech', 'meganeetech', '', 'megane e-tech,megane e tech,megane electrique', [['1', 2022, 0]], 'U'],
  ['Scénic', 'scenic', 'Scenic', 'grand scenic', [['1', 1996, 2003], ['2', 2003, 2009], ['3', 2009, 2016, '', {d0: '2009-04'}], ['4', 2016, 2022, '', {d0: '2016-10'}], ['5', 2024, 0, '', {d0: '2024-03'}]]],
  ['Captur', 'captur', 'Captur', '', [['1', 2013, 2019, '', {d0: '2013-03'}], ['2', 2019, 0, '', {d0: '2019-12', fp: /\btce ?(100|130|140|155|160)\b|e-?tech|blue ?dci/}]]],
  ['Kadjar', 'kadjar', 'Kadjar', '', [['1', 2015, 2022]], 'U'],
  ['Austral', 'austral', 'Austral', '', [['1', 2022, 0]], 'U'],
  ['Arkana', 'arkana', 'Arkana', '', [['1', 2021, 0]], 'U'],
  ['Kangoo', 'kangoo', 'Kangoo', '', [['1', 1997, 2008], ['2', 2008, 2021, '', {d0: '2008-01'}], ['3', 2021, 0, '', {d0: '2021-05'}]]],
  ['Laguna', 'laguna', 'Laguna', '', [['1', 1994, 2001], ['2', 2001, 2007], ['3', 2007, 2015, '', {d0: '2007-10'}]]],
  ['Modus', 'modus', 'Modus', 'grand modus', [['1', 2004, 2012]], 'U'],
  ['Zoé', 'zoe', 'Zoe', '', [['1', 2013, 2024]], 'U'],
  ['Espace', 'espace', '', '', [['3', 1997, 2002], ['4', 2002, 2014], ['5', 2015, 2023, '', {d0: '2015-04'}], ['6', 2023, 0, '', {d0: '2023-10'}]]],
  ['Talisman', 'talisman', 'Talisman', '', [['1', 2015, 2022]], 'U'],
  ['Koleos', 'koleos', 'Koleos', '', [['1', 2008, 2016], ['2', 2017, 2023, '', {d0: '2017-06'}]]],
  ['Trafic', 'trafic', 'Trafic', '', [['2', 2001, 2014], ['3', 2014, 0, '', {d0: '2014-09'}]]],
 ]],
 ['Peugeot', 'PEUGEOT', 1, '', [
  ['106', '106', '106', '', [['1', 1991, 2003]], 'U'],
  ['107', '107', '107', '', [['1', 2005, 2014]], 'U'],
  ['108', '108', '108', '', [['1', 2014, 2021]], 'U'],
  ['206', '206', '206', '', [['1', 1998, 2010, '206'], ['plus', 2009, 2013, '206+', {a: ['+'], d0: '2009-02'}]]],
  ['207', '207', '207', '', [['1', 2006, 2014]], 'U'],
  ['208', '208', '208', '', [['1', 2012, 2019, '', {d0: '2012-03', fp: /\b1\.4 ?hdi|\b1\.6 ?e?-?hdi|\bvti\b|puretech ?(82|110)\b|\b1\.6 ?thp|\bgti\b/}], ['2', 2019, 0, '', {d0: '2019-10', fp: /\be-?208\b|puretech ?(75|100|130)\b|\b1\.5 ?bluehdi|bluehdi ?130/}]], 'R'],
  ['307', '307', '307', '', [['1', 2001, 2008]], 'U'],
  ['308', '308', '308', '', [['1', 2007, 2014, '', {fp: /\b1\.6 ?hdi|\b1\.6 ?vti|\bthp\b|\b1\.4 ?vti|\bpremium\b/}], ['2', 2013, 2021, '', {d0: '2013-09', fp: /puretech ?(110|130)\b|bluehdi ?(100|120|130|150|180)\b|\b1\.2 ?puretech|gt ?line/}], ['3', 2021, 0, '', {d0: '2021-09', fp: /hybrid ?(180|225)|\be-?308\b/}]], 'R'],
  ['407', '407', '407', '', [['1', 2004, 2011]], 'U'],
  ['508', '508', '508', '', [['1', 2010, 2018], ['2', 2018, 0, '', {d0: '2018-09'}]], 'R'],
  ['2008', '2008', '2008', '', [['1', 2013, 2019, '', {d0: '2013-05'}], ['2', 2019, 0, '', {d0: '2019-12', fp: /\be-?2008\b|puretech ?(100|130|155)\b/}]], 'R'],
  ['3008', '3008', '3008', '', [['1', 2009, 2016], ['2', 2016, 2023, '', {d0: '2016-10'}], ['3', 2023, 0, '', {d0: '2024-01'}]], 'R'],
  ['5008', '5008', '5008', '', [['1', 2009, 2017], ['2', 2017, 2023, '', {d0: '2017-03'}], ['3', 2024, 0, '', {d0: '2024-09'}]], 'R'],
  ['Partner', 'partner', '', '', [['1', 1996, 2008], ['2', 2008, 2018], ['3', 2018, 0]], 'R'],
  ['Rifter', 'rifter', 'Rifter', '', [['1', 2018, 0]], 'U'],
 ]],
 ['Citroën', 'CITROEN', 1, '', [
  ['Saxo', 'saxo', 'Saxo', '', [['1', 1996, 2004]], 'U'],
  ['C1', 'c1', 'C1', '', [['1', 2005, 2014, '', {fp: /\b1\.4 ?hdi|\battraction\b|\bexclusive\b/}], ['2', 2014, 2022, '', {d0: '2014-06', fp: /\bairscape\b|\bfeel\b|\bshine\b|\borigins\b/}]], 'R'],
  ['C2', 'c2', 'C2', '', [['1', 2003, 2009]], 'U'],
  ['C3', 'c3', 'C3', '', [['1', 2002, 2010], ['2', 2009, 2016, '', {d0: '2009-11', fp: /\b1\.4 ?hdi|\b1\.6 ?e?-?hdi|\bvti\b|\battraction\b|\bexclusive\b|\bmillenium\b|\bcollection\b/}], ['3', 2016, 2024, '', {d0: '2016-12', fp: /bluehdi ?(75|100)\b|\bfeel\b|\bshine\b|c-?series|\bplus\b/}], ['4', 2024, 0, '', {d0: '2024-09', fp: /\be-?c3\b/}]], 'R'],
  ['C3 Picasso', 'c3picasso', 'C3 Picasso', 'c3 picasso', [['1', 2009, 2017]], 'U'],
  ['C3 Aircross', 'c3aircross', 'C3 Aircross', 'c3 aircross', [['1', 2017, 2024], ['2', 2024, 0]], 'R'],
  ['C4', 'c4', 'C4', '', [['1', 2004, 2010], ['2', 2010, 2018, '', {d0: '2010-10'}], ['3', 2020, 0, '', {d0: '2020-12'}]], 'R'],
  ['C4 Picasso', 'c4picasso', 'C4 Picasso', 'c4 picasso,grand c4 picasso,c4 spacetourer,grand c4 spacetourer,spacetourer', [['1', 2006, 2013], ['2', 2013, 2022, '', {d0: '2013-06'}]], 'R'],
  ['C4 Cactus', 'c4cactus', 'C4 Cactus', 'c4 cactus,cactus', [['1', 2014, 2020]], 'U'],
  ['C5', 'c5', 'C5', '', [['1', 2001, 2008], ['2', 2008, 2017]], 'R'],
  ['C5 Aircross', 'c5aircross', 'C5 Aircross', 'c5 aircross', [['1', 2018, 0]], 'U'],
  ['C-Elysée', 'celysee', 'C-Elysée', 'c-elysee,c elysee', [['1', 2012, 2020]], 'U'],
  ['Xsara Picasso', 'xsarapicasso', 'Xsara Picasso', 'xsara picasso', [['1', 1999, 2010]], 'U'],
  ['Xsara', 'xsara', 'Xsara', '', [['1', 1997, 2006]], 'U'],
  ['Berlingo', 'berlingo', 'Berlingo', '', [['1', 1996, 2010], ['2', 2008, 2018], ['3', 2018, 0]], 'R'],
 ]],
 ['DS', 'DS', 1, 'ds automobiles', [
  ['DS 3', 'ds3', 'DS 3', 'ds3,ds 3', [['1', 2010, 2019, 'DS 3 (2010 – 2019)'], ['crossback', 2019, 0, 'DS 3 Crossback', {a: ['crossback']}]]],
  ['DS 4', 'ds4', 'DS 4', 'ds4,ds 4', [['1', 2011, 2018], ['2', 2021, 0]], 'R'],
  ['DS 5', 'ds5', 'DS 5', 'ds5,ds 5', [['1', 2011, 2018]], 'U'],
  ['DS 7', 'ds7', 'DS 7', 'ds7,ds 7,ds7 crossback', [['1', 2018, 0]], 'U'],
 ]],
 ['Dacia', 'DACIA', 1, '', [
  ['Logan', 'logan', 'Logan', 'logan mcv', [['1', 2004, 2012], ['2', 2012, 2020, '', {d0: '2012-10'}], ['3', 2020, 0, '', {d0: '2021-01'}]]],
  ['Sandero', 'sandero', 'Sandero', 'sandero stepway,stepway', [['1', 2008, 2012, '', {fp: /\b1\.4 ?mpi|\b1\.6 ?mpi|\b1\.6 ?16v/}], ['2', 2012, 2020, '', {d0: '2012-11', fp: /\b0\.9 ?tce|\btce ?90\b|\b1\.0 ?sce|\bsce ?75\b/}], ['3', 2020, 0, '', {d0: '2020-12', fp: /\btce ?(90|100|110)\b|\beco-?g\b|\bexpression\b|\bjourney\b/}]]],
  ['Duster', 'duster', 'Duster', '', [['1', 2010, 2017], ['2', 2017, 2024, '', {d0: '2018-01'}], ['3', 2024, 0, '', {d0: '2024-05'}]]],
  ['Dokker', 'dokker', 'Dokker', '', [['1', 2012, 2021]], 'U'],
  ['Lodgy', 'lodgy', 'Lodgy', '', [['1', 2012, 2022]], 'U'],
  ['Spring', 'spring', 'Spring', '', [['1', 2021, 0]], 'U'],
  ['Jogger', 'jogger', 'Jogger', '', [['1', 2022, 0]], 'U'],
 ]],
 ['Volkswagen', 'VOLKSWAGEN', 1, 'vw', [
  ['Lupo', 'lupo', 'Lupo', '', [['1', 1998, 2005]], 'U'],
  ['Fox', 'fox', 'Fox', '', [['1', 2005, 2011]], 'U'],
  ['Up!', 'up', 'Up', 'up!,e-up', [['1', 2011, 2023]], 'U'],
  ['Polo', 'polo', 'Polo', '', [['3', 1994, 2002, '', {c: ['6n', '6n2']}], ['4', 2001, 2009, '', {c: ['9n', '9n3']}], ['5', 2009, 2017, '', {d0: '2009-06', c: ['6r', '6c'], fp: /\b1\.2 ?tsi|\b1\.2 ?(60|70) ?ch\b|\b1\.6 ?tdi|\b1\.4 ?tdi|\b1\.2 ?tdi|gti ?(180|192)\b/}], ['6', 2017, 0, '', {d0: '2017-09', c: ['aw'], fp: /\b1\.0 ?(tsi|mpi|evo)|\btsi ?(95|110|115)\b|gti ?(200|207)\b|\bunited\b/}]]],
  ['Golf', 'golf', 'Golf', 'golf sw,golf variant,golf break,golf gti,golf gtd,golf r', [['3', 1991, 1998, '', {c: ['1h']}], ['4', 1997, 2004, '', {c: ['1j'], t: [/\b(variant|sw|break|cabriolet|cabrio)\b/, 2006]}], ['5', 2003, 2009, '', {c: ['1k'], fp: /\b1\.9 ?tdi|\b1\.6 ?fsi|\b2\.0 ?fsi|\br32\b|\b1\.4 ?tsi ?(140|170)\b/}], ['6', 2008, 2013, '', {d0: '2008-10', c: ['5k'], t: [/\b(cabriolet|cabrio|decapotable)\b/, 2016], fp: /\b1\.2 ?tsi ?105|\b1\.4 ?tsi ?160|\b2\.0 ?tdi ?(110|140|170)\b|\bgti ?210\b|\br ?270\b|\bgtd ?170\b|\b1\.6 ?(102|tdi ?90)\b|\bmatch\b/}], ['7', 2012, 2020, '', {d0: '2012-11', a: ['7.5'], c: ['5g1'], fp: /\b1\.0 ?tsi|\b1\.5 ?tsi|\b1\.6 ?tdi ?(110|115)\b|\b2\.0 ?tdi ?(150|184)\b|\bgti ?(220|230|245)\b|\bgtd ?184\b|\br ?(300|310)\b|\bgte\b|e-?golf|\blounge\b|\bsound\b|iq ?\.?drive|\bconnect\b|\bjoin\b/}], ['8', 2019, 0, '', {d0: '2019-12', c: ['cd1'], fp: /\betsi\b|\blife\b|\bstyle\b|r-?line ?2021|\b1\.5 ?etsi/}]]],
  ['Golf Plus', 'golfplus', '', 'golf plus', [['1', 2005, 2014]], 'U'],
  ['Golf Sportsvan', 'golfsportsvan', '', 'golf sportsvan,sportsvan', [['1', 2014, 2020]], 'U'],
  ['Coccinelle', 'beetle', '', 'coccinelle,beetle,new beetle', [['1', 1998, 2011, 'New Beetle', {a: ['new']}], ['2', 2011, 2019, 'Coccinelle (2011 – 2019)']]],
  ['Scirocco', 'scirocco', 'Scirocco', '', [['3', 2008, 2017]], 'U'],
  ['Passat', 'passat', 'Passat', 'passat sw,passat variant', [['b5', 1996, 2005], ['b6', 2005, 2010], ['b7', 2010, 2015], ['b8', 2014, 2023], ['b9', 2024, 0]], 'C'],
  ['Touran', 'touran', 'Touran', '', [['1', 2003, 2015], ['2', 2015, 0, '', {d0: '2015-09'}]]],
  ['Tiguan', 'tiguan', 'Tiguan', 'tiguan allspace', [['1', 2007, 2016], ['2', 2016, 2024, '', {d0: '2016-04'}], ['3', 2024, 0, '', {d0: '2024-03'}]]],
  ['T-Roc', 'troc', 'T-Roc', 't-roc,t roc', [['1', 2017, 0]], 'U'],
  ['T-Cross', 'tcross', 'T-Cross', 't-cross,t cross', [['1', 2019, 0]], 'U'],
  ['Taigo', 'taigo', 'Taigo', '', [['1', 2021, 0]], 'U'],
  ['ID.3', 'id3', 'ID.3', 'id.3,id 3', [['1', 2020, 0]], 'U'],
  ['Caddy', 'caddy', 'Caddy', '', [['3', 2004, 2015], ['4', 2015, 2020], ['5', 2020, 0]]],
  ['Sharan', 'sharan', 'Sharan', '', [['1', 1995, 2010], ['2', 2010, 2022]]],
 ]],
 ['Toyota', 'TOYOTA', 1, '', [
  ['Aygo', 'aygo', 'Aygo', '', [['1', 2005, 2014, '', {fp: /\b68 ?ch\b/}], ['2', 2014, 2022, '', {d0: '2014-06', fp: /\bx-?(play|cite|clusiv|wave|trend|shine|look|pure|cellent)\b/}]]],
  ['Aygo X', 'aygox', 'Aygo X', 'aygo x,aygox', [['1', 2022, 0]], 'U'],
  ['Yaris', 'yaris', 'Yaris', '', [['1', 1999, 2005], ['2', 2005, 2011, '', {fp: /\b1\.3 ?vvt-?i ?87|\b87 ?ch\b/}], ['3', 2011, 2020, '', {d0: '2011-09', fp: /\bhybrid(e)?\b|\bhsd\b/}], ['4', 2020, 0, '', {d0: '2020-09', fp: /\b1\.5 ?(vvt|hybrid)|\b116 ?h\b|\b130 ?h\b|gr ?sport|\bgr\b/}]]],
  ['Yaris Cross', 'yariscross', 'Yaris Cross', 'yaris cross', [['1', 2021, 0]], 'U'],
  ['Auris', 'auris', 'Auris', '', [['1', 2007, 2012], ['2', 2012, 2019, '', {d0: '2013-01'}]]],
  ['Corolla', 'corolla', 'Corolla', 'corolla touring sports', [['9', 2002, 2007, 'Corolla (E12)'], ['12', 2019, 0, 'Corolla (E21)', {d0: '2019-03'}]]],
  ['C-HR', 'chr', 'C-HR', 'c-hr,chr', [['1', 2016, 2023], ['2', 2023, 0, '', {d0: '2024-01'}]]],
  ['RAV4', 'rav4', 'RAV4', 'rav 4,rav-4', [['3', 2006, 2012], ['4', 2013, 2018], ['5', 2019, 0]]],
  ['Prius', 'prius', 'Prius', 'prius+', [['2', 2003, 2009], ['3', 2009, 2015], ['4', 2016, 2022]]],
  ['Verso', 'verso', 'Verso', '', [['1', 2009, 2018]], 'U'],
  ['iQ', 'iq', 'iQ', '', [['1', 2009, 2014]], 'U'],
 ]],
 ['Ford', 'FORD', 1, '', [
  ['Ka', 'ka', 'Ka', 'ka+', [['1', 1996, 2008], ['2', 2008, 2016], ['plus', 2016, 2019, 'Ka+', {a: ['+']}]]],
  ['Fiesta', 'fiesta', 'Fiesta', '', [['4', 1995, 2002], ['5', 2002, 2008], ['6', 2008, 2017, '', {d0: '2008-09', fp: /\b1\.25\b|\b1\.4 ?tdci ?(68|70)\b|\b1\.6 ?tdci ?(90|95)\b|\bpowershift\b/}], ['7', 2017, 2023, '', {d0: '2017-06', fp: /\b1\.1 ?(70|75|85)\b|st-?line ?x|\bvignale\b|\bactive\b|\b1\.0 ?ecoboost ?(100|125|140) ?mhev|\bmhev\b/}]]],
  ['Focus', 'focus', 'Focus', '', [['1', 1998, 2004], ['2', 2004, 2011], ['3', 2011, 2018, '', {d0: '2011-03'}], ['4', 2018, 2025, '', {d0: '2018-09'}]]],
  ['Fusion', 'fusion', 'Fusion', '', [['1', 2002, 2012]], 'U'],
  ['B-Max', 'bmax', 'B-MAX', 'b-max,b max', [['1', 2012, 2017]], 'U'],
  ['C-Max', 'cmax', 'C-MAX', 'c-max,c max,grand c-max', [['1', 2003, 2010], ['2', 2010, 2019]]],
  ['EcoSport', 'ecosport', 'EcoSport', 'eco sport', [['1', 2014, 2022]], 'U'],
  ['Puma', 'puma', 'Puma', '', [['2', 2019, 0]], 'U'],
  ['Kuga', 'kuga', 'Kuga', '', [['1', 2008, 2012], ['2', 2012, 2019, '', {d0: '2013-01'}], ['3', 2019, 0, '', {d0: '2020-01'}]]],
  ['Mondeo', 'mondeo', 'Mondeo', '', [['3', 2000, 2007], ['4', 2007, 2014], ['5', 2014, 2022]]],
  ['S-Max', 'smax', 'S-MAX', 's-max,s max', [['1', 2006, 2015], ['2', 2015, 2023]]],
 ]],
 ['Opel', 'OPEL', 1, '', [
  ['Agila', 'agila', 'Agila', '', [['a', 2000, 2007], ['b', 2008, 2014]]],
  ['Adam', 'adam', 'Adam', '', [['1', 2013, 2019]], 'U'],
  ['Karl', 'karl', 'Karl', '', [['1', 2015, 2019]], 'U'],
  ['Corsa', 'corsa', 'Corsa', '', [['b', 1993, 2000], ['c', 2000, 2006], ['d', 2006, 2014, '', {d0: '2006-09', fp: /\b1\.2 ?(80|85)\b|\b1\.0 ?(60|65)\b|\bcosmo\b|\benjoy\b/}], ['e', 2014, 2019, '', {d0: '2014-11', fp: /\b1\.0 ?(ecotec|turbo)|\b1\.4 ?(90|100) ?ch\b|\bbusiness edition\b|\bplay\b|\bblack edition\b/}], ['f', 2019, 0, '', {d0: '2019-11', fp: /corsa-?e\b|\bpuretech\b|\b1\.2 ?(75|100|130)\b|\bgs ?line\b|\belegance\b/}]]],
  ['Astra', 'astra', 'Astra', 'astra sports tourer', [['f', 1991, 1998], ['g', 1998, 2004], ['h', 2004, 2010], ['j', 2009, 2015, '', {d0: '2009-12'}], ['k', 2015, 2021, '', {d0: '2015-10'}], ['l', 2021, 0, '', {d0: '2022-01'}]]],
  ['Meriva', 'meriva', 'Meriva', '', [['a', 2003, 2010], ['b', 2010, 2017]]],
  ['Zafira', 'zafira', '', 'zafira tourer', [['a', 1999, 2005], ['b', 2005, 2014], ['c', 2011, 2019, 'Zafira Tourer (C)', {a: ['tourer']}]]],
  ['Mokka', 'mokka', '', 'mokka x', [['1', 2012, 2019], ['2', 2020, 0, '', {d0: '2021-01', fp: /mokka-?e\b|\bpuretech\b|\b1\.2 ?(100|130)\b/}]]],
  ['Crossland', 'crossland', '', 'crossland x', [['1', 2017, 0]], 'U'],
  ['Grandland', 'grandland', '', 'grandland x', [['1', 2017, 2024], ['2', 2024, 0]]],
  ['Insignia', 'insignia', 'Insignia', '', [['a', 2008, 2017], ['b', 2017, 2022]]],
 ]],
 ['Fiat', 'FIAT', 1, '', [
  ['500', '500', '500', 'fiat 500,500c', [['1', 2007, 2024, '500 (2007 – 2024)']], 'U'],
  ['500e', '500e', '', '500e,500 electrique,500 e', [['1', 2020, 0]], 'U'],
  ['500X', '500x', '500X', '500 x', [['1', 2014, 0]], 'U'],
  ['500L', '500l', '500L', '500 l', [['1', 2012, 2022]], 'U'],
  ['Panda', 'panda', 'Panda', '', [['2', 2003, 2012], ['3', 2012, 2024, '', {d0: '2012-02'}]]],
  ['Grande Panda', 'grandepanda', '', 'grande panda', [['1', 2025, 0]], 'U'],
  ['Punto', 'punto', 'Punto', 'grande punto,punto evo', [['2', 1999, 2010], ['3', 2005, 2018, 'Punto 3 (Grande Punto, Evo)', {a: ['grande', 'evo'], d0: '2005-10'}]]],
  ['Tipo', 'tipo', 'Tipo', '', [['1', 2016, 0]], 'U'],
  ['Bravo', 'bravo', 'Bravo', '', [['2', 2007, 2014]], 'U'],
  ['Doblo', 'doblo', 'Doblo', 'doblò', [['1', 2001, 2010], ['2', 2010, 2022]]],
 ]],
 ['Nissan', 'NISSAN', 1, '', [
  ['Micra', 'micra', 'Micra', '', [['3', 2003, 2010, '', {c: ['k12']}], ['4', 2010, 2017, '', {c: ['k13']}], ['5', 2017, 2023, '', {c: ['k14'], d0: '2017-03'}]]],
  ['Note', 'note', 'Note', '', [['1', 2006, 2013], ['2', 2013, 2017]]],
  ['Juke', 'juke', 'Juke', '', [['1', 2010, 2019], ['2', 2019, 0, '', {d0: '2019-11'}]]],
  ['Qashqai', 'qashqai', 'Qashqai', 'qashqai+2', [['1', 2007, 2013], ['2', 2014, 2021, '', {d0: '2014-02'}], ['3', 2021, 0, '', {d0: '2021-06'}]]],
  ['X-Trail', 'xtrail', 'X-Trail', 'x-trail,x trail', [['2', 2007, 2014], ['3', 2014, 2022], ['4', 2022, 0]]],
  ['Leaf', 'leaf', 'Leaf', '', [['1', 2011, 2017], ['2', 2018, 0]]],
 ]],
 ['Seat', 'SEAT', 1, '', [
  ['Mii', 'mii', 'Mii', '', [['1', 2011, 2021]], 'U'],
  ['Ibiza', 'ibiza', 'Ibiza', '', [['2', 1993, 2002], ['3', 2002, 2008, '', {c: ['6l']}], ['4', 2008, 2017, '', {c: ['6j', '6p'], d0: '2008-05'}], ['5', 2017, 0, '', {c: ['6f', 'kj'], d0: '2017-06'}]]],
  ['Leon', 'leon', 'Leon', 'leon st', [['1', 1999, 2005], ['2', 2005, 2012], ['3', 2012, 2020, '', {c: ['5f'], d0: '2012-11'}], ['4', 2020, 0, '', {c: ['kl'], d0: '2020-05'}]]],
  ['Arona', 'arona', 'Arona', '', [['1', 2017, 0]], 'U'],
  ['Ateca', 'ateca', 'Ateca', '', [['1', 2016, 0]], 'U'],
  ['Altea', 'altea', 'Altea', 'altea xl', [['1', 2004, 2015]], 'U'],
  ['Alhambra', 'alhambra', 'Alhambra', '', [['1', 1996, 2010], ['2', 2010, 2020]]],
 ]],
 ['Cupra', 'CUPRA', 1, '', [
  ['Formentor', 'formentor', 'Formentor', '', [['1', 2020, 0]], 'U'],
  ['Born', 'born', 'Born', '', [['1', 2021, 0]], 'U'],
 ]],
 ['Skoda', 'SKODA', 1, 'škoda', [
  ['Citigo', 'citigo', 'Citigo', '', [['1', 2011, 2020]], 'U'],
  ['Fabia', 'fabia', 'Fabia', '', [['1', 1999, 2007], ['2', 2007, 2014], ['3', 2014, 2021, '', {d0: '2014-10'}], ['4', 2021, 0, '', {d0: '2021-09'}]]],
  ['Rapid', 'rapid', 'Rapid', 'rapid spaceback', [['1', 2012, 2019]], 'U'],
  ['Scala', 'scala', 'Scala', '', [['1', 2019, 0]], 'U'],
  ['Octavia', 'octavia', 'Octavia', 'octavia combi', [['1', 1996, 2010], ['2', 2004, 2013], ['3', 2013, 2020, '', {d0: '2013-02'}], ['4', 2020, 0, '', {d0: '2020-06'}]]],
  ['Roomster', 'roomster', 'Roomster', '', [['1', 2006, 2015]], 'U'],
  ['Yeti', 'yeti', 'Yeti', '', [['1', 2009, 2017]], 'U'],
  ['Kamiq', 'kamiq', 'Kamiq', '', [['1', 2019, 0]], 'U'],
  ['Karoq', 'karoq', 'Karoq', '', [['1', 2017, 0]], 'U'],
  ['Kodiaq', 'kodiaq', 'Kodiaq', '', [['1', 2016, 2024], ['2', 2024, 0]]],
  ['Superb', 'superb', 'Superb', '', [['2', 2008, 2015], ['3', 2015, 2023], ['4', 2024, 0]]],
 ]],
 ['Kia', 'KIA', 1, '', [
  ['Picanto', 'picanto', 'Picanto', '', [['1', 2004, 2011], ['2', 2011, 2017, '', {d0: '2011-04'}], ['3', 2017, 0, '', {d0: '2017-04'}]]],
  ['Rio', 'rio', 'Rio', '', [['2', 2005, 2011], ['3', 2011, 2017, '', {d0: '2011-09'}], ['4', 2017, 2023, '', {d0: '2017-03'}]]],
  ['Venga', 'venga', 'Venga', '', [['1', 2010, 2019]], 'U'],
  ['Stonic', 'stonic', 'Stonic', '', [['1', 2017, 0]], 'U'],
  ['Ceed', 'ceed', 'Ceed', "cee'd,cee d,ceed sw,proceed", [['1', 2006, 2012], ['2', 2012, 2018, '', {d0: '2012-05'}], ['3', 2018, 0, '', {d0: '2018-06'}]]],
  ['Soul', 'soul', 'Soul', '', [['1', 2009, 2014], ['2', 2014, 2019]]],
  ['Niro', 'niro', 'Niro', 'e-niro', [['1', 2016, 2022], ['2', 2022, 0]]],
  ['Sportage', 'sportage', 'Sportage', '', [['2', 2004, 2010], ['3', 2010, 2015], ['4', 2016, 2021], ['5', 2022, 0]]],
 ]],
 ['Hyundai', 'HYUNDAI', 1, '', [
  ['Getz', 'getz', 'Getz', '', [['1', 2002, 2011]], 'U'],
  ['i10', 'i10', 'i10', '', [['1', 2008, 2013], ['2', 2013, 2019, '', {d0: '2014-01'}], ['3', 2020, 0, '', {d0: '2020-01'}]]],
  ['i20', 'i20', 'i20', '', [['1', 2009, 2014], ['2', 2015, 2020, '', {d0: '2015-01'}], ['3', 2020, 0, '', {d0: '2020-10'}]]],
  ['i30', 'i30', 'i30', '', [['1', 2007, 2012], ['2', 2012, 2017, '', {d0: '2012-03'}], ['3', 2017, 0, '', {d0: '2017-03'}]]],
  ['ix20', 'ix20', 'ix20', 'ix 20', [['1', 2010, 2019]], 'U'],
  ['ix35', 'ix35', 'ix35', 'ix 35', [['1', 2010, 2015]], 'U'],
  ['Tucson', 'tucson', 'Tucson', '', [['1', 2004, 2010], ['3', 2015, 2020], ['4', 2021, 0]]],
  ['Kona', 'kona', 'Kona', '', [['1', 2017, 2023], ['2', 2023, 0]]],
  ['Bayon', 'bayon', 'Bayon', '', [['1', 2021, 0]], 'U'],
 ]],
 ['Suzuki', 'SUZUKI', 1, '', [
  ['Alto', 'alto', 'Alto', '', [['1', 2009, 2014]], 'U'],
  ['Splash', 'splash', 'Splash', '', [['1', 2008, 2014]], 'U'],
  ['Celerio', 'celerio', 'Celerio', '', [['1', 2014, 2020]], 'U'],
  ['Swift', 'swift', 'Swift', '', [['1', 2005, 2010, 'Swift (2005 – 2010)'], ['2', 2010, 2017, 'Swift (2010 – 2017)', {d0: '2010-09'}], ['3', 2017, 2024, 'Swift (2017 – 2024)', {d0: '2017-04'}], ['4', 2024, 0, 'Swift (depuis 2024)', {d0: '2024-05'}]]],
  ['Ignis', 'ignis', 'Ignis', '', [['1', 2016, 0]], 'U'],
  ['Vitara', 'vitara', 'Vitara', '', [['1', 2015, 0]], 'U'],
  ['SX4', 'sx4', 'SX4', 'sx4 s-cross,s-cross,s cross', [['1', 2006, 2014, 'SX4 (2006 – 2014)'], ['2', 2013, 0, 'S-Cross (depuis 2013)', {a: ['s-cross', 'scross']}]]],
  ['Jimny', 'jimny', 'Jimny', '', [['3', 1998, 2018], ['4', 2018, 0]]],
 ]],
 ['Mazda', 'MAZDA', 1, '', [
  ['Mazda 2', 'mazda2', 'Mazda 2', 'mazda 2,mazda2', [['dy', 2003, 2007], ['de', 2007, 2014], ['dj', 2014, 0]], 'C'],
  ['Mazda 3', 'mazda3', 'Mazda 3', 'mazda 3,mazda3', [['bk', 2003, 2009], ['bl', 2009, 2013], ['bm', 2013, 2019, '', {a: ['bn']}], ['bp', 2019, 0]], 'C'],
  ['Mazda 5', 'mazda5', 'Mazda 5', 'mazda 5,mazda5', [['1', 2005, 2015]], 'U'],
  ['Mazda 6', 'mazda6', 'Mazda 6', 'mazda 6,mazda6', [['gg', 2002, 2008], ['gh', 2008, 2012], ['gj', 2012, 0]], 'C'],
  ['CX-3', 'cx3', 'CX-3', 'cx-3,cx 3', [['1', 2015, 2022]], 'U'],
  ['CX-5', 'cx5', 'CX-5', 'cx-5,cx 5', [['1', 2012, 2017], ['2', 2017, 0]]],
  ['MX-5', 'mx5', 'MX-5', 'mx-5,mx 5', [['nb', 1998, 2005], ['nc', 2005, 2015], ['nd', 2015, 0]], 'C'],
 ]],
 ['Honda', 'HONDA', 1, '', [
  ['Jazz', 'jazz', 'Jazz', '', [['1', 2002, 2008], ['2', 2008, 2015, '', {d0: '2008-10'}], ['3', 2015, 2020, '', {d0: '2015-09'}], ['4', 2020, 0, '', {d0: '2020-06', fp: /e:?hev|hybrid/}]]],
  ['Civic', 'civic', 'Civic', '', [['7', 2001, 2006], ['8', 2006, 2012], ['9', 2012, 2017], ['10', 2017, 2022], ['11', 2022, 0]]],
  ['CR-V', 'crv', 'CR-V', 'cr-v,cr v', [['2', 2002, 2006], ['3', 2007, 2012], ['4', 2012, 2018], ['5', 2018, 2023]]],
  ['HR-V', 'hrv', 'HR-V', 'hr-v,hr v', [['2', 2015, 2021], ['3', 2021, 0]]],
 ]],
 ['Mini', 'MINI', 1, '', [
  ['Mini', 'mini', '', 'cooper,one,cooper s,mini cooper,mini one,mini cabrio', [['1', 2001, 2006, 'Mini (R50 / R53)', {c: ['r50', 'r52', 'r53']}], ['2', 2006, 2014, 'Mini (R56)', {c: ['r56', 'r57', 'r58', 'r59'], d0: '2006-11', fp: /\b1\.6\b|cooper s ?(175|184)\b|cooper ?122\b|\bone ?(75|98)\b|cooper d ?(110|112)\b/}], ['3', 2014, 2024, 'Mini (F56)', {c: ['f55', 'f56', 'f57'], d0: '2014-03', fp: /\b1\.5\b|cooper s ?192\b|cooper ?136\b|\bone ?102\b|cooper d ?116\b/}], ['4', 2024, 0, 'Mini (depuis 2024)', {c: ['f65', 'f66', 'j01'], d0: '2024-03'}]]],
  ['Clubman', 'clubman', 'Clubman', 'mini clubman', [['r55', 2007, 2014], ['f54', 2015, 2024]], 'C'],
  ['Countryman', 'countryman', 'Countryman', 'mini countryman', [['r60', 2010, 2017], ['f60', 2017, 2024], ['u25', 2024, 0]], 'C'],
 ]],
 ['BMW', 'BMW', 1, '', [
  ['Série 1', 'serie1', 'Série 1', 'serie 1', [['e87', 2004, 2011, '', {c: ['e81', 'e82', 'e88']}], ['f20', 2011, 2019, '', {c: ['f21'], d0: '2011-09'}], ['f40', 2019, 2024, '', {d0: '2019-09'}], ['f70', 2024, 0, '', {d0: '2024-10'}]], 'C'],
  ['Série 2', 'serie2', 'Série 2', 'serie 2,serie 2 coupe,serie 2 cabriolet', [['f22', 2014, 2021, '', {c: ['f23']}], ['g42', 2021, 0]], 'C'],
  ['Série 2 Active Tourer', 'serie2at', '', 'active tourer,serie 2 active tourer,gran tourer,serie 2 gran tourer', [['f45', 2014, 2021, '', {c: ['f46']}], ['u06', 2022, 0]], 'C'],
  ['Série 3', 'serie3', 'Série 3', 'serie 3', [['e46', 1998, 2005], ['e90', 2005, 2012, '', {c: ['e91', 'e92', 'e93']}], ['f30', 2012, 2019, '', {c: ['f31', 'f34'], d0: '2012-02'}], ['g20', 2019, 0, '', {c: ['g21'], d0: '2019-03'}]], 'C'],
  ['Série 4', 'serie4', 'Série 4', 'serie 4', [['f32', 2013, 2020, '', {c: ['f33', 'f36']}], ['g22', 2020, 0, '', {c: ['g23', 'g26']}]], 'C'],
  ['Série 5', 'serie5', 'Série 5', 'serie 5', [['e39', 1995, 2003], ['e60', 2003, 2010, '', {c: ['e61']}], ['f10', 2010, 2017, '', {c: ['f11', 'f07']}], ['g30', 2017, 2023, '', {c: ['g31']}], ['g60', 2023, 0, '', {c: ['g61']}]], 'C'],
  ['X1', 'x1', 'X1', '', [['e84', 2009, 2015], ['f48', 2015, 2022, '', {d0: '2015-10'}], ['u11', 2022, 0, '', {d0: '2022-10'}]], 'C'],
  ['X3', 'x3', 'X3', '', [['e83', 2004, 2010], ['f25', 2010, 2017], ['g01', 2017, 2024], ['g45', 2024, 0]], 'C'],
  ['X5', 'x5', 'X5', '', [['e70', 2007, 2013], ['f15', 2013, 2018], ['g05', 2018, 0]], 'C'],
  ['i3', 'i3', 'i3', '', [['1', 2013, 2022]], 'U'],
 ]],
 ['Audi', 'AUDI', 1, '', [
  ['A1', 'a1', 'A1', 'a1 sportback', [['8x', 2010, 2018, '', {d0: '2010-08'}], ['gb', 2018, 0, '', {d0: '2018-11'}]], 'C'],
  ['A3', 'a3', 'A3', 'a3 sportback', [['8l', 1996, 2003], ['8p', 2003, 2013, '', {d0: '2003-05'}], ['8v', 2012, 2020, '', {d0: '2012-06'}], ['8y', 2020, 0, '', {d0: '2020-05'}]], 'C'],
  ['A4', 'a4', 'A4', 'a4 avant', [['b6', 2000, 2004], ['b7', 2004, 2008], ['b8', 2007, 2015], ['b9', 2015, 2024]], 'C'],
  ['A5', 'a5', 'A5', 'a5 sportback', [['8t', 2007, 2016], ['f5', 2016, 2024]], 'C'],
  ['A6', 'a6', 'A6', 'a6 avant', [['c5', 1997, 2004], ['c6', 2004, 2011], ['c7', 2011, 2018], ['c8', 2018, 0]], 'C'],
  ['Q2', 'q2', 'Q2', '', [['1', 2016, 0]], 'U'],
  ['Q3', 'q3', 'Q3', 'q3 sportback', [['8u', 2011, 2018], ['f3', 2018, 0, '', {d0: '2018-10'}]], 'C'],
  ['Q5', 'q5', 'Q5', 'q5 sportback', [['8r', 2008, 2017], ['fy', 2017, 0]], 'C'],
  ['TT', 'tt', 'TT', '', [['8n', 1998, 2006], ['8j', 2006, 2014], ['8s', 2014, 2023]], 'C'],
 ]],
 ['Mercedes-Benz', 'MERCEDES-BENZ', 1, 'mercedes,mercedes benz,mb', [
  ['Classe A', 'classea', 'Classe A', 'classe a', [['w168', 1997, 2004], ['w169', 2004, 2012], ['w176', 2012, 2018, '', {d0: '2012-09'}], ['w177', 2018, 0, '', {c: ['v177'], d0: '2018-05'}]], 'C'],
  ['Classe B', 'classeb', 'Classe B', 'classe b', [['w245', 2005, 2011], ['w246', 2011, 2018, '', {d0: '2011-11'}], ['w247', 2019, 0, '', {d0: '2019-02'}]], 'C'],
  ['Classe C', 'classec', 'Classe C', 'classe c', [['w203', 2000, 2007, '', {c: ['s203', 'cl203']}], ['w204', 2007, 2014, '', {c: ['s204', 'c204']}], ['w205', 2014, 2021, '', {c: ['s205', 'c205', 'a205'], d0: '2014-03'}], ['w206', 2021, 0, '', {c: ['s206'], d0: '2021-06'}]], 'C'],
  ['Classe E', 'classee', 'Classe E', 'classe e', [['w211', 2002, 2009, '', {c: ['s211']}], ['w212', 2009, 2016, '', {c: ['s212']}], ['w213', 2016, 2023, '', {c: ['s213']}], ['w214', 2023, 0]], 'C'],
  ['CLA', 'cla', 'Classe CLA', 'cla shooting brake', [['c117', 2013, 2019, '', {c: ['x117']}], ['c118', 2019, 0, '', {c: ['x118']}]], 'C'],
  ['GLA', 'gla', 'Classe GLA', '', [['x156', 2014, 2019], ['h247', 2020, 0]], 'C'],
  ['GLC', 'glc', 'Classe GLC', 'glc coupe', [['x253', 2015, 2022, '', {c: ['c253']}], ['x254', 2022, 0]], 'C'],
 ]],
 ['Smart', 'SMART', 1, '', [
  ['Fortwo', 'fortwo', 'Fortwo', 'fortwo,for two,smart fortwo', [['450', 1998, 2007, 'Fortwo (450)'], ['451', 2007, 2014, 'Fortwo (451)'], ['453', 2014, 2024, 'Fortwo (453)']]],
  ['Forfour', 'forfour', 'Forfour', 'forfour,for four', [['454', 2004, 2006, 'Forfour (454)'], ['453', 2014, 2021, 'Forfour (453)']]],
 ]],
 ['Mitsubishi', 'MITSUBISHI', 1, '', [
  ['Colt', 'colt', 'Colt', '', [['6', 2004, 2012]], 'U'],
  ['Space Star', 'spacestar', 'Space Star', 'space star', [['2', 2013, 0]], 'U'],
  ['ASX', 'asx', 'ASX', '', [['1', 2010, 2023], ['2', 2023, 0]]],
  ['Outlander', 'outlander', 'Outlander', '', [['2', 2007, 2012], ['3', 2012, 2021]]],
 ]],
 ['Chevrolet', 'CHEVROLET', 1, '', [
  ['Matiz', 'matiz', 'Matiz', '', [['1', 2005, 2010]], 'U'],
  ['Spark', 'spark', 'Spark', '', [['1', 2010, 2015]], 'U'],
  ['Aveo', 'aveo', 'Aveo', 'kalos', [['1', 2006, 2011], ['2', 2011, 2015]]],
  ['Cruze', 'cruze', 'Cruze', '', [['1', 2009, 2015]], 'U'],
  ['Captiva', 'captiva', 'Captiva', '', [['1', 2006, 2015]], 'U'],
 ]],
 ['Alfa Romeo', 'ALFA ROMEO', 1, 'alfa', [
  ['MiTo', 'mito', 'MiTo', '', [['1', 2008, 2018]], 'U'],
  ['Giulietta', 'giulietta', 'Giulietta', '', [['1', 2010, 2020]], 'U'],
  ['147', '147', '147', '', [['1', 2000, 2010]], 'U'],
  ['159', '159', '159', '', [['1', 2005, 2011]], 'U'],
  ['Giulia', 'giulia', 'Giulia', '', [['1', 2016, 0]], 'U'],
  ['Stelvio', 'stelvio', 'Stelvio', '', [['1', 2017, 0]], 'U'],
  ['Tonale', 'tonale', 'Tonale', '', [['1', 2022, 0]], 'U'],
 ]],
 ['Jeep', 'JEEP', 1, '', [
  ['Renegade', 'renegade', 'Renegade', '', [['1', 2014, 0]], 'U'],
  ['Compass', 'compass', 'Compass', '', [['1', 2006, 2016], ['2', 2017, 0]]],
  ['Avenger', 'avenger', 'Avenger', '', [['1', 2023, 0]], 'U'],
 ]],
 ['Volvo', 'VOLVO', 1, '', [
  ['C30', 'c30', 'C30', '', [['1', 2006, 2013]], 'U'],
  ['V40', 'v40', 'V40', '', [['2', 2012, 2019]], 'U'],
  ['V60', 'v60', 'V60', '', [['1', 2010, 2018], ['2', 2018, 0]]],
  ['XC40', 'xc40', 'XC40', '', [['1', 2017, 0]], 'U'],
  ['XC60', 'xc60', 'XC60', '', [['1', 2008, 2017], ['2', 2017, 0]]],
  ['XC90', 'xc90', 'XC90', '', [['2', 2015, 0]], 'U'],
 ]],
 ['Lancia', 'LANCIA', 1, '', [
  ['Ypsilon', 'ypsilon', 'Ypsilon', '', [['2', 2003, 2011], ['3', 2011, 2024], ['4', 2024, 0]]],
 ]],
 ['MG', 'MG', 0, 'mg motor', [
  ['ZS', 'zs', '', 'zs ev', [['1', 2019, 0]], 'U'],
  ['MG3', 'mg3', '', 'mg 3', [['2', 2024, 0]], 'U'],
  ['MG4', 'mg4', '', 'mg 4', [['1', 2022, 0]], 'U'],
  ['HS', 'hs', '', '', [['1', 2019, 0]], 'U'],
 ]],
 ['Tesla', 'TESLA', 1, '', [
  ['Model 3', 'model3', 'Model 3', 'model 3', [['1', 2019, 0]], 'U'],
  ['Model Y', 'modely', 'Model Y', 'model y', [['1', 2021, 0]], 'U'],
  ['Model S', 'models', 'Model S', 'model s', [['1', 2013, 0]], 'U'],
 ]],
];
/* Plus tard (sportives et luxe) : Porsche, Lamborghini, Ferrari, Maserati, Bentley, Aston Martin, Land Rover… */

/* ================= Versions et carrosseries d'une génération (codes châssis, années propres) =================
   [id, libellé, année début, année fin (0 = encore vendue), carrosserie, regex facultative, codes châssis facultatifs]
   carrosseries : hayon (berline à hayon, 5 portes), berline (4 portes à coffre), 3p, break, coupe, cabriolet, gt, monospace.
   La première version de la liste est la version « par défaut » (celle qu'on suppose quand l'annonce ne dit rien). */
const CAT_VAR = {
 // ---- BMW
 'bmw serie1 e87': [['e87', 'E87 5 portes', 2004, 2011, 'hayon'], ['e81', 'E81 3 portes', 2007, 2011, '3p'], ['e82', 'E82 Coupé', 2007, 2013, 'coupe'], ['e88', 'E88 Cabriolet', 2008, 2013, 'cabriolet']],
 'bmw serie1 f20': [['f20', 'F20 5 portes', 2011, 2019, 'hayon'], ['f21', 'F21 3 portes', 2012, 2019, '3p']],
 'bmw serie2 f22': [['f22', 'F22 Coupé', 2014, 2021, 'coupe'], ['f23', 'F23 Cabriolet', 2015, 2021, 'cabriolet']],
 'bmw serie2 g42': [['g42', 'G42 Coupé', 2021, 0, 'coupe']],
 'bmw serie2at f45': [['f45', 'F45 Active Tourer', 2014, 2021, 'monospace'], ['f46', 'F46 Gran Tourer (7 places)', 2015, 2022, 'monospace', /\bgran tourer\b/]],
 'bmw serie3 e46': [['e46', 'E46 Berline', 1998, 2005, 'berline'], ['e46t', 'E46 Touring', 1999, 2005, 'break'], ['e46c', 'E46 Coupé', 1999, 2006, 'coupe'], ['e46cab', 'E46 Cabriolet', 2000, 2007, 'cabriolet'], ['e46cp', 'E46 Compact', 2001, 2004, '3p', /\bcompact\b/]],
 'bmw serie3 e90': [['e90', 'E90 Berline', 2005, 2012, 'berline'], ['e91', 'E91 Touring', 2005, 2012, 'break'], ['e92', 'E92 Coupé', 2006, 2013, 'coupe'], ['e93', 'E93 Cabriolet', 2007, 2013, 'cabriolet']],
 'bmw serie3 f30': [['f30', 'F30 Berline', 2012, 2019, 'berline'], ['f31', 'F31 Touring', 2012, 2019, 'break'], ['f34', 'F34 Gran Turismo', 2013, 2020, 'gt', /\b(gran turismo|gt)\b(?! ?line)/]],
 'bmw serie3 g20': [['g20', 'G20 Berline', 2019, 0, 'berline'], ['g21', 'G21 Touring', 2019, 0, 'break']],
 'bmw serie4 f32': [['f32', 'F32 Coupé', 2013, 2020, 'coupe'], ['f33', 'F33 Cabriolet', 2014, 2020, 'cabriolet'], ['f36', 'F36 Gran Coupé', 2014, 2021, 'hayon', /\bgran coupe\b/]],
 'bmw serie4 g22': [['g22', 'G22 Coupé', 2020, 0, 'coupe'], ['g23', 'G23 Cabriolet', 2021, 0, 'cabriolet'], ['g26', 'G26 Gran Coupé', 2021, 0, 'hayon', /\bgran coupe\b/]],
 'bmw serie5 e60': [['e60', 'E60 Berline', 2003, 2010, 'berline'], ['e61', 'E61 Touring', 2004, 2010, 'break']],
 'bmw serie5 f10': [['f10', 'F10 Berline', 2010, 2017, 'berline'], ['f11', 'F11 Touring', 2010, 2017, 'break'], ['f07', 'F07 Gran Turismo', 2009, 2017, 'gt', /\b(gran turismo|gt)\b(?! ?line)/]],
 'bmw serie5 g30': [['g30', 'G30 Berline', 2017, 2023, 'berline'], ['g31', 'G31 Touring', 2017, 2024, 'break']],
 'bmw serie5 g60': [['g60', 'G60 Berline', 2023, 0, 'berline'], ['g61', 'G61 Touring', 2024, 0, 'break']],
 // ---- Mercedes-Benz
 'mercedes classea w177': [['w177', 'W177 5 portes', 2018, 0, 'hayon'], ['v177', 'V177 Berline 4 portes', 2019, 0, 'berline', /\b(berline|limousine|sedan|4 portes)\b/]],
 'mercedes classec w203': [['w203', 'W203 Berline', 2000, 2007, 'berline'], ['s203', 'S203 Break', 2001, 2007, 'break'], ['cl203', 'CL203 Sport Coupé', 2001, 2008, 'coupe']],
 'mercedes classec w204': [['w204', 'W204 Berline', 2007, 2014, 'berline'], ['s204', 'S204 Break', 2007, 2014, 'break'], ['c204', 'C204 Coupé', 2011, 2015, 'coupe']],
 'mercedes classec w205': [['w205', 'W205 Berline', 2014, 2021, 'berline'], ['s205', 'S205 Break', 2014, 2021, 'break'], ['c205', 'C205 Coupé', 2015, 2023, 'coupe'], ['a205', 'A205 Cabriolet', 2016, 2023, 'cabriolet']],
 'mercedes classec w206': [['w206', 'W206 Berline', 2021, 0, 'berline'], ['s206', 'S206 Break', 2021, 0, 'break']],
 'mercedes classee w211': [['w211', 'W211 Berline', 2002, 2009, 'berline'], ['s211', 'S211 Break', 2003, 2009, 'break']],
 'mercedes classee w212': [['w212', 'W212 Berline', 2009, 2016, 'berline'], ['s212', 'S212 Break', 2009, 2016, 'break'], ['c207', 'C207 Coupé', 2009, 2017, 'coupe'], ['a207', 'A207 Cabriolet', 2010, 2017, 'cabriolet']],
 'mercedes classee w213': [['w213', 'W213 Berline', 2016, 2023, 'berline'], ['s213', 'S213 Break', 2016, 2023, 'break'], ['c238', 'C238 Coupé', 2017, 2023, 'coupe'], ['a238', 'A238 Cabriolet', 2017, 2023, 'cabriolet']],
 'mercedes classee w214': [['w214', 'W214 Berline', 2023, 0, 'berline'], ['s214', 'S214 Break', 2023, 0, 'break']],
 'mercedes cla c117': [['c117', 'C117 Coupé 4 portes', 2013, 2019, 'berline'], ['x117', 'X117 Shooting Brake', 2015, 2019, 'break']],
 'mercedes cla c118': [['c118', 'C118 Coupé 4 portes', 2019, 0, 'berline'], ['x118', 'X118 Shooting Brake', 2019, 0, 'break']],
 'mercedes glc x253': [['x253', 'X253 SUV', 2015, 2022, 'hayon'], ['c253', 'C253 Coupé', 2016, 2023, 'coupe']],
 // ---- Audi
 'audi a1 8x': [['8x3', '3 portes', 2010, 2018, '3p'], ['8xa', 'Sportback 5 portes', 2012, 2018, 'hayon', /\bsportback\b/]],
 'audi a3 8l': [['8l3', '3 portes', 1996, 2003, '3p'], ['8l5', '5 portes', 1999, 2003, 'hayon', /\b5 ?(portes|p)\b/]],
 'audi a3 8p': [['8p1', '3 portes', 2003, 2012, '3p'], ['8pa', 'Sportback 5 portes', 2004, 2013, 'hayon', /\bsportback\b/], ['8p7', 'Cabriolet', 2008, 2013, 'cabriolet']],
 'audi a3 8v': [['8v1', '3 portes', 2012, 2017, '3p'], ['8va', 'Sportback 5 portes', 2013, 2020, 'hayon', /\bsportback\b/], ['8vs', 'Berline 4 portes', 2013, 2020, 'berline', /\b(berline|limousine|sedan|4 portes)\b/], ['8v7', 'Cabriolet', 2014, 2020, 'cabriolet']],
 'audi a3 8y': [['8ya', 'Sportback 5 portes', 2020, 0, 'hayon'], ['8ys', 'Berline 4 portes', 2020, 0, 'berline', /\b(berline|limousine|sedan|4 portes)\b/]],
 'audi a4 b6': [['b6b', 'Berline', 2000, 2004, 'berline'], ['b6a', 'Avant', 2001, 2004, 'break'], ['b6c', 'Cabriolet', 2002, 2006, 'cabriolet']],
 'audi a4 b7': [['b7b', 'Berline', 2004, 2008, 'berline'], ['b7a', 'Avant', 2004, 2008, 'break'], ['b7c', 'Cabriolet', 2006, 2009, 'cabriolet']],
 'audi a4 b8': [['b8b', 'Berline', 2007, 2015, 'berline'], ['b8a', 'Avant', 2008, 2015, 'break'], ['b8r', 'Allroad', 2009, 2016, 'break', /\ballroad\b/]],
 'audi a4 b9': [['b9b', 'Berline', 2015, 2024, 'berline'], ['b9a', 'Avant', 2016, 2024, 'break'], ['b9r', 'Allroad', 2016, 2024, 'break', /\ballroad\b/]],
 'audi a5 8t': [['8t3', 'Coupé', 2007, 2016, 'coupe'], ['8ta', 'Sportback', 2009, 2016, 'hayon', /\bsportback\b/], ['8t7', 'Cabriolet', 2009, 2017, 'cabriolet']],
 'audi a5 f5': [['f53', 'Coupé', 2016, 2024, 'coupe'], ['f5a', 'Sportback', 2017, 2024, 'hayon', /\bsportback\b/], ['f57', 'Cabriolet', 2017, 2024, 'cabriolet']],
 'audi a6 c6': [['c6b', 'Berline', 2004, 2011, 'berline'], ['c6a', 'Avant', 2005, 2011, 'break'], ['c6r', 'Allroad', 2006, 2011, 'break', /\ballroad\b/]],
 'audi a6 c7': [['c7b', 'Berline', 2011, 2018, 'berline'], ['c7a', 'Avant', 2011, 2018, 'break'], ['c7r', 'Allroad', 2012, 2018, 'break', /\ballroad\b/]],
 'audi a6 c8': [['c8b', 'Berline', 2018, 0, 'berline'], ['c8a', 'Avant', 2018, 0, 'break'], ['c8r', 'Allroad', 2019, 0, 'break', /\ballroad\b/]],
 'audi tt 8j': [['8jc', 'Coupé', 2006, 2014, 'coupe'], ['8jr', 'Roadster', 2007, 2014, 'cabriolet']],
 'audi tt 8s': [['8sc', 'Coupé', 2014, 2023, 'coupe'], ['8sr', 'Roadster', 2015, 2023, 'cabriolet']],
 'audi q3 f3': [['f3', 'SUV', 2018, 0, 'hayon'], ['f3n', 'Sportback', 2019, 0, 'hayon', /\bsportback\b/]],
 'audi q5 fy': [['fy', 'SUV', 2017, 0, 'hayon'], ['fyt', 'Sportback', 2021, 0, 'hayon', /\bsportback\b/]],
 // ---- Mini
 'mini mini 1': [['r50', '3 portes (R50 / R53)', 2001, 2006, '3p'], ['r52', 'Cabriolet (R52)', 2004, 2008, 'cabriolet']],
 'mini mini 2': [['r56', '3 portes (R56)', 2006, 2014, '3p'], ['r57', 'Cabriolet (R57)', 2009, 2015, 'cabriolet'], ['r58', 'Coupé (R58)', 2011, 2015, 'coupe'], ['r59', 'Roadster (R59)', 2012, 2015, 'cabriolet', /\broadster\b/]],
 'mini mini 3': [['f56', '3 portes (F56)', 2014, 2024, '3p'], ['f55', '5 portes (F55)', 2014, 2024, 'hayon', /\b5 ?(portes|p)\b/], ['f57', 'Cabriolet (F57)', 2016, 2024, 'cabriolet']],
 'mini mini 4': [['f66', '3 portes', 2024, 0, '3p'], ['f65', '5 portes', 2024, 0, 'hayon', /\b5 ?(portes|p)\b/], ['f67', 'Cabriolet', 2024, 0, 'cabriolet']],
 // ---- Volkswagen
 'volkswagen golf 4': [['h', 'Berline', 1997, 2004, 'hayon'], ['sw', 'Variant (break)', 1999, 2006, 'break'], ['cab', 'Cabriolet', 1998, 2002, 'cabriolet']],
 'volkswagen golf 5': [['h', 'Berline', 2003, 2009, 'hayon'], ['sw', 'Variant (break)', 2007, 2009, 'break']],
 'volkswagen golf 6': [['h', 'Berline', 2008, 2013, 'hayon'], ['sw', 'SW (Variant)', 2009, 2013, 'break'], ['cab', 'Cabriolet', 2011, 2016, 'cabriolet']],
 'volkswagen golf 7': [['h', 'Berline', 2012, 2020, 'hayon'], ['sw', 'SW', 2013, 2020, 'break'], ['at', 'Alltrack', 2015, 2020, 'break', /\balltrack\b/]],
 'volkswagen golf 8': [['h', 'Berline', 2019, 0, 'hayon'], ['sw', 'SW', 2020, 0, 'break']],
 'volkswagen beetle 1': [['h', 'Coupé', 1998, 2011, 'hayon'], ['cab', 'Cabriolet', 2003, 2011, 'cabriolet']],
 'volkswagen beetle 2': [['h', 'Coupé', 2011, 2019, 'hayon'], ['cab', 'Cabriolet', 2013, 2019, 'cabriolet']],
 'volkswagen passat b6': [['b', 'Berline', 2005, 2010, 'berline'], ['sw', 'SW', 2005, 2011, 'break']],
 'volkswagen passat b7': [['b', 'Berline', 2010, 2015, 'berline'], ['sw', 'SW', 2010, 2015, 'break']],
 'volkswagen passat b8': [['b', 'Berline', 2014, 2023, 'berline'], ['sw', 'SW', 2014, 2024, 'break']],
 'volkswagen tiguan 2': [['h', 'Tiguan', 2016, 2024, 'hayon'], ['all', 'Allspace (7 places)', 2017, 2024, 'hayon', /\ballspace\b/]],
 // ---- Renault
 'renault clio 3': [['h', 'Berline', 2005, 2013, 'hayon'], ['est', 'Estate', 2008, 2013, 'break']],
 'renault clio 4': [['h', 'Berline', 2012, 2019, 'hayon'], ['est', 'Estate', 2013, 2019, 'break']],
 'renault megane 2': [['h', 'Berline', 2002, 2009, 'hayon'], ['est', 'Estate', 2003, 2009, 'break'], ['cc', 'Coupé-Cabriolet', 2003, 2010, 'cabriolet']],
 'renault megane 3': [['h', 'Berline', 2008, 2016, 'hayon'], ['cp', 'Coupé', 2008, 2016, 'coupe'], ['est', 'Estate', 2009, 2016, 'break'], ['cc', 'Coupé-Cabriolet', 2010, 2016, 'cabriolet']],
 'renault megane 4': [['h', 'Berline', 2016, 2023, 'hayon'], ['est', 'Estate', 2016, 2023, 'break'], ['gc', 'Grand Coupé', 2017, 2021, 'berline', /\bgrand coupe\b/]],
 'renault laguna 3': [['h', 'Berline', 2007, 2015, 'hayon'], ['est', 'Estate', 2008, 2015, 'break'], ['cp', 'Coupé', 2008, 2015, 'coupe']],
 'renault scenic 2': [['s', '5 places', 2003, 2009, 'monospace'], ['gs', 'Grand (7 places)', 2004, 2009, 'monospace', /\bgrand\b/]],
 'renault scenic 3': [['s', '5 places', 2009, 2016, 'monospace'], ['gs', 'Grand (7 places)', 2009, 2016, 'monospace', /\bgrand\b/]],
 'renault scenic 4': [['s', '5 places', 2016, 2022, 'monospace'], ['gs', 'Grand (7 places)', 2016, 2022, 'monospace', /\bgrand\b/]],
 // ---- Peugeot
 'peugeot 206 1': [['h', 'Berline', 1998, 2010, 'hayon'], ['sw', 'SW', 2002, 2007, 'break'], ['cc', 'CC (coupé-cabriolet)', 2001, 2007, 'cabriolet']],
 'peugeot 207 1': [['h', 'Berline', 2006, 2012, 'hayon'], ['sw', 'SW', 2007, 2013, 'break'], ['cc', 'CC (coupé-cabriolet)', 2007, 2015, 'cabriolet']],
 'peugeot 307 1': [['h', 'Berline', 2001, 2008, 'hayon'], ['sw', 'SW et Break', 2002, 2008, 'break'], ['cc', 'CC (coupé-cabriolet)', 2003, 2009, 'cabriolet']],
 'peugeot 308 1': [['h', 'Berline', 2007, 2013, 'hayon'], ['sw', 'SW', 2008, 2014, 'break'], ['cc', 'CC (coupé-cabriolet)', 2009, 2015, 'cabriolet']],
 'peugeot 308 2': [['h', 'Berline', 2013, 2021, 'hayon'], ['sw', 'SW', 2014, 2021, 'break']],
 'peugeot 308 3': [['h', 'Berline', 2021, 0, 'hayon'], ['sw', 'SW', 2021, 0, 'break']],
 'peugeot 407 1': [['b', 'Berline', 2004, 2011, 'berline'], ['sw', 'SW', 2004, 2011, 'break'], ['cp', 'Coupé', 2005, 2011, 'coupe']],
 'peugeot 508 1': [['b', 'Berline', 2010, 2018, 'berline'], ['sw', 'SW', 2011, 2018, 'break']],
 'peugeot 508 2': [['b', 'Berline', 2018, 0, 'hayon'], ['sw', 'SW', 2018, 0, 'break']],
 // ---- Citroën, DS
 'citroen c3 1': [['h', 'Berline', 2002, 2010, 'hayon'], ['pl', 'Pluriel (cabriolet)', 2003, 2010, 'cabriolet', /\bpluriel\b/]],
 'citroen c4 1': [['h', 'Berline 5 portes', 2004, 2010, 'hayon'], ['cp', 'Coupé 3 portes', 2004, 2010, 'coupe']],
 'citroen c4picasso 1': [['p', '5 places', 2006, 2013, 'monospace'], ['gp', 'Grand (7 places)', 2006, 2013, 'monospace', /\bgrand\b/]],
 'citroen c4picasso 2': [['p', '5 places', 2013, 2022, 'monospace'], ['gp', 'Grand (7 places)', 2013, 2022, 'monospace', /\bgrand\b/]],
 'citroen c5 1': [['b', 'Berline', 2001, 2008, 'hayon'], ['br', 'Break', 2001, 2008, 'break']],
 'citroen c5 2': [['b', 'Berline', 2008, 2017, 'berline'], ['br', 'Tourer (break)', 2008, 2017, 'break']],
 'ds ds3 1': [['h', 'Berline', 2010, 2019, 'hayon'], ['cab', 'Cabrio', 2013, 2019, 'cabriolet']],
 // ---- Dacia
 'dacia logan 1': [['b', 'Berline', 2004, 2012, 'berline'], ['mcv', 'MCV (break)', 2007, 2013, 'break', /\bmcv\b/]],
 'dacia logan 2': [['b', 'Berline', 2012, 2020, 'berline'], ['mcv', 'MCV (break)', 2013, 2020, 'break', /\bmcv\b/]],
 'dacia sandero 1': [['s', 'Sandero', 2008, 2012, 'hayon'], ['st', 'Stepway', 2009, 2012, 'hayon', /\bstepway\b/]],
 'dacia sandero 2': [['s', 'Sandero', 2012, 2020, 'hayon'], ['st', 'Stepway', 2012, 2020, 'hayon', /\bstepway\b/]],
 'dacia sandero 3': [['s', 'Sandero', 2020, 0, 'hayon'], ['st', 'Stepway', 2020, 0, 'hayon', /\bstepway\b/]],
 // ---- Toyota, Ford, Opel, Fiat, Nissan
 'toyota auris 2': [['h', 'Berline', 2012, 2019, 'hayon'], ['ts', 'Touring Sports (break)', 2013, 2019, 'break']],
 'toyota corolla 12': [['h', 'Berline 5 portes', 2019, 0, 'hayon'], ['ts', 'Touring Sports (break)', 2019, 0, 'break'], ['b', 'Berline 4 portes', 2019, 0, 'berline', /\b(berline|sedan|4 portes)\b/]],
 'ford focus 2': [['h', 'Berline', 2004, 2011, 'hayon'], ['sw', 'SW (break)', 2004, 2011, 'break'], ['cc', 'Coupé-Cabriolet', 2006, 2010, 'cabriolet']],
 'ford focus 3': [['h', 'Berline', 2011, 2018, 'hayon'], ['sw', 'SW (break)', 2011, 2018, 'break']],
 'ford focus 4': [['h', 'Berline', 2018, 2025, 'hayon'], ['sw', 'SW (break)', 2018, 2025, 'break']],
 'ford cmax 2': [['c', '5 places', 2010, 2019, 'monospace'], ['gc', 'Grand (7 places)', 2010, 2019, 'monospace', /\bgrand\b/]],
 'opel astra h': [['h', 'Berline', 2004, 2010, 'hayon'], ['br', 'Break', 2004, 2010, 'break'], ['gtc', 'GTC 3 portes', 2005, 2010, '3p', /\bgtc\b/], ['tt', 'TwinTop (cabriolet)', 2006, 2010, 'cabriolet', /\btwin ?top\b/]],
 'opel astra j': [['h', 'Berline', 2009, 2015, 'hayon'], ['st', 'Sports Tourer (break)', 2010, 2015, 'break'], ['gtc', 'GTC 3 portes', 2011, 2018, '3p', /\bgtc\b/]],
 'opel astra k': [['h', 'Berline', 2015, 2021, 'hayon'], ['st', 'Sports Tourer (break)', 2016, 2021, 'break']],
 'opel astra l': [['h', 'Berline', 2021, 0, 'hayon'], ['st', 'Sports Tourer (break)', 2022, 0, 'break']],
 'opel insignia a': [['b', 'Berline', 2008, 2017, 'hayon'], ['st', 'Sports Tourer (break)', 2009, 2017, 'break']],
 'opel insignia b': [['b', 'Grand Sport', 2017, 2022, 'hayon'], ['st', 'Sports Tourer (break)', 2017, 2022, 'break']],
 'fiat 500 1': [['h', 'Berline', 2007, 2024, 'hayon'], ['c', 'Cabriolet (500C)', 2009, 2024, 'cabriolet', /\b500 ?c\b|\bcabrio(let)?\b/]],
 'nissan qashqai 1': [['q', 'Qashqai', 2007, 2013, 'hayon'], ['q2', 'Qashqai+2 (7 places)', 2008, 2013, 'hayon', /\bplus ?2\b|\+ ?2\b/]],
 // ---- Seat, Skoda, Kia, Hyundai, Honda, Smart
 'seat ibiza 4': [['h', '5 portes', 2008, 2017, 'hayon'], ['sc', 'SC 3 portes', 2008, 2017, '3p', /\bsc\b/], ['st', 'ST (break)', 2010, 2017, 'break', /\bst\b/]],
 'seat leon 3': [['h', '5 portes', 2012, 2020, 'hayon'], ['sc', 'SC 3 portes', 2013, 2018, '3p', /\bsc\b/], ['st', 'ST (break)', 2014, 2020, 'break', /\bst\b/]],
 'seat leon 4': [['h', '5 portes', 2020, 0, 'hayon'], ['st', 'Sportstourer (break)', 2020, 0, 'break', /\b(st|sportstourer|sports tourer)\b/]],
 'skoda fabia 2': [['h', 'Berline', 2007, 2014, 'hayon'], ['c', 'Combi (break)', 2008, 2014, 'break']],
 'skoda fabia 3': [['h', 'Berline', 2014, 2021, 'hayon'], ['c', 'Combi (break)', 2015, 2021, 'break']],
 'skoda octavia 2': [['h', 'Berline', 2004, 2013, 'hayon'], ['c', 'Combi (break)', 2005, 2013, 'break']],
 'skoda octavia 3': [['h', 'Berline', 2013, 2020, 'hayon'], ['c', 'Combi (break)', 2013, 2020, 'break']],
 'skoda octavia 4': [['h', 'Berline', 2020, 0, 'hayon'], ['c', 'Combi (break)', 2020, 0, 'break']],
 'skoda superb 2': [['h', 'Berline', 2008, 2015, 'hayon'], ['c', 'Combi (break)', 2009, 2015, 'break']],
 'skoda superb 3': [['h', 'Berline', 2015, 2023, 'hayon'], ['c', 'Combi (break)', 2015, 2023, 'break']],
 'kia ceed 2': [['h', '5 portes', 2012, 2018, 'hayon'], ['sw', 'SW (break)', 2012, 2018, 'break'], ['pro', "pro_cee'd 3 portes", 2013, 2018, '3p', /\bpro ?_? ?cee ?d\b|\bproceed\b/]],
 'kia ceed 3': [['h', '5 portes', 2018, 0, 'hayon'], ['sw', 'SW (break)', 2018, 0, 'break'], ['pro', 'ProCeed (shooting brake)', 2019, 0, 'break', /\bpro ?ceed\b/]],
 'hyundai i30 2': [['h', '5 portes', 2012, 2017, 'hayon'], ['sw', 'SW (break)', 2012, 2017, 'break']],
 'hyundai i30 3': [['h', '5 portes', 2017, 0, 'hayon'], ['sw', 'SW (break)', 2017, 0, 'break'], ['fb', 'Fastback', 2018, 0, 'berline', /\bfastback\b/]],
 'honda civic 9': [['h', '5 portes', 2012, 2017, 'hayon'], ['t', 'Tourer (break)', 2014, 2017, 'break']],
 'smart fortwo 451': [['c', 'Coupé', 2007, 2014, 'coupe'], ['cab', 'Cabriolet', 2007, 2014, 'cabriolet']],
 'smart fortwo 453': [['c', 'Coupé', 2014, 2024, 'coupe'], ['cab', 'Cabriolet', 2016, 2024, 'cabriolet']],
};
/* Libellé d'une génération quand elle regroupe plusieurs codes châssis. */
const CAT_GLAB = {'bmw serie1 e87': 'Série 1 E8x', 'bmw serie1 f20': 'Série 1 F2x', 'bmw serie2 f22': 'Série 2 F22 / F23', 'bmw serie2at f45': 'Série 2 F45 / F46', 'bmw serie3 e46': 'Série 3 E46', 'bmw serie3 e90': 'Série 3 E9x', 'bmw serie3 f30': 'Série 3 F3x', 'bmw serie3 g20': 'Série 3 G2x', 'bmw serie4 f32': 'Série 4 F3x', 'bmw serie4 g22': 'Série 4 G2x', 'bmw serie5 e60': 'Série 5 E6x', 'bmw serie5 f10': 'Série 5 F1x', 'bmw serie5 g30': 'Série 5 G3x', 'bmw serie5 g60': 'Série 5 G6x', 'mercedes classec w203': 'Classe C 203', 'mercedes classec w204': 'Classe C 204', 'mercedes classec w205': 'Classe C 205', 'mercedes classec w206': 'Classe C 206', 'mercedes classee w211': 'Classe E 211', 'mercedes classee w212': 'Classe E 212', 'mercedes classee w213': 'Classe E 213', 'mercedes classee w214': 'Classe E 214', 'mercedes classea w177': 'Classe A 177', 'mercedes cla c117': 'CLA 117', 'mercedes cla c118': 'CLA 118', 'mercedes glc x253': 'GLC 253'};
/* Carrosserie lue dans le titre (ou dans la case « Type de véhicule » de Leboncoin). */
const V_BODY = [
  ['cabriolet', /\b(cabriolet|cabrio|decapotable|cc|roadster|convertible|spider|spyder|twintop|twin top|pluriel)\b/],
  ['coupe', /\bcoupe\b/],
  ['break', /\b(break|touring|sw|estate|avant|variant|combi|kombi|sports? ?tourer|touring sports|shooting brake|sportwagon|grandtour|mcv|allroad|alltrack|sportbreak|tourer)\b/],
  ['3p', /\b(3 portes|3p|trois portes)\b/],
];
const V_BODY_LBC = {break: 'break', coupe: 'coupe', cabriolet: 'cabriolet'};
const V_BODY_NOM = {hayon: 'berline', berline: 'berline 4 portes', '3p': '3 portes', break: 'break', coupe: 'coupé', cabriolet: 'cabriolet', gt: 'Gran Turismo', monospace: 'monospace'};

/* ================= Reconnaissance marque → modèle → génération (règles fixes, jamais par l'IA) ================= */
const vflat = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘`]/g, "'");
const V_NOW = new Date().getFullYear();
const ROMAN = ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
/* Texte découpé en mots : « 2.0 », « 1,6 » (cylindrées) retirés, « 206+ » → « 206 plus », « Golf 7.5 » → « golf 7 ». */
const vTok = s => ' ' + vflat(s).replace(/([a-z0-9])\s?\+/g, '$1 plus ').replace(/\bgolf ?(\d)[.,]5\b/g, 'golf $1').replace(/\b\d+[.,]\d+\b/g, ' ').replace(/\b([a-z]{3,})(\d)\b/g, '$1 $2').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
/* Texte pour les empreintes moteur : cylindrées gardées avec un point (« 1.6 tdi 105 »). */
const vFp = s => vflat(s).replace(/(\d),(\d)/g, '$1.$2').replace(/\s+/g, ' ');
/* Après une génération, ces mots montrent que le chiffre n'en est pas une (« 6 CV », « 5 portes », « 6 vitesses »). */
const V_STOP = /^(portes?|p|places?|pl|cv|ch|chevaux|vitesses?|rapports?|cyl|cylindres?|x4|motion|matic|roues|km|kms|kilometres?|ans?|mois|proprio|proprios|proprietaires?|mains?|sieges?|jantes?|pneus?|litres?|l|jours?|semaines?|places)$/;
/* Modèles dont le nom est un mot courant : reconnus seulement si la marque est connue. */
const V_REQ = new Set(['note', 'fox', 'up', 'spring', 'soul', 'splash', 'alto', 'rapid', 'fusion', 'born', 'adam', 'karl', 'tipo', 'bravo', 'ka', 'hs', 'zs', 'tt', 'iq', 'leaf', 'compass', 'avenger', 'puma', 'colt', 'spark', 'mini', 'panda', 'verso', 'model3', 'modely', 'models', 'scala', 'jogger', 'spring', 'giulia', 'ignis']);
/* BMW, Mercedes : le modèle se lit aussi dans l'appellation moteur (118d, 320d, A 180, C 220 d…). */
const V_RX = {
  serie1: /\b1(1[468]|2[05]|3[05]|40) ?[die]\b|\bm1(35|40) ?i\b/, serie2: /\b2(1[68]|20|2[05]|30) ?[die]\b|\bm2(35|40) ?i\b/, serie3: /\b3(1[68]|20|2[05]|3[05]|40) ?[die]\b|\bm340 ?i\b/,
  serie4: /\b4(18|20|2[05]|30|35|40) ?[die]\b/, serie5: /\b5(1[08]|20|2[035]|3[05]|40|50) ?[die]\b/,
  classea: /\ba ?(1[4-9]0|200|220|250|35|45) ?d?\b/, classeb: /\bb ?(1[4-9]0|200|220|250) ?d?\b/, classec: /\bc ?(180|200|220|250|300|350|43|63) ?d?\b/, classee: /\be ?(200|220|250|300|350|400) ?d?\b/,
};
const VB = CAT.map(([name, lbc, ok, al, models]) => {
  const key = vflat(name).replace(/-benz$/, '').replace(/[^a-z0-9]/g, '');
  const b = {name, lbc, ok: !!ok, key};
  b.al = [...new Set([vTok(name).trim(), key, ...String(al || '').split(',').map(x => vTok(x).trim())])].filter(Boolean);
  b.models = models.map(([mn, mk, mlbc, mal, gens, style]) => {
    const m = {name: mn, key: mk, lbc: mlbc || '', style: style || '', brand: b, req: V_REQ.has(mk), rx: V_RX[mk] || null};
    m.al = [...new Set([vTok(mn).trim(), mk, ...String(mal || '').split(',').map(x => vTok(x).trim())])].filter(x => x && x.length >= 2 || /^\d$/.test(x));
    m.gens = gens.map(([id, y0, y1, label, o]) => {
      o = o || {}; const n = /^\d+$/.test(id) ? +id : null; const st = m.style;
      const lab = label || (st === 'U' ? mn : st === 'C' ? `${mn} (${id.toUpperCase()})` : st === 'R' && n != null ? `${mn} ${ROMAN[n].toUpperCase()}` : `${mn} ${n != null ? n : id.toUpperCase()}`);
      const al = new Set();
      if (st !== 'U'){ al.add(id); if (n != null && n <= 12){ if (n > 1) al.add(ROMAN[n]); al.add('mk' + n); } } // « I » seul serait confondu avec « 1.4 i-VTEC »
      (o.a || []).forEach(x => al.add(x === '+' ? 'plus' : vTok(x).trim()));
      const codes = new Set((o.c || []).map(x => String(x).toLowerCase())); if (st === 'C') codes.add(id);
      return {id, y0, y1: y1 || V_NOW, open: !y1, label: lab, al: [...al].filter(Boolean), codes: [...codes], d0: o.d0 || '', t: o.t || null, fp: o.fp || null, key: `${key} ${mk} ${id}`, model: m};
    });
    return m;
  });
  return b;
});
/* Versions et carrosseries : années propres, codes châssis ; la génération couvre toutes ses versions. */
VB.forEach(b => b.models.forEach(m => m.gens.forEach(g => {
  if (CAT_GLAB[g.key]) g.label = CAT_GLAB[g.key];
  const V = CAT_VAR[g.key]; if (!V) return;
  g.v = V.map(([id, label, y0, y1, body, rx, codes]) => { const cs = [...(codes || [])]; if ((m.style === 'C' && /^[a-z]{1,2}\d{2,3}$/.test(id)) || g.codes.includes(id)) cs.push(id); return {id, label, y0, y1: y1 || V_NOW, open: !y1, body, rx: rx || null, codes: cs, gen: g, key: g.key + '.' + id}; });
  g.v.forEach(v => v.codes.forEach(c => { if (!g.codes.includes(c)) g.codes.push(c); }));
  g.y0 = Math.min(g.y0, ...g.v.map(v => v.y0)); g.y1 = Math.max(g.y1, ...g.v.map(v => v.y1)); g.open = g.open || g.v.some(v => v.open);
})));
const VB_BY = {}; VB.forEach(b => { VB_BY[b.key] = b; });
const VM_BY = {}; VB.forEach(b => b.models.forEach(m => { VM_BY[b.key + ' ' + m.key] = m; }));
const VG_BY = {}; VB.forEach(b => b.models.forEach(m => m.gens.forEach(g => { VG_BY[g.key] = g; })));
/* Table des générations (compatibilité avec le reste de l'outil) : « volkswagen golf 7 » → [2012, 2020]. */
const GENS = {}; Object.values(VG_BY).forEach(g => { GENS[g.key] = [g.y0, g.y1]; });
const vYears = g => `${g.y0} – ${g.open ? 'aujourd\'hui' : g.y1}`;
const vMonth = s => { const m = String(s || '').match(/(\d{4})-(\d{2})/); return m ? +m[1] * 12 + (+m[2] - 1) : null; };
const vMonthTxt = s => { const m = String(s || '').match(/(\d{4})-(\d{2})/); return m ? `${m[2]}/${m[1]}` : ''; };
function vBrandIn(T, marque){
  const M = vTok(marque);
  if (M.trim()){ for (const b of VB) if (b.al.some(a => M.includes(' ' + a + ' '))) return b; }
  let best = null, bl = 0;
  VB.forEach(b => b.al.forEach(a => { if (a.length > bl && T.includes(' ' + a + ' ')){ best = b; bl = a.length; } }));
  return best;
}
function vModelIn(T, brand, strict){
  let best = null, score = -1;
  const scan = list => list.forEach(m => {
    if (m.req && !brand) return;
    m.al.forEach(a => { const i = T.indexOf(' ' + a + ' '); if (i >= 0){ const s = a.length * 100 - i / 1000; if (s > score){ score = s; best = m; } } });
    if (m.rx && brand && brand === m.brand && !best && m.rx.test(T)){ score = 1; best = m; }
  });
  if (brand) scan(brand.models);
  if (!best && !strict) VB.forEach(b => { if (b !== brand) scan(b.models.filter(m => !m.req)); });
  if (!best && brand) brand.models.forEach(m => { if (!best && m.rx && m.rx.test(T)) best = m; });
  return best;
}
/* Générations écrites dans le texte, juste après le nom du modèle (« Golf 7 », « Clio IV », « golf7 », « mk7 ») ou code châssis (« E90 », « 8P »). */
function vExplicit(m, T){
  const E = new Map(); const ga = new Map(); m.gens.forEach(g => g.al.forEach(a => ga.set(a, g)));
  m.al.forEach(a => {
    let from = 0, i;
    while ((i = T.indexOf(' ' + a + ' ', from)) >= 0){
      from = i + 1;
      const rest = T.slice(i + a.length + 2).split(' ');
      let k = rest[0] === 'mk' ? 1 : 0; const t1 = rest[k] || '', t2 = rest[k + 1] || '';
      const g = ga.get(t1) || (k ? ga.get('mk' + t1) : null);
      if (g && !V_STOP.test(t2) && !(m.style === 'C' && /^\d+$/.test(t1))) E.set(g.id, g);
    }
    if (/^[a-z]+$/.test(a)) m.gens.forEach(g => g.al.forEach(x => { if (T.includes(' ' + a + x + ' ')) E.set(g.id, g); }));
  });
  m.gens.forEach(g => { if (/^\d+$/.test(g.id) && T.includes(' mk' + g.id + ' ')) E.set(g.id, g); g.codes.forEach(c => { if (T.includes(' ' + c + ' ')) E.set(g.id, g); }); });
  return [...E.values()];
}
function vBodyOf(T, carr){ for (const [b, re] of V_BODY) if (re.test(T)) return b; const c = vflat(carr || ''); if (/cabrio/.test(c)) return 'cabriolet'; if (/coupe/.test(c)) return 'coupe'; if (/break/.test(c)) return 'break'; return null; }
/* Version d'une génération : code châssis, nom propre (Stepway, Allroad…), carrosserie ; sinon la version par défaut. */
function vVariantOf(g, T, b){
  if (!g || !g.v) return null;
  let v = g.v.find(x => x.codes.some(c => T.includes(' ' + c + ' '))); if (v) return {v, how: 'code'};
  const rx = g.v.filter(x => x.rx && x.rx.test(T)); if (rx.length === 1) return {v: rx[0], how: 'texte'};
  if (b){ const bs = g.v.filter(x => x.body === b); const plain = bs.filter(x => !x.rx); if (plain.length) return {v: plain[0], how: bs[0] === g.v[0] ? 'defaut' : 'texte'}; if (bs.length === 1) return {v: bs[0], how: 'texte'}; }
  return {v: g.v[0], how: 'defaut'};
}
const vVarLabel = (g, v) => g.model.style === 'U' || /\b[a-z]{1,2}\d{2,3}\b/i.test(v.label) ? `${g.model.name} ${v.label}` : `${g.label} ${v.label}`;
const V_CACHE = new Map();
/* t : {marque, modele, titre, texte, annee, mec (date de 1re mise en circulation), genIA (génération donnée par l'IA), strict} */
function vehResolve(t){
  t = t || {};
  const ck = [t.marque, t.modele, t.titre, String(t.texte || '').slice(0, 700), t.annee, t.mec, t.genIA, t.strict ? 1 : 0, t.carr].join('\u0001');
  if (V_CACHE.has(ck)) return V_CACHE.get(ck);
  const T = vTok([t.marque, t.modele, t.titre].filter(Boolean).join(' '));
  const TD = vTok(String(t.texte || '').slice(0, 2500));
  const FP = vFp([t.titre, t.modele, String(t.texte || '').slice(0, 2500)].join(' \n '));
  const y = num(t.annee) && num(t.annee) > 1980 && num(t.annee) <= V_NOW + 1 ? num(t.annee) : null;
  const mecM = vMonth(t.mec);
  const out = {brand: null, model: null, gen: null, cands: [], statut: '', pourquoi: '', alerte: '', explicit: false, base: '', key: '', label: '', genLabel: '', variant: null, varHow: '', body: null};
  let brand = vBrandIn(T, t.marque);
  let model = vModelIn(T, brand, t.strict);
  if (!model && TD.trim()) model = vModelIn(TD, brand, true);
  if (model && !brand) brand = model.brand;
  if (model && brand && model.brand !== brand) brand = model.brand;
  out.brand = brand; out.model = model;
  if (!model){ out.label = brand ? brand.name : ''; out.base = brand ? brand.key : ''; if (V_CACHE.size > 4000) V_CACHE.clear(); V_CACHE.set(ck, out); return out; }
  out.base = brand.key + ' ' + model.key;
  const fullTxt = [t.titre, t.modele, t.texte].join(' ');
  // carrosserie : code châssis ou nom de version d'abord (E92, Stepway, Gran Coupé), puis le titre et la case Leboncoin
  let bb = null;
  for (const g of model.gens){ for (const v of g.v || []){ if (!bb && v.codes.some(c => T.includes(' ' + c + ' '))) bb = v.body; } }
  if (!bb) for (const g of model.gens){ for (const v of g.v || []){ if (!bb && v.rx && v.rx.test(T)) bb = v.body; } }
  const b0 = bb || vBodyOf(T, t.carr);
  const body = b0 && model.gens.some(g => g.v && g.v.some(v => v.body === b0)) ? b0 : null;
  out.body = b0;
  const vOk = g => { if (!g.v) return null; const bs = body && g.v.some(v => v.body === body) ? g.v.filter(v => v.body === body) : g.v.filter(v => v.body === g.v[0].body); const sans = bs.filter(v => !v.rx || v.rx.test(T)); return sans.length ? sans : bs; }; // une version à nom propre (Allroad, Stepway) ne compte que si son nom est écrit
  const inYear = (g, yy) => { const vs = vOk(g); if (vs) return vs.some(v => yy >= v.y0 && yy <= v.y1); return yy >= g.y0 && yy <= (g.t && g.t[0].test(vflat(fullTxt)) ? Math.max(g.y1, g.t[1]) : g.y1); };
  const hasBody = g => !body || !g.v || g.v.some(v => v.body === body);
  let cand = y ? model.gens.filter(g => hasBody(g) && inYear(g, y)) : model.gens.filter(hasBody);
  let parMec = null;
  if (mecM != null){ const before = cand.length; const keep = cand.filter(g => !g.d0 || mecM >= vMonth(g.d0) - 2); if (keep.length && keep.length < before){ parMec = cand.filter(g => !keep.includes(g)); cand = keep; } }
  out.cands = cand;
  let E = vExplicit(model, T); let src = 'titre';
  if (!E.length){ E = vExplicit(model, TD); src = 'description'; }
  if (E.length > 1){ const inC = E.filter(g => cand.includes(g)); E = inC.length === 1 ? inC : []; }
  const set = (g, st, why) => { out.gen = g; out.statut = st; out.pourquoi = why; };
  const labs = gs => gs.map(g => g.label).join(' ou ');
  if (E.length === 1){
    const e = E[0];
    if (!y) set(e, 'probable', `« ${e.label} » écrit dans ${src === 'titre' ? 'l\'annonce' : 'la description'}, année inconnue`);
    else if (cand.includes(e)) { set(e, 'sure', `« ${e.label} » écrit dans ${src === 'titre' ? 'l\'annonce' : 'la description'}, cohérent avec ${y}`); out.explicit = true; }
    else {
      const quand = y < e.y0 ? `pas encore sortie en ${y}` : `plus vendue neuve en ${y}`;
      if (cand.length === 1){ set(cand[0], 'probable', `seule génération vendue en ${y}`); out.alerte = `L'annonce indique « ${e.label} », ${quand} : c'est très probablement une ${cand[0].label} (ou l'année est fausse). À vérifier sur la carte grise.`; }
      else { out.statut = 'incertaine'; out.pourquoi = `« ${e.label} » écrit dans l'annonce, mais ${quand}`; out.alerte = `L'annonce indique « ${e.label} », ${quand}. Vérifiez l'année et la génération sur la carte grise.`; }
    }
  } else if (model.gens.length === 1 && (!y || cand.length === 1)){
    set(model.gens[0], 'sure', y ? `une seule génération de ${model.name}` : `une seule génération de ${model.name}, année inconnue`);
  } else if (!y){
    out.statut = 'incertaine'; out.pourquoi = 'année inconnue';
  } else if (cand.length === 1){
    set(cand[0], 'sure', parMec ? `1re mise en circulation ${vMonthTxt(t.mec)}, avant l'arrivée de la ${labs(parMec)}` : `seule génération vendue en ${y}`);
  } else if (!cand.length){
    out.statut = 'incertaine'; out.pourquoi = `aucune génération de ${model.name} connue en ${y}`;
    out.alerte = `Aucune ${model.name} n'était vendue neuve en ${y} (${model.gens.map(g => `${g.label} : ${vYears(g)}`).join(', ')}). Vérifiez l'année sur la carte grise.`;
  } else {
    const hit = cand.filter(g => g.fp && g.fp.test(FP));
    const ia = t.genIA ? vExplicit(model, vTok(model.name + ' ' + t.genIA)).filter(g => cand.includes(g)) : [];
    if (hit.length === 1) set(hit[0], 'probable', `${y} : ${labs(cand)} possibles, moteur ou finition propre à la ${hit[0].label}`);
    else if (ia.length === 1) set(ia[0], 'probable', `${y} : ${labs(cand)} possibles, génération reconnue par l'IA (photos et texte)`);
    else { out.statut = 'incertaine'; out.pourquoi = `${y} : ${labs(cand)} possibles. Il faut la génération écrite, la date de 1re mise en circulation ou les photos.`; }
  }
  out.genLabel = out.gen && out.statut !== 'incertaine' ? out.gen.label : '';
  out.key = out.base + (out.genLabel ? ' ' + out.gen.id : '');
  if (out.genLabel && out.gen.v){ const vv = vVariantOf(out.gen, T, body); if (vv){ out.variant = vv.v; out.varHow = vv.how; } }
  const nm = out.variant && out.varHow !== 'defaut' ? vVarLabel(out.gen, out.variant) : out.genLabel || model.name;
  out.label = vLabel(brand, nm);
  if (V_CACHE.size > 4000) V_CACHE.clear();
  V_CACHE.set(ck, out);
  return out;
}
const vLabel = (b, x) => vflat(x).startsWith(vflat(b.name)) ? x : `${b.name} ${x}`;
/* Pastille de génération : sûre, probable, incertaine. */
function genTag(r, short){
  if (!r || !r.model) return '';
  const gl = r.variant && r.varHow !== 'defaut' ? vVarLabel(r.gen, r.variant) : r.genLabel;
  const vt = r.variant ? (r.varHow === 'defaut' ? `. Version supposée : ${r.variant.label} (rien n'indique une autre carrosserie)` : `. Version : ${r.variant.label}`) : '';
  if (r.statut === 'sure') return `<span class="tag gen" title="${esc('Génération sûre : ' + r.pourquoi + vt)}">${esc(gl)}</span>`;
  if (r.statut === 'probable') return `<span class="tag gen acc" title="${esc('Génération probable : ' + r.pourquoi + vt + (r.alerte ? '. ' + r.alerte : ''))}">${esc(gl)}${short ? '' : ' probable'}</span>`;
  const c = r.cands.length > 1 && r.cands.length <= 3 ? r.cands.map(g => g.label.replace(r.model.name + ' ', '')).join(' ou ') : '';
  return `<span class="tag gen warn" title="${esc('Génération incertaine : ' + r.pourquoi)}">${esc(r.model.name)} ${esc(c || '?')}${c ? ' ?' : ''}</span>`;
}
const genAlerte = r => r && r.alerte ? `<div class="al warn"><i></i><span>${esc(r.alerte)}</span></div>` : '';
/* Anciennes fonctions gardées pour le reste de l'outil, désormais branchées sur le référentiel. */
function modelKey(marque, modele){
  const r = vehResolve({marque, titre: modele});
  if (r.model){ const E = vExplicit(r.model, vTok([marque, modele].join(' '))); const g = E.length === 1 ? E[0].id : ''; return {base: r.base, gen: g, key: r.base + (g ? ' ' + g : ''), res: r}; }
  const tk = vTok([marque, modele].join(' ')).trim().split(' ').filter(Boolean);
  const bi = r.brand ? tk.findIndex(x => r.brand.al.includes(x)) : -1;
  const base = r.brand ? [r.brand.key, bi >= 0 ? (tk[bi + 1] || '') : ''].filter(Boolean).join(' ') : '';
  return {base, gen: '', key: base, res: r};
}
function keyLabel(k){
  const key = (k && k.key) || ''; const g = VG_BY[key]; if (g) return `${g.model.brand.name} ${g.label}`;
  const m = VM_BY[(k && k.base) || key]; if (m) return `${m.brand.name} ${m.name}`;
  return key.split(' ').map(w => w.length > 2 && !/\d/.test(w) ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()).join(' ');
}
/* Regex tolérante aux accents pour les filtres côté serveur (« s[eé]rie 1 »). */
const V_ACC = {a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]'};
const vRegexAlias = a => a.split('').map(ch => V_ACC[ch] || (ch === ' ' ? '[ -]?' : escRe(ch))).join('');
function vModelRegex(m){ return `\\b(${[...m.al.filter(a => a.length >= 2).map(vRegexAlias), ...(m.rx ? [m.rx.source] : [])].join('|')})\\b`; }
/* Mot-clé de recherche d'une marque dont le code Leboncoin n'est pas vérifié (« mercedes » plutôt que « mercedes-benz »). */
const vBrandMot = b => b.al.filter(a => a.length >= 3).sort((x, y) => x.length - y.length)[0] || vflat(b.name);
/* Modèles voisins à écarter d'une recherche : « golf » ne doit pas ramener « golf plus » ni « golf sportsvan ». */
function vSisters(m){ const out = []; m.brand.models.forEach(o => { if (o === m) return; o.al.forEach(a => { if (m.al.some(x => a !== x && (' ' + a + ' ').includes(' ' + x + ' '))) out.push(a); }); }); return [...new Set(out)]; }

/* Génération unique pour une année, sinon rien (années de transition : pas de choix au hasard). */
function genFor(base, annee){
  const m = VM_BY[base]; const y = num(annee); if (!m || !y) return '';
  const c = m.gens.filter(g => y >= g.y0 && y <= g.y1); return c.length === 1 ? c[0].id : '';
}
/* Ce qu'il faut demander à Apify pour la cote d'une voiture : marque, modèle, génération, énergie.
   t.pick = {brand, model, gen} depuis un sélecteur ; sinon la voiture est reconnue par vehResolve.
   Génération incertaine : pas de cote (on ne mélange pas deux générations). */
function coteSpec(t){
  let brand, model, gen, variant = null; const en = normEn(t.energie);
  if (t.pick){ ({brand, model, gen} = t.pick); variant = t.pick.variant || null; if (model && !gen && model.gens.length === 1) gen = model.gens[0]; }
  else { const r = vehResolve(t); brand = r.brand; model = r.model; if (!model) return null; if (!r.gen || r.statut === 'incertaine') return {incertain: true, res: r, base: r.base, nom: r.label}; gen = r.gen; if (r.variant && r.varHow !== 'defaut' && r.variant !== gen.v[0]) variant = r.variant; }
  if (!brand || !model || !gen) return null;
  // une version autre que la version par défaut (coupé, cabriolet, break, Stepway…) a sa propre cote ; le break retombe sur la cote de la génération s'il n'en a pas
  const yr = variant || gen;
  const f = {year_min: yr.y0, year_max: yr.y1, price_min: 500};
  if (variant && V_BODY_LBC[variant.body]) f.vehicle_type = V_BODY_LBC[variant.body];
  if (brand.ok) f.vehicle_brand = brand.lbc;
  if (brand.ok && model.lbc) f.vehicle_model = brand.lbc + '_' + model.lbc; else f.text = flatA(model.name);
  const fuel = FUEL_CODE[en]; if (fuel) f.fuel = en === 'hybride' ? ['6', '8'] : [fuel]; // hybride : simple et rechargeable
  // (pas de réglage « utp » ici : la fonction de cote transmet tous ses filtres à Apify, tels quels)
  const base = brand.key + ' ' + model.key; const gid = gen.id + (variant ? '.' + variant.id : '');
  const cle = [base, gid, en || 'toutes'].join('|');
  const nom = `${vLabel(brand, variant ? vVarLabel(gen, variant) : gen.label)}${en ? ' ' + en : ''} (${yr.y0} – ${yr.y1})`;
  const out = {cle, nom, base, gen: gid, energie: en, y0: yr.y0, y1: yr.y1, filtres: f};
  Object.defineProperty(out, 'variant', {value: variant}); Object.defineProperty(out, 'genObj', {value: gen}); // hors JSON envoyé à Supabase
  return out;
}
function coteFor(t){
  const s = coteSpec(t); if (!s) return {spec: null, cote: null};
  if (s.incertain) return {spec: s, cote: null};
  const L = cotes.list.filter(c => c.base === s.base && String(c.gen || '') === String(s.gen) && (!s.energie || !c.energie || c.energie === s.energie));
  let c = L.sort((a, b) => (((b.energie || '') === s.energie) - ((a.energie || '') === s.energie)) || ((b.n || 0) - (a.n || 0)))[0] || null;
  if (!c && s.variant && ['break', 'hayon', '3p', 'monospace'].includes(s.variant.body)){ // pas de cote propre à cette version : celle de la génération (le break y est mesuré à part)
    const g0 = s.genObj.id; c = cotes.list.filter(x => x.base === s.base && String(x.gen || '') === g0 && (!s.energie || !x.energie || x.energie === s.energie)).sort((a, b) => (b.n || 0) - (a.n || 0))[0] || null;
  }
  return {spec: s, cote: c};
}
/* Moindres carrés (petit système, élimination de Gauss). */
function ols(X, y){
  const p = X[0].length; const A = Array.from({length: p}, () => new Array(p + 1).fill(0));
  X.forEach((r, i) => { for (let a = 0; a < p; a++){ for (let b = 0; b < p; b++) A[a][b] += r[a] * r[b]; A[a][p] += r[a] * y[i]; } });
  for (let a = 0; a < p; a++) A[a][a] += 1e-6;
  for (let c = 0; c < p; c++){ let m = c; for (let r = c + 1; r < p; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r; [A[c], A[m]] = [A[m], A[c]]; const d = A[c][c] || 1e-9; for (let j = c; j <= p; j++) A[c][j] /= d; for (let r = 0; r < p; r++) if (r !== c){ const f = A[r][c]; for (let j = c; j <= p; j++) A[r][j] -= f * A[c][j]; } }
  return A.map(r => r[p]);
}
const PHI = z => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
/* Modèle : log(prix) = a + b·âge + c·km + d·vendeur pro + e·boîte auto, puis on retire les annonces aberrantes et on recalcule. */
/* Version, finition, carrosserie, puissance, équipement : lus dans le titre et le début de la description (règles fixes). */
const SEGS = [
  ['societe', 'Version société ou utilitaire 2 places', r => r.places === 2 || /\b(societe|commerciale?|utilitaire|vu|n1|2 places|deux places|tva recuperable)\b/.test(r.tx)],
  ['break', 'Break', r => /\b(estate|break|sw|sport ?tourer|touring|combi|grandtour)\b/.test(r.tx) || /break/i.test(r.carr || '')],
  ['finHaute', 'Finition haute', r => /\b(intens|initiale|gt ?line|rs ?line|allure|shine|titanium|exclusive|feline|techno|premium|lounge|s ?line|highline|carat|platinum|edition one|signature)\b/.test(r.tx)],
  ['sport', 'Version sportive', r => /\b(gti|gtd|cupra|abarth|jcw|john cooper works|type ?r|amg(?! ?line)|m1[34]0 ?i|m2[34]0 ?i|m340 ?i|rs ?[3-6]|s[13]|golf r|r ?(265|270|300|310)|rs ?(1[89]\d|2[0-7]\d)|st ?(1[5-9]\d|200)|trophy|cup)\b/.test(r.tx)],
  ['finBasse', 'Finition d\'entrée', r => /\b(access|life|authentique|expression|essentia|attraction|ambiance|trendline|essentielle|society|pure)\b/.test(r.tx)],
];
const EQUIP = /\b(gps|navigation|carplay|android auto|clim(?:atisation)? auto(?:matique)?|regulateur|radar de recul|camera|jantes? alu|toit (?:pano\w*|ouvrant)|cuir|sieges? chauffants|bose|keyless|carte mains libres|full options?)\b/g;
function chOf(r){ if (num(r.ch) > 30 && num(r.ch) < 800) return num(r.ch); const m = r.tx.match(/\b(\d{2,3}) ?(?:ch|cv din|chevaux)\b/) || r.tx.match(/\b(?:dci|tce|hdi|e-?hdi|bluehdi|tdi|tsi|vti|puretech|vvt-?i|tdci|ecoboost|sce|crdi) ?(\d{2,3})\b/); const v = m ? +m[1] : null; return v && v > 40 && v < 700 ? v : null; }
/* Clé de motorisation (« 335 i » = « 335i ») et finition Leboncoin normalisée (« Sport Design » → « sport design »). */
const cleMo = s => flatA(s).replace(/[\s-]+/g, '');
const normFin = s => flatA(s).replace(/[^a-z0-9+]+/g, ' ').trim();
/* Âge en années : au mois près avec la 1re mise en circulation (AAAA-MM), sinon le milieu de l'année. */
const AN_NOW = () => { const d = new Date(); return d.getFullYear() + d.getMonth() / 12; };
const ageDe = (r, Yf) => { const m = /^(\d{4})-(\d{2})/.exec(r.mec || ''); const a = m && +m[1] === r.annee ? +m[1] + (+m[2] - 0.5) / 12 : r.annee + 0.5; return Math.max(0, Yf - a); };
function segRow(r){
  r.tx = flatA(r.tx || ''); r.seg = {}; SEGS.forEach(([k, , f]) => { r.seg[k] = f(r) ? 1 : 0; });
  if (r.seg.finHaute && r.seg.finBasse) r.seg.finHaute = r.seg.finBasse = 0;
  r.chv = chOf(r); r.eq = Math.min(4, (r.tx.match(EQUIP) || []).length);
  r.mo = r.mo ? cleMo(r.mo) : ''; r.fin = r.fin ? normFin(r.fin) : '';
  return r;
}
/* Finition d'une annonce qui ne la donne pas : la plus longue des finitions connues de la cote écrite dans son titre ou sa version. */
const finDans = (tx, connues) => { const t = ' ' + normFin(tx) + ' '; return connues.find(f => t.includes(' ' + f + ' ')) || ''; };
/* Options d'une cote :
   - toutesCarr : berlines, breaks, coupés et cabriolets ensemble, la carrosserie devient une variable de la régression
     (au lieu d'écarter coupés et cabriolets) ;
   - libelle : ce sur quoi la cote est calculée (« même moteur : 335i »). */
function coteModel(c){
  if (c._model !== undefined) return c._model;
  const Y = new Date().getFullYear(), Yf = AN_NOW();
  let R = (c.rows || []).map(r => segRow({prix: num(r[0]), annee: num(r[1]), km: num(r[2]), bo: r[3], pro: r[4], etat: String(r[5] || ''), tx: String(r[7] || ''), raw: String(r[7] || ''), ch: r[8], places: num(r[9]), carr: String(r[10] || ''), id: r[11] || null, lib: String(r[7] || '').split(' | ')[0].slice(0, 90), mo: r[12] || '', portes: num(r[13]), fin: r[14] || '', mec: String(r[15] || '')}))
    .filter(r => r.prix >= 500 && r.prix <= 80000 && r.annee && r.km != null && r.km >= 1000 && r.km <= 450000 && !/majeur|major|important|gros|pieces|non roulant|accident/i.test(r.etat) && !/\b(pour pieces|moteur hs|boite hs|joint de culasse|non roulant|epave)\b/.test(r.tx));
  { const seen = new Set(); R = R.filter(r => { const k = r.prix + '|' + r.annee + '|' + Math.round(r.km / 500); if (seen.has(k)) return false; seen.add(k); return true; }); } // même voiture publiée dans plusieurs villes (garages)
  // Même génération seulement : une annonce d'une autre génération, ou dont la génération est incertaine (années de transition), sort du calcul.
  let horsGen = 0, horsCarr = 0; const mdl = VM_BY[c.base]; const [gid, vid] = String(c.gen || '').split('.'); const gC = mdl && gid ? mdl.gens.find(g => g.id === gid) : null;
  const carr0 = gC && gC.v ? gC.v[0].body : null; // carrosserie de référence de la génération (berline, hayon…)
  if (mdl && gC && (mdl.gens.length > 1 || vid || gC.v)){
    const autre = ['coupe', 'cabriolet', 'gt'];
    R = R.filter(r => { const [ti, ...de] = r.raw.split(' | '); const x = vehResolve({marque: mdl.brand.name, modele: mdl.name, titre: ti, texte: de.join(' '), annee: r.annee, carr: r.carr});
      let ok = x.model === mdl && x.gen && x.statut !== 'incertaine' && x.gen.id === gid;
      if (ok && gC.v){ let xv = x.variant || gC.v[0];
        // carrosserie non écrite : les portes Leboncoin départagent (A3 5 portes = Sportback, 3 portes = A3 3 portes)
        if (x.varHow === 'defaut' && r.portes){ const pb = r.portes <= 3 ? gC.v.find(v => v.body === '3p') : xv.body === '3p' ? gC.v.find(v => v.body === 'hayon') : null; if (pb) xv = pb; }
        r.vb = xv.body; ok = vid ? xv.id === vid : c.toutesCarr || !(autre.includes(xv.body) && xv.body !== carr0); } // cote de génération seule : coupés, cabriolets et GT à part
      if (!ok) horsGen++; return ok; });
  }
  // sans version au catalogue : 2 ou 3 portes (Clio, Golf, 208 3 portes) contre 4 ou 5
  if (!(gC && gC.v)) R.forEach(r => { r.vb = r.portes && r.portes <= 3 ? '3p' : null; });
  // carrosseries mesurées à part (au moins 8 annonces de chaque côté), les plus rares écartées
  let carrs = [];
  if (c.toutesCarr){
    const nb = {}; R.forEach(r => { if (r.vb && r.vb !== carr0) nb[r.vb] = (nb[r.vb] || 0) + 1; });
    carrs = Object.keys(nb).filter(b => nb[b] >= 8 && nb[b] <= R.length - 8);
    const avant = R.length; R = R.filter(r => !r.vb || r.vb === carr0 || carrs.includes(r.vb)); horsCarr = avant - R.length;
  }
  if (R.length < 20){ c._model = null; return null; }
  { const ns = R.filter(r => r.seg.sport).length; if (ns && ns < 8){ horsGen += ns; R = R.filter(r => !r.seg.sport); } } // quelques versions sportives isolées : écartées plutôt que de fausser la cote
  // finitions Leboncoin (Luxe, Sport Design, M Sport…) : lues dans la case Leboncoin, sinon dans le titre et la version
  const nf = {}; R.forEach(r => { if (r.fin) nf[r.fin] = (nf[r.fin] || 0) + 1; });
  // finitions connues : celles de toute la génération quand la cote n'en est qu'une partie (« m sport » n'est pas « sport »)
  const finConnues = [...new Set([...(c.finitions || []).map(normFin), ...Object.keys(nf).filter(f => nf[f] >= 4)])].filter(f => f.length >= 3).sort((a, b) => b.length - a.length);
  R.forEach(r => { if (!r.fin) r.fin = finDans(r.lib, finConnues); });
  const nf2 = {}; R.forEach(r => { if (r.fin) nf2[r.fin] = (nf2[r.fin] || 0) + 1; });
  const fins = Object.keys(nf2).filter(f => nf2[f] >= 12 && nf2[f] <= R.length - 12).sort((a, b) => nf2[b] - nf2[a]).slice(0, 8);
  const auto = R.some(r => r.bo === 2) && R.some(r => r.bo === 1);
  const cnt = {}; SEGS.forEach(([k]) => { cnt[k] = R.filter(r => r.seg[k]).length; });
  // finition haute ou d'entrée devinée au mot près : inutile quand la vraie finition est mesurée ; break : déjà une carrosserie
  const segs = SEGS.filter(([k]) => cnt[k] >= 8 && cnt[k] <= R.length - 8 && !(fins.length && (k === 'finHaute' || k === 'finBasse')) && !(k === 'break' && carrs.includes('break'))).map(([k]) => k);
  const chs = R.map(r => r.chv).filter(Boolean); const chRef = chs.length ? median(chs) : null;
  const useCh = chs.length >= 30 && new Set(chs).size > 1;
  const useEq = R.filter(r => r.eq > 0).length >= 20;
  R.forEach(r => { r.age = ageDe(r, Yf); });
  // puissance en écart relatif (log) : 306 ch contre 122 ch pèse autant qu'une vraie différence de moteur
  const feat = r => [1, r.age, r.km / 10000, r.pro ? 1 : 0, ...(auto ? [r.bo === 2 ? 1 : 0] : []), ...segs.map(k => r.seg[k] ? 1 : 0), ...carrs.map(b => r.vb === b ? 1 : 0), ...fins.map(f => r.fin === f ? 1 : 0), ...(useCh ? [Math.log((r.chv || chRef) / chRef)] : []), ...(useEq ? [r.eq] : [])];
  const names = ['const', 'age', 'km', 'pro', ...(auto ? ['auto'] : []), ...segs, ...carrs.map(b => 'carr:' + b), ...fins.map(f => 'fin:' + f), ...(useCh ? ['ch'] : []), ...(useEq ? ['eq'] : [])];
  let beta = ols(R.map(feat), R.map(r => Math.log(r.prix)));
  const res = () => R.map(r => Math.log(r.prix) - feat(r).reduce((s, v, i) => s + v * beta[i], 0));
  let e = res(); let sig = 1.4826 * median(e.map(Math.abs));
  const keep = R.filter((r, i) => Math.abs(e[i]) <= 3 * sig);
  const out = R.length - keep.length; R = keep;
  beta = ols(R.map(feat), R.map(r => Math.log(r.prix))); e = res();
  sig = Math.sqrt(e.reduce((s, v) => s + v * v, 0) / Math.max(1, e.length - beta.length));
  // carrosserie supposée d'une voiture qui ne la précise pas : la plus courante dans les annonces (A3 : Sportback plutôt que 3 portes)
  let carrMode = carr0; { const nb = {}; R.forEach(r => { const b = r.vb || carr0; if (b) nb[b] = (nb[b] || 0) + 1; }); const k = Object.keys(nb).sort((a, b) => nb[b] - nb[a])[0]; if (k && (k === carr0 || carrs.includes(k))) carrMode = k; }
  c._model = {carrMode, beta, sig, n: R.length, out, horsGen, horsCarr, auto, rows: R, feat, Y, Yf, names, segs, cnt, chRef, useCh, useEq, carrs, carr0, fins, finConnues, nf: nf2};
  return c._model;
}
/* Estimation pour une voiture : prix de marché attendu entre particuliers, fourchette, position de son prix. */
function coteEstim(t, prixOverride){
  const {spec, cote} = coteFor(t);
  if (!cote) return {spec, cote: null};
  const M = coteModel(cote);
  const out = {spec, cote, n: cote.n || 0};
  if (!M){ out.conf = 'faible'; out.why = `${cote.n || 0} annonces exploitables seulement`; return out; }
  const yr = num(t.annee), km = num(t.km);
  if (!yr || km == null){ out.conf = 'faible'; out.why = 'année ou kilométrage inconnu'; out.nClean = M.n; return out; }
  const bo = normBo(t.boite) === 'auto' ? 2 : 1;
  const T = segRow({annee: yr, km, pro: 0, bo, tx: [t.marque, t.titre, t.modele, t.texte].filter(Boolean).join(' | ').slice(0, 1500), ch: t.ch, places: num(t.places), carr: t.carr || '', mo: t.moteur || '', fin: t.finition || '', mec: t.mec || ''});
  // carrosserie : celle reconnue (E92 = coupé), sinon 2-3 portes pour un modèle sans version, sinon celle de référence
  T.vb = M.carr0 ? t.carrosserie || M.carrMode : (num(t.portes) && num(t.portes) <= 3) || t.carrosserie === '3p' ? '3p' : null;
  if (!T.fin) T.fin = finDans([t.titre, t.texte].filter(Boolean).join(' '), M.finConnues);
  T.age = ageDe(T, M.Yf);
  const x = M.feat(T);
  const bi = k => M.names.indexOf(k);
  if (M.useEq && M.beta[bi('eq')] < 0) x[bi('eq')] = 0; // un équipement ne peut pas faire baisser la cote : bruit statistique ignoré
  out.ajust = [];
  M.segs.forEach(k => { if (T.seg[k]){ const b = M.beta[bi(k)]; out.ajust.push({l: SEGS.find(z => z[0] === k)[1], v: b}); } });
  M.carrs.forEach(b => { if (T.vb === b) out.ajust.push({l: `Carrosserie ${V_BODY_NOM[b] || b} (référence : ${V_BODY_NOM[M.carr0] || 'les autres'})`, v: M.beta[bi('carr:' + b)]}); });
  M.fins.forEach(f => { if (T.fin === f) out.ajust.push({l: `Finition ${f.replace(/\b\w/g, ch => ch.toUpperCase())}`, v: M.beta[bi('fin:' + f)]}); });
  if (M.useCh && T.chv) { const b = M.beta[bi('ch')] * Math.log(T.chv / M.chRef); if (Math.abs(b) > 0.01) out.ajust.push({l: `${T.chv} ch (référence ${M.chRef} ch)`, v: b}); }
  if (M.useEq && T.eq) { const b = M.beta[bi('eq')] * T.eq; if (b > 0.01) out.ajust.push({l: `${T.eq} équipement(s) recherché(s)`, v: b}); }
  out.segT = SEGS.filter(([k]) => T.seg[k]).map(([k, l]) => ({k, l, n: M.cnt[k]}));
  out.chT = T.chv; out.carrT = T.vb || null; out.finT = T.fin || null;
  const lp = x.reduce((s, v, i) => s + v * M.beta[i], 0);
  const P = Math.exp(lp);
  const r50 = v => Math.round(v / 50) * 50;
  out.P = r50(P); out.lo = r50(P * Math.exp(-0.674 * M.sig)); out.hi = r50(P * Math.exp(0.674 * M.sig));
  out.nClean = M.n; out.out = M.out;
  // annonces vraiment comparables : même moteur (ou puissance à 5 % près) et même carrosserie, année ± 1, km ± 30 000
  const memeMo = r => T.mo ? r.mo === T.mo || (!r.mo && T.chv && r.chv && Math.abs(r.chv / T.chv - 1) <= 0.05) : !T.chv || !r.chv || Math.abs(r.chv / T.chv - 1) <= 0.05;
  const memeCarr = r => (r.vb || M.carr0) === (T.vb || M.carr0);
  const nb = M.rows.filter(r => Math.abs(r.annee - yr) <= 1 && Math.abs(r.km - km) <= 30000 && memeMo(r) && memeCarr(r));
  const segSpec = ['societe', 'break', 'sport'].filter(k => T.seg[k]);
  out.nb = nb.length; out.medNb = nb.length >= 5 ? median(nb.map(r => r.prix)) : null;
  out.parKm = Math.round(P * (1 - Math.exp(M.beta[2])));
  out.parAn = Math.round(P * (1 - Math.exp(M.beta[1])));
  out.conf = M.n >= 150 && nb.length >= 15 ? 'forte' : M.n >= 60 && nb.length >= 6 ? 'moyenne' : 'faible';
  if (out.conf === 'faible') out.why = M.n < 60 ? `${M.n} annonces exploitables, il en faut 60` : `${nb.length ? `seulement ${nb.length}` : 'aucune'} annonce${nb.length > 1 ? 's' : ''} du même moteur et de la même carrosserie proche${nb.length > 1 ? 's' : ''} (année ± 1, km ± 30 000) : la cote prolonge les annonces les plus proches`;
  if (yr < cote.y0 || yr > cote.y1) { out.conf = 'faible'; out.why = 'année hors de la cote'; }
  const manque = out.segT.filter(sg => ['societe', 'break', 'sport'].includes(sg.k) && (!M.segs.includes(sg.k) || sg.n < 15) && !(sg.k === 'break' && M.carrs.includes('break')));
  out.segInfo = segSpec.map(k => `${M.cnt[k]} ${({societe: 'versions société', break: 'breaks', sport: 'versions sportives'})[k]}`).join(', ');
  if (manque.length){ out.conf = 'faible'; out.why = `${manque.map(sg => sg.l.toLowerCase()).join(', ')} : seulement ${manque.map(sg => sg.n).join(', ')} annonce(s) comparable(s) dans la cote, prix non comparable à une version classique`; }
  if (T.vb && M.carr0 && T.vb !== M.carr0 && !M.carrs.includes(T.vb)){ out.conf = 'faible'; out.why = `${V_BODY_NOM[T.vb] || T.vb} : trop peu d'annonces de cette carrosserie dans la cote, prix calculé comme une ${V_BODY_NOM[M.carr0] || M.carr0}`; }
  const lpBase = lp - out.ajust.reduce((s2, a) => s2 + a.v, 0);
  out.ajust.forEach(a => { a.eur = Math.round((Math.exp(lpBase + a.v) - Math.exp(lpBase)) / 10) * 10; });
  const prix = num(prixOverride ?? t.prix);
  if (prix){ const z = (Math.log(prix) - lp) / (M.sig || 0.2); out.moinsCherQue = Math.round((1 - PHI(z)) * 100); out.ecart = out.P - prix; out.pct = out.ecart / out.P; }
  out.age = cote.maj ? Math.round((Date.now() - Date.parse(cote.maj)) / 86400000) : null;
  // valeur dans 1 an : un an de plus et 15 000 km de plus, mêmes coefficients mesurés
  out.dans1an = r50(P * Math.exp(M.beta[1] + M.beta[2] * 1.5));
  // annonces comparables : même moteur et même carrosserie d'abord, puis puissance, type (société, break), finition, année et kilométrage
  const segD = r => ['societe', 'break', 'sport'].reduce((s2, k) => s2 + (r.seg[k] !== T.seg[k] ? 4 : 0), 0) + (r.seg.finHaute !== T.seg.finHaute ? 0.5 : 0);
  const dist = r => segD(r) + (memeMo(r) ? 0 : 8) + (T.chv && r.chv ? Math.min(6, Math.abs(Math.log(r.chv / T.chv)) * 15) : 0) + (memeCarr(r) ? 0 : 5) + (T.fin && r.fin && r.fin !== T.fin ? 0.7 : 0) + Math.abs(r.annee - yr) + Math.abs(r.km - km) / 20000;
  out.comps = M.rows.map(r => ({r, d: dist(r)})).sort((a, b) => a.d - b.d).slice(0, 8)
    .map(({r}) => ({prix: r.prix, annee: r.annee, km: r.km, lib: r.lib || '', id: r.id, pro: r.pro ? 1 : 0, ch: r.chv || null, carr: r.vb ? V_BODY_NOM[r.vb] || r.vb : null, fin: r.fin ? r.fin.replace(/\b\w/g, ch => ch.toUpperCase()) : null}));
  return out;
}

function parseCard(it){
  const x = String(it.x || ''); const lines = x.split('\n').map(s => s.trim()).filter(Boolean);
  const nb = s => num(String(s).replace(/[\s\u00a0\u202f.]/g,''));
  const pm = x.match(/Prix\s*:\s*([\d\s\u00a0\u202f.]+)\s*€/) || x.match(/(\d{1,3}(?:[\s\u00a0\u202f.]\d{3})+|\d{3,6})\s*€/);
  let prix = pm ? nb(pm[1]) : null; if (prix != null && (prix < 300 || prix > 250000)) prix = null;
  const am = x.match(/Ann[ée]e[^:\n"]{0,14}:?\s*"?\s*((?:19[89]|20[0-3])\d)/) || x.match(/(?:^|[·\s(|,])((?:19[89]|20[0-3])\d)(?=[·\s)|,]|$)/m);
  let annee = am ? num(am[1]) : null; if (annee != null && (annee < 1985 || annee > new Date().getFullYear() + 1)) annee = null;
  const km0 = x.match(/Kilom[ée]trage\s*:?\s*"?\s*([\d\s\u00a0\u202f.]+?)\s*km/i) || x.match(/(\d{1,3}(?:[\s\u00a0\u202f.]\d{3})+|\d{4,6})\s*km\b/i);
  let km = km0 ? nb(km0[1]) : null; if (km != null && (km < 0 || km > 600000)) km = null;
  const en = (x.match(/[ÉE]nergie\s*:?\s*"?\s*([A-Za-zÀ-ÿ ]{3,25}?)\s*(?:"|\n|\.|$)/) || x.match(/\b(Diesel|Essence|Hybride rechargeable|Hybride|[ÉE]lectrique|GPL)\b/i) || [])[1] || '';
  const bo = (x.match(/Bo[iî]te de vitesses?\s*:?\s*"?\s*(Manuelle|Automatique)/i) || x.match(/\b(Manuelle|Automatique)\b/i) || [])[1] || '';
  const loc = x.match(/Situ[ée]e? à\s+(.+?)\s+(\d{5})/) || x.match(/(?:^|\n)\s*([A-ZÀ-Ý][^\n\d€:]{1,45}?)\s+(\d{5})(?=\s|$)/);
  const skip = l => /€/.test(l) || /^(Prix|Ann[ée]e|Kilom|[ÉE]nergie|Bo[iî]te|Situ[ée]|·|Garantie|Annonce)/i.test(l) || /^(À la une|Sponsoris[ée]|Pro|Particulier|Vendeur professionnel\.?|Pack S[ée]r[ée]nit[ée]|Paiement s[ée]curis[ée]|Tr[èe]s bonne affaire|Bonne affaire|Prix [ée]quitable|Prix [ée]lev[ée]|Baisse de prix|Urgent|Nouveau|Livraison possible|Manuelle|Automatique|Diesel|Essence|Hybride|[ÉE]lectrique|\d[\d\s]*(km)?)$/i.test(l) || /^[^\d]{1,45}\s\d{5}(\s|$)/.test(l);
  const titre = (it.t || lines.find(l => l.length >= 4 && !skip(l)) || '').slice(0, 140);
  const url = it.u || '';
  const id = (url.match(/(\d{6,})/) || [])[1] || url;
  const out = {id, url, titre, prix, annee, km, energie: en.trim(), boite: bo.trim(), ville: loc ? loc[1].trim() : '', cp: loc ? loc[2] : '', pro: /Vendeur professionnel/i.test(x) || lines.includes('Pro'), badge: (x.match(/Très bonne affaire|Bonne affaire|Prix équitable|Prix élevé/i) || [''])[0]};
  const F = it.f; // données exactes lues par l'extension (Leboncoin)
  if (F){ ['prix','annee','km'].forEach(k => { if (num(F[k])) out[k] = num(F[k]); }); ['energie','boite','ville','cp'].forEach(k => { if (F[k]) out[k] = String(F[k]); }); out.pro = !!F.pro; if (num(F.ch)) out.ch = num(F.ch); }
  return out;
}

/* ================= Interface pour utopicar.fr ================= */
const cotes = {list: []};
const versRow = a => [num(a.prix), num(a.annee), num(a.km), normBo(a.boite) === 'auto' ? 2 : 1, a.pro ? 1 : 0, a.etat || '', null, [a.titre, a.texte].filter(Boolean).join(' | ').slice(0, 900), num(a.ch), num(a.places), a.carr || '', a.id || null, a.moteur || '', num(a.portes), a.finition || '', a.mec || ''];
const simple = g => g ? {id: g.id, label: g.label, y0: g.y0, y1: g.y1, open: !!g.open} : null;

/** Catalogue marque → modèle → génération (pour les listes de choix). */
export const CATALOGUE = VB_SORT_UT().map(b => ({key: b.key, name: b.name, lbc: b.ok ? b.lbc : '', models: b.models.slice().sort((x, y) => x.name.localeCompare(y.name, 'fr', {numeric: true})).map(m => ({key: m.key, name: m.name, lbc: b.ok && m.lbc ? b.lbc + '_' + m.lbc : '', regex: vModelRegex(m), gens: m.gens.map(g => ({...simple(g), v: (g.v || []).map(v => ({id: v.id, label: v.label, y0: v.y0, y1: v.y1, body: v.body}))}))}))}));
function VB_SORT_UT(){ return VB.slice().sort((a, b) => a.name.localeCompare(b.name, 'fr', {numeric: true, sensitivity: 'base'})); }

/** Marque, modèle, génération d'une annonce (règles fixes). */
export function reconnaitre(t){
  const r = vehResolve(t);
  return {marque: r.brand ? r.brand.name : '', modele: r.model ? r.model.name : '', base: r.base || '', gen: simple(r.gen), statut: r.statut || '', label: r.label || '', pourquoi: r.pourquoi || ''};
}

/** Prépare la cote d'une génération à partir d'annonces (relevées ou en base). t : la voiture de référence. */
export function preparerCote(t, annonces){
  const spec = coteSpec(t);
  if (!spec) return null;
  if (spec.incertain) return {incertain: true, nom: spec.nom};
  const c = {cle: spec.cle, nom: spec.nom, base: spec.base, gen: spec.gen, energie: spec.energie, y0: spec.y0, y1: spec.y1, n: annonces.length, rows: annonces.map(versRow), maj: null};
  return c;
}

/** Estimation pour une voiture avec une cote préparée : prix attendu, fourchette, position, comparables. */
export function estimer(c, t, prix){
  if (!c || c.incertain) return null;
  cotes.list = [c];
  const e = coteEstim(t, prix);
  const M = c._model;
  return {
    nom: c.nom, n: e.n, nClean: e.nClean ?? 0, conf: e.conf || 'faible', why: e.why || '', P: e.P ?? null, lo: e.lo ?? null, hi: e.hi ?? null,
    ecart: e.ecart ?? null, pct: e.pct ?? null, moinsCherQue: e.moinsCherQue ?? null, dans1an: e.dans1an ?? null, parKm: e.parKm ?? null, parAn: e.parAn ?? null,
    ajust: (e.ajust || []).map(a => ({l: a.l, eur: a.eur})), segments: (e.segT || []).map(s => s.l), ch: e.chT ?? null, comps: e.comps || [], medProches: e.medNb ?? null, nProches: e.nb ?? 0,
    horsGen: M ? M.horsGen + (M.horsCarr || 0) : 0, ecartees: M ? M.out : 0,
    carrosserie: e.carrT ? V_BODY_NOM[e.carrT] || e.carrT : null, finition: e.finT ? e.finT.replace(/\b\w/g, ch => ch.toUpperCase()) : null, base: c.libelle || '',
  };
}

/** Points du nuage pour le graphique : annonces gardées par la cote (même génération), avec leurs segments. */
export function points(c){
  if (!c || !c._model) return [];
  const M = c._model;
  return M.rows.map(r => ({prix: r.prix, annee: r.annee, km: r.km, auto: r.bo === 2, pro: !!r.pro, id: r.id, lib: r.lib, segs: [...SEGS.filter(([k]) => r.seg[k]).map(([, l]) => l), ...(r.vb && r.vb !== M.carr0 ? [V_BODY_NOM[r.vb] || r.vb] : [])], ch: r.chv, eq: r.eq}));
}

export const SEGMENTS = SEGS.map(([k, l]) => ({k, l}));
export { parseCard, normEn, normBo };

/* Génération connue (choisie dans la recherche, ou reconnue une fois pour toutes) : cote et estimations sans nouvelle reconnaissance. */
function pickDe(base, genId){
  const model = VM_BY[base]; const gen = model ? model.gens.find(g => g.id === genId) : null;
  return model && gen ? {brand: model.brand, model, gen} : null;
}
/** Génération d'une annonce dont le modèle est connu (même règle que la cote : incertaine = hors calcul). */
export function generationDe(base, a){
  const model = VM_BY[base]; if (!model) return null;
  // a.mec : 1re mise en circulation « AAAA-MM » (critère Leboncoin) ; elle sépare deux générations vendues la même année
  const x = vehResolve({marque: model.brand.name, modele: model.name, titre: a.titre || '', texte: a.texte || '', annee: num(a.annee), mec: a.mec || '', carr: a.carr || ''});
  if (x.model !== model) return null;
  return {id: x.gen && x.statut !== 'incertaine' ? x.gen.id : null, label: x.gen ? x.gen.label : '', statut: x.statut || '', variant: x.variant && x.variant.id || null, varianteEcrite: !!(x.variant && x.varHow !== 'defaut'), body: x.body || null,
    cands: x.statut === 'incertaine' ? (x.cands || []).map(g => g.id) : []};
}
/** Ce qu'il faut demander à Leboncoin (via Apify) pour compléter la base d'une génération, d'une version et d'une énergie : même demande que l'outil Garage. */
export function specCollecte(base, genId, variantId, energie){
  const pick = pickDe(base, genId); if (!pick) return null;
  const v = variantId && pick.gen.v ? pick.gen.v.find(x => x.id === variantId) || null : null;
  const s = coteSpec({pick: {...pick, variant: v && v !== pick.gen.v[0] ? v : null}, energie: energie || ''});
  return s && !s.incertain ? {cle: s.cle, nom: s.nom, base: s.base, gen: s.gen, energie: s.energie, y0: s.y0, y1: s.y1, filtres: s.filtres} : null;
}
/** Cote d'une génération et d'une énergie à partir d'annonces (les autres générations sont écartées par le moteur). */
export function coteGeneration(base, genId, energie, annonces, opts){
  const pick = pickDe(base, genId); if (!pick) return null;
  const c = preparerCote({pick, energie: energie || ''}, annonces);
  if (c && !c.incertain && opts){ c.toutesCarr = !!opts.toutesCarr; c.finitions = opts.finitions || []; if (opts.libelle){ c.libelle = opts.libelle; c.nom += ' · ' + opts.libelle; } }
  return c;
}
/** Estimation d'une annonce dans une cote de génération. */
export function estimerDans(c, base, genId, a, prix){
  const pick = pickDe(base, genId); if (!pick || !c) return null;
  return estimer(c, {...a, pick, energie: c.energie || a.energie || ''}, prix);
}
/** Modèle du catalogue par sa clé (« renault clio ») : nom, motif, générations. */
export function modeleDe(base){
  const m = VM_BY[base]; if (!m) return null;
  return {base, marque: m.brand.name, nom: m.name, regex: vModelRegex(m), gens: m.gens.map(g => ({...simple(g), v: (g.v || []).map(v => ({id: v.id, label: v.label, y0: v.y0, y1: v.y1, body: v.body}))}))};
}
