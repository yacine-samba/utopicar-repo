import { readFile } from "node:fs/promises";
import path from "node:path";
import { compteCourant } from "@/lib/compte";

/* Téléchargement de l'extension Leboncoin : réservé au compte illimité (le fichier n'est pas dans public/). */
export async function GET() {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  if (!c.illimite) return Response.json({ erreur: "Non disponible." }, { status: 404 });
  const zip = await readFile(path.join(process.cwd(), "prive", "utopicar-extension.zip"));
  return new Response(new Uint8Array(zip), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="utopicar-extension.zip"', "Cache-Control": "private, no-store" },
  });
}
