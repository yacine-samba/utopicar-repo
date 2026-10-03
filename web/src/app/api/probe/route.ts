/* Test de lecture des sites d'annonces depuis le serveur (repris de api/probe.js).
   Protégé par la variable UTP_KEY : sans la bonne clé, la route répond « introuvable ». */
const SITES = /^https:\/\/(www\.)?(leboncoin\.fr|lacentrale\.fr|autoscout24\.fr|leparking\.fr)\//;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  if (!process.env.UTP_KEY || q.get("k") !== process.env.UTP_KEY) return new Response("Not found", { status: 404 });
  const url = q.get("u");
  if (!url || !SITES.test(url)) return Response.json({ error: "site non autorisé" }, { status: 400 });
  const t0 = Date.now();
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });
    const html = await r.text();
    return Response.json({ status: r.status, ms: Date.now() - t0, len: html.length, next: html.includes("__NEXT_DATA__"), blocked: r.status === 403 });
  } catch (e) {
    return Response.json({ error: String(e) });
  }
}
