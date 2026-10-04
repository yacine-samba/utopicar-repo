"use client";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";

/** Réduit une photo (1600 px au plus, JPEG) avant l'envoi : plus rapide, et sous la limite de 2 Mo. */
async function reduire(f: File, max = 1600): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((ok) => c.toBlob((b) => ok(b), "image/jpeg", 0.82));
  } catch {
    return null;
  }
}

/** Envoie des photos dans le dossier de la personne (stockage « photos ») et renvoie leurs liens publics. */
export async function envoyerPhotos(fichiers: File[], sousDossier: string): Promise<{ urls: string[]; refusees: number }> {
  const sb = supabaseNavigateur();
  const { data } = await sb.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return { urls: [], refusees: fichiers.length };
  const urls: string[] = [];
  let refusees = 0;
  for (const f of fichiers) {
    const b = await reduire(f);
    if (!b) {
      refusees++;
      continue;
    }
    const chemin = `${uid}/${sousDossier}/${crypto.randomUUID()}.jpg`;
    const { error } = await sb.storage.from("photos").upload(chemin, b, { contentType: "image/jpeg" });
    if (error) refusees++;
    else urls.push(sb.storage.from("photos").getPublicUrl(chemin).data.publicUrl);
  }
  return { urls, refusees };
}
