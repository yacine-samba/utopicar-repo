/* Copie faite par l'extension « UTOPICAR Scanner » (texte commençant par UTPIMPORT{…}) :
   convertie en texte lisible pour l'analyse. Port de importToText de l'outil UTOPICAR Garage. */

type Objet = Record<string, unknown>;
const obj = (x: unknown): Objet => (x && typeof x === "object" ? (x as Objet) : {});
const pick = (o: Objet, cles: string[]) => {
  for (const k of cles) if (o[k] != null && o[k] !== "") return o[k];
  return null;
};
const BRUIT = /^(rating_score|rating_count|ad_warranty_type|vehicle_available_payment_methods|vehicle_is_eligible_p2p|car_price_min|car_price_max|car_price_positioning|vehicle_history_report_status|licence_plate_available|is_import|u_car_brand|u_car_model|vehicle_vsp|argus_object_id|spare_parts_availability|estimated_parcel_weight|shippable|.*_id)$/i;

export const PREFIXE_EXTENSION = "UTPIMPORT";

/** Texte de l'annonce à partir de la copie de l'extension, ou null si ce n'en est pas une. */
export function texteDepuisExtension(brut: string): string | null {
  if (!brut.startsWith(PREFIXE_EXTENSION)) return null;
  let o: Objet;
  try {
    o = obj(JSON.parse(brut.slice(PREFIXE_EXTENSION.length)));
  } catch {
    return null;
  }
  const ad = obj(o.ad);
  const lds = (Array.isArray(o.ld) ? o.ld : []).flatMap((x) => (Array.isArray(x) ? x : (obj(x)["@graph"] as unknown[]) ?? [x])).map(obj);
  const ld = lds.find((x) => /Car|Vehicle|Product|Offer/i.test(([] as unknown[]).concat(x["@type"] ?? "").join(" "))) ?? {};
  const out: string[] = [];
  const prixBrut = Array.isArray(ad.price) ? ad.price[0] : typeof ad.price === "object" && ad.price ? pick(obj(ad.price), ["amount", "value", "price"]) : (ad.price ?? pick(obj(ld.offers), ["price"]));
  // Le titre en première ligne : c'est ce que la lecture de l'annonce prend comme titre.
  out.push(String(pick(ad, ["subject", "title", "name"]) ?? ld.name ?? o.title ?? o.ogTitle ?? ""), `Source : ${o.src ?? ""}`, `Lien : ${o.url ?? ""}`);
  if (prixBrut != null) out.push(`Prix : ${prixBrut} €`);
  const loc = obj(ad.location);
  const ville = [loc.city ?? loc.city_label, loc.zipcode ?? loc.zip].filter(Boolean).join(" ");
  if (ville) out.push(`Localisation : ${ville}${loc.department_name ? ` (${loc.department_name})` : ""}`);
  const owner = obj(ad.owner);
  if (owner.type) out.push(`Vendeur : ${owner.type === "pro" ? "Vendeur professionnel" : owner.type === "private" ? "particulier" : owner.type}`);
  const vus = new Set<string>();
  const attrs = (Array.isArray(ad.attributes) ? ad.attributes : []).map(obj).flatMap((a) => {
    const k = String(a.key ?? "");
    const l = String(a.key_label ?? "");
    const v = a.value_label != null && a.value_label !== "" ? String(a.value_label) : a.value != null ? String(a.value) : "";
    if (!l || BRUIT.test(k) || !v || v.length > 160 || vus.has(l + v)) return [];
    vus.add(l + v);
    return [`- ${l} : ${v}`];
  });
  if (attrs.length) out.push("Caractéristiques :", ...attrs);
  const pmin = (Array.isArray(ad.attributes) ? ad.attributes : []).map(obj).find((a) => a.key === "car_price_min")?.value;
  const pmax = (Array.isArray(ad.attributes) ? ad.attributes : []).map(obj).find((a) => a.key === "car_price_max")?.value;
  if (pmin && pmax) out.push(`Estimation du site : ${pmin} € - ${pmax} €`);
  const km = obj(ld.mileageFromOdometer).value ?? ld.mileageFromOdometer;
  if (km != null && typeof km !== "object") out.push(`Kilométrage : ${km} km`);
  const desc = pick(ad, ["body", "description"]) ?? ld.description ?? o.ogDesc;
  if (desc) out.push("", "Description du vendeur :", String(desc).slice(0, 6000));
  if (!o.ad || !desc) out.push("", "Texte de la page :", String(o.text ?? "").slice(0, 7000));
  return out.join("\n");
}

/** Lien d'une annonce Leboncoin (seul, éventuellement entouré d'espaces), sinon null. */
export function lienLeboncoin(s: string): string | null {
  const t = s.trim();
  if (!/^https?:\/\/(www\.)?leboncoin\.fr\/\S+\d{6,}/i.test(t) || /\s/.test(t)) return null;
  return t;
}

/** Annonce lue par la fonction `annonce` (Apify) : même texte que la copie de l'extension. */
export function texteDepuisImport(d: { url: string; ad: unknown; brut?: string }): string {
  return texteDepuisExtension(PREFIXE_EXTENSION + JSON.stringify({ src: "leboncoin", url: d.url, ad: d.ad, text: d.brut ?? "" })) ?? "";
}

/** Photos jointes par l'extension (balises <img src="data:…"> dans le presse-papiers HTML). */
export function photosDepuisHtml(html: string): string[] {
  return Array.from(html.matchAll(/<img[^>]+src="(data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+)"/g)).map((m) => m[1]);
}

/** Ce qui accompagne l'annonce importée : photos d'origine, lien, vendeur (gardés avec le rapport). */
export type Origine = { liens: string[]; lien: string | null; vendeur: { nom?: string | null; type?: string | null; aTel?: boolean; telephone?: string | null } | null };

/** Copie de l'extension : liens des photos, lien de l'annonce, prénom du vendeur et numéro s'il a été affiché sur la page. */
export function origineDepuisExtension(brut: string): Origine | null {
  if (!brut.startsWith(PREFIXE_EXTENSION)) return null;
  try {
    const o = obj(JSON.parse(brut.slice(PREFIXE_EXTENSION.length)));
    const ad = obj(o.ad);
    const owner = obj(ad.owner);
    const liens = (Array.isArray(o.photoUrls) ? o.photoUrls : []).filter((u): u is string => typeof u === "string" && /^https:\/\//.test(u)).slice(0, 12);
    const typeV = owner.type === "pro" ? "pro" : owner.type === "private" ? "particulier" : null;
    return {
      liens,
      lien: typeof o.url === "string" && /^https?:\/\//.test(o.url) ? o.url : null,
      vendeur: { nom: typeof owner.name === "string" ? owner.name : null, type: typeV, aTel: Boolean(ad.has_phone ?? o.telephone), telephone: typeof o.telephone === "string" ? o.telephone : null },
    };
  } catch {
    return null;
  }
}
