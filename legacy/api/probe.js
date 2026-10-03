export default async function handler(req, res) {
  if (!process.env.UTP_KEY || req.query.k !== process.env.UTP_KEY) return res.status(404).send('Not found');
  const url = req.query.u;
  if (!url || !/^https:\/\/(www\.)?(leboncoin\.fr|lacentrale\.fr|autoscout24\.fr|leparking\.fr)\//.test(url)) return res.status(400).json({error:'site non autorisé'});
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
    }, redirect: 'follow' });
    const html = await r.text();
    res.status(200).json({ status: r.status, ms: Date.now()-t0, len: html.length, next: html.includes('__NEXT_DATA__'), blocked: r.status === 403 });
  } catch (e) { res.status(200).json({ error: String(e) }); }
}
