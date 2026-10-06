// Import d'une annonce par son lien : Leboncoin (acteur « Leboncoin Ad Details Scraper »), La Centrale (memo23/lacentrale-scraper)
// ou AutoScout24 (blackfalcondata/autoscout24-scraper). La fonction renvoie l'annonce au format Leboncoin (celui que lit l'outil),
// jusqu'à 6 photos prêtes à analyser et les liens de 30 photos au plus pour le rapport.
// Réservé aux personnes connectées (jeton de session vérifié ici), 30 imports par jour et par personne.
// Le jeton Apify reste dans la table `reglages` : il n'apparaît jamais côté navigateur.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const ACTEUR = "silentflow~leboncoin-details-scraper-ppr";
const ACTEUR_LC = "memo23~lacentrale-scraper";
const ACTEUR_AS24 = "blackfalcondata~autoscout24-scraper";
const MAX_LIENS = 30;
const MAX_PAR_JOUR = 30;
const MAX_PHOTOS = 6;

function cors(origin: string | null) {
  const ok = origin && (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) || /^https:\/\/(www\.)?utopicar\.fr$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "https://utopicar.fr",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
}

/** Lien Leboncoin d'une annonce → URL canonique, sinon null. */
function lienLbc(brut: string): string | null {
  try {
    const u = new URL(brut.trim());
    if (!/(^|\.)leboncoin\.fr$/.test(u.hostname)) return null;
    const id = (u.pathname.match(/\/(\d{6,})(?:\.htm)?\/?$/) || [])[1];
    if (!id) return null;
    const cat = (u.pathname.match(/^\/(?:ad\/)?([a-z_]+)\//) || [])[1] || "voitures";
    return `https://www.leboncoin.fr/ad/${cat}/${id}`;
  } catch {
    return null;
  }
}

/** Lien La Centrale ou AutoScout24 d'une annonce, sinon null. */
function lienAutre(brut: string): { url: string; site: "lacentrale" | "autoscout24" } | null {
  try {
    const u = new URL(brut.trim());
    if (/(^|\.)lacentrale\.fr$/.test(u.hostname) && /\/auto-occasion-annonce-\d{6,}\.html$/.test(u.pathname)) return { url: `https://www.lacentrale.fr${u.pathname}`, site: "lacentrale" };
    if (/(^|\.)autoscout24\.[a-z.]{2,6}$/.test(u.hostname) && /^\/(offres|offers|angebote|annunci|ofertas|aanbod)\//.test(u.pathname)) return { url: `https://${u.hostname}${u.pathname}`, site: "autoscout24" };
  } catch { /* lien illisible */ }
  return null;
}

const o = (x: unknown): Record<string, any> => (x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, any>) : {});
const premier = (...v: unknown[]) => v.find((x) => x != null && x !== "");
const nombre = (x: unknown) => {
  if (x == null) return null;
  if (typeof x === "number") return isFinite(x) ? x : null;
  const m = String(x).replace(/[^\d]/g, "");
  return m ? Number(m) : null;
};

// Libellés lisibles pour les champs « à plat » que l'acteur peut renvoyer à la place des attributs Leboncoin.
const LIBELLES: Record<string, string> = {
  brand: "Marque", model: "Modèle", regdate: "Année modèle", year: "Année", mileage: "Kilométrage", fuel: "Énergie",
  gearbox: "Boîte de vitesse", horsepower: "Puissance fiscale", horse_power_din: "Puissance DIN", doors: "Nombre de portes",
  seats: "Nombre de places", vehicle_type: "Type de véhicule", color: "Couleur", issuance_date: "Date de première mise en circulation",
  vehicle_technical_inspection_a: "Contrôle technique", vehicle_damage: "État du véhicule", critair: "Crit'Air",
};

/** Ramène l'élément renvoyé par l'acteur au format d'une annonce Leboncoin (celui que lit l'outil). */
function normaliser(it: Record<string, any>) {
  const ad = o(premier(it.ad, it.data, it));
  // L'acteur renvoie key/keyLabel/valueLabel (camelCase) : on revient aux noms de Leboncoin (key_label, value_label).
  const attrs: any[] = (Array.isArray(ad.attributes) ? ad.attributes.map(o) : []).map((a) => ({
    key: a.key, key_label: premier(a.key_label, a.keyLabel) ?? "", value: a.value, value_label: premier(a.value_label, a.valueLabel, a.value) ?? "",
  }));
  if (!attrs.some((a) => a.key_label)) {
    for (const [k, l] of Object.entries(LIBELLES)) {
      const v = premier(ad[k], o(ad.attributes)[k], o(ad.vehicle)[k]);
      if (v != null && typeof v !== "object") attrs.push({ key: k, key_label: l, value: String(v), value_label: String(v) });
    }
  }
  const loc = o(premier(ad.location, it.location));
  const prix = Array.isArray(ad.price) ? ad.price[0] : typeof ad.price === "object" && ad.price ? premier(ad.price.value, ad.price.amount) : premier(ad.price, it.price);
  let imgs: any = premier(ad.images, it.images, ad.photos, it.photos) ?? [];
  if (!Array.isArray(imgs)) imgs = premier(imgs.urls_large, imgs.urls, imgs.urls_thumb) ?? [];
  const photos = (imgs as any[]).map((x) => (typeof x === "string" ? x : premier(x?.url, x?.large, x?.src) ?? "")).filter((x: string) => /^https?:\/\//.test(x));
  const owner = o(premier(ad.owner, it.owner, it.seller));
  const typeVendeur = premier(owner.type, ad.ownerType, it.ownerType, ad.owner_type, it.owner_type) ?? null;
  // Leboncoin ne donne pas le numéro (il faut être connecté et cliquer) : seulement le prénom et la présence d'un téléphone.
  const vendeur = {
    nom: String(premier(owner.name, ad.ownerName, it.ownerName, "") ?? "").slice(0, 60) || null,
    type: typeVendeur === "pro" ? "pro" : typeVendeur === "private" ? "particulier" : null,
    aTel: Boolean(premier(ad.has_phone, ad.hasPhone, it.hasPhone, it.has_phone, false)),
  };
  return {
    ad: {
      subject: premier(ad.subject, ad.title, it.title, ""),
      body: premier(ad.body, ad.description, it.description, ""),
      price: nombre(prix) != null ? [nombre(prix)] : [],
      location: {
        city: premier(loc.city, loc.city_label, it.city) ?? null,
        zipcode: premier(loc.zipcode, loc.zip, it.zipcode) ?? null,
        department_name: premier(loc.department_name, loc.department, ad.department, it.department) ?? null,
      },
      owner: { type: typeVendeur },
      attributes: attrs,
    },
    photos,
    vendeur,
  };
}

const ENERGIES: Record<string, string> = { essence: "Essence", gasoline: "Essence", petrol: "Essence", diesel: "Diesel", electric: "Électrique", hybrid: "Hybride", plugin_hybrid: "Hybride rechargeable", "plug-in hybrid": "Hybride rechargeable", bio_essence_gpl: "GPL", lpg: "GPL" };
const BOITES: Record<string, string> = { manual: "Manuelle", auto: "Automatique", automatic: "Automatique", "semi-automatic": "Automatique" };

/** Annonce La Centrale ou AutoScout24 ramenée au format Leboncoin, avec ses photos et son vendeur. */
function normaliserAutre(site: "lacentrale" | "autoscout24", it: Record<string, any>) {
  const lc = site === "lacentrale";
  const annee = lc ? it.year : nombre(String(it.firstRegistration ?? "").split("-").pop());
  const vals: [string, string, unknown][] = [
    ["brand", "Marque", it.make], ["model", "Modèle", lc ? (it.commercialName ?? it.model) : it.model],
    ["u_car_version", "Version", lc ? it.version : (it.modelVersion ?? it.title)], ["regdate", "Année modèle", annee],
    ["issuance_date", "Date de première mise en circulation", lc ? null : it.firstRegistration?.replace("-", "/")],
    ["mileage", "Kilométrage", lc ? it.mileage : it.mileageKm],
    ["fuel", "Énergie", ENERGIES[String((lc ? it.energy : it.fuelType) ?? "").toLowerCase()] ?? (lc ? it.energy : it.fuelType)],
    ["gearbox", "Boîte de vitesse", BOITES[String((lc ? it.gearbox : it.transmission) ?? "").toLowerCase()] ?? (lc ? it.gearbox : it.transmission)],
    ["horse_power_din", "Puissance DIN", lc ? it.powerDin ?? null : it.powerHp], ["doors", "Nombre de portes", lc ? it.doors : it.numberOfDoors],
    ["color", "Couleur", lc ? it.externalColor : it.bodyColor], ["vehicle_technical_inspection_a", "Contrôle technique", lc ? null : it.nextInspection],
  ];
  const attributes = vals.filter(([, , v]) => v != null && v !== "" && typeof v !== "object").map(([key, key_label, v]) => ({ key, key_label, value: String(v), value_label: String(v) }));
  let imgs: unknown = premier(it.images, it.photos, it.pictures, it.photoUrls);
  if (!Array.isArray(imgs)) imgs = it.photoUrl ? [it.photoUrl] : [];
  const photos = (imgs as any[]).map((x) => (typeof x === "string" ? x : premier(x?.url, x?.large, x?.src) ?? "")).filter((x: string) => /^https?:\/\//.test(x))
    // grand format : AutoScout24 sert des vignettes 250x188, La Centrale des 352x264
    .map((u: string) => u.replace(/\/\d{2,4}x\d{2,4}\.webp$/, "/720x540.webp").replace(/([?&])size=\d+x\d+/, "$1size=1024x768"));
  const pro = lc ? it.customerType === "PRO" : /dealer/i.test(String(it.sellerType ?? ""));
  return {
    ad: {
      subject: lc ? [it.make, it.commercialName ?? it.model, it.version].filter(Boolean).join(" ") : (it.title ?? ""),
      body: String(premier(it.description, it.descriptionMarkdown, it.comment, "") ?? "").slice(0, 8000),
      price: nombre(premier(it.price, it.priceEur)) != null ? [nombre(premier(it.price, it.priceEur))] : [],
      location: { city: lc ? null : (it.city ?? null), zipcode: lc ? null : (it.zip ?? null), department_name: lc ? (it.departmentCode ? `département ${it.departmentCode}` : null) : null },
      owner: { type: pro ? "pro" : "private" },
      attributes,
    },
    photos,
    vendeur: { nom: String(it.sellerName ?? "").slice(0, 60) || null, type: pro ? "pro" : "particulier", aTel: Boolean(it.phone ?? it.sellerPhone) },
  };
}

/** Tous les champs simples de l'élément, en texte : filet de sécurité si le format change. */
function aplatir(x: unknown, prefixe = "", out: string[] = []): string[] {
  if (out.length > 120) return out;
  if (Array.isArray(x)) x.slice(0, 30).forEach((v) => aplatir(v, prefixe, out));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) { if (!/image|photo|thumb|url|_id$|^id$/i.test(k)) aplatir(v, k, out); }
  else if (x != null && x !== "" && String(x).length < 300) out.push(`${prefixe} : ${x}`);
  return out;
}

function enBase64(b: Uint8Array) {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}
async function photo(u: string): Promise<string | null> {
  try {
    const x = new URL(u);
    if (/leboncoin/.test(x.hostname)) x.searchParams.set("rule", "ad-image");
    const r = await fetch(x.toString(), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image/")) return null;
    const b = new Uint8Array(await r.arrayBuffer());
    if (b.byteLength > 900_000) return null;
    return `data:${(r.headers.get("content-type") || "image/jpeg").split(";")[0]};base64,${enBase64(b)}`;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: h });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "POST") return json({ ok: false, erreur: "methode" }, 405);

  const jeton = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: qui } = jeton ? await sb.auth.getUser(jeton) : { data: { user: null } };
  const user = qui?.user;
  if (!user) return json({ ok: false, erreur: "connexion" }, 401);

  let body: any = {};
  try { body = await req.json(); } catch { /* vide */ }
  const lbc = lienLbc(String(body.url || ""));
  const autre = lbc ? null : lienAutre(String(body.url || ""));
  const url = lbc ?? autre?.url;
  if (!url) return json({ ok: false, erreur: "lien" }, 400);

  // plus d'analyse disponible : aucun import (Apify est payant), la personne est invitée à changer de formule
  const { data: reste } = await sb.rpc("analyses_restantes", { p_uid: user.id });
  if (typeof reste === "number" && reste <= 0) return json({ ok: false, erreur: "quota" }, 402);

  const depuis = new Date(Date.now() - 86400_000).toISOString();
  const { count } = await sb.from("imports_annonces").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", depuis);
  if ((count ?? 0) >= MAX_PAR_JOUR) return json({ ok: false, erreur: "trop" }, 429);

  const { data: cfg } = await sb.from("reglages").select("valeur").eq("cle", "apify_token").maybeSingle();
  if (!cfg?.valeur) return json({ ok: false, erreur: "config" }, 503);

  // une annonce, page complète (description et toutes les photos)
  const [acteur, entree, cout] = autre?.site === "lacentrale"
    ? [ACTEUR_LC, { startUrls: [{ url }], scrapeDetailPages: true, maxItems: 1 }, 0.01]
    : autre?.site === "autoscout24"
      ? [ACTEUR_AS24, { searchUrls: [url], maxResults: 1, includeDetails: true }, 0.006]
      : [ACTEUR, { urls: [url], maxItems: 1 }, 0.001];
  let items: any[] = [];
  let statut = "ok";
  try {
    const r = await fetch(`https://api.apify.com/v2/acts/${acteur}/run-sync-get-dataset-items?token=${encodeURIComponent(cfg.valeur)}&timeout=110&memory=1024&maxTotalChargeUsd=0.05`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entree),
    });
    const t = await r.text();
    if (!r.ok) { statut = `apify ${r.status}`; console.error("apify", r.status, t.slice(0, 300)); }
    else { const j = JSON.parse(t); items = Array.isArray(j) ? j : []; }
  } catch (e) {
    statut = "apify injoignable";
    console.error("apify", String(e));
  }
  const it = items.map(o).find((x) => !x.error && !x.errorMessage);
  if (!it) statut = statut === "ok" ? "introuvable" : statut;
  await sb.from("imports_annonces").insert({ user_id: user.id, url, statut, cout_usd: it ? cout : 0 });
  if (!it) return json({ ok: false, erreur: statut === "introuvable" ? "introuvable" : "apify" }, 502);

  const { ad, photos: liens, vendeur } = autre ? normaliserAutre(autre.site, it) : normaliser(it);
  const photos = (await Promise.all(liens.slice(0, MAX_PHOTOS).map(photo))).filter(Boolean);
  // liens d'origine (grand format, 30 au plus) : affichés sur les cartes et le rapport, sans rien stocker
  const grands = liens.slice(0, MAX_LIENS).map((u) => { try { const x = new URL(u); if (/leboncoin/.test(x.hostname)) x.searchParams.set("rule", "ad-large"); return x.toString(); } catch { return u; } });
  return json({ ok: true, url, src: autre?.site ?? "leboncoin", ad, brut: aplatir(it).join("\n").slice(0, 6000), photos, liens: grands, vendeur });
});
