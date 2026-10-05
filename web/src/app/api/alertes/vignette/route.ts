import { supabaseServeur } from "@/lib/supabase/serveur";

/* Vignette d'une annonce suivie par une alerte : servie à part pour que la liste des alertes reste légère.
   La base vérifie que l'annonce appartient à une alerte de la personne connectée (vignette_annonce). */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-zA-Z_-]{3,40}$/.test(id)) return new Response(null, { status: 400 });
  const { data } = await (await supabaseServeur()).rpc("vignette_annonce", { p_id: id });
  const m = typeof data === "string" ? data.match(/^data:(image\/(?:jpeg|png|webp|gif|avif));base64,([A-Za-z0-9+/=]+)$/) : null;
  if (!m) return new Response(null, { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=604800, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
