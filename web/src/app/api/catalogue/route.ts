import { catalogue } from "@/lib/vehicules/catalogue";

/* Catalogue marque → modèle → génération → versions, phases : construit au déploiement, mis en cache par le navigateur.
   Le tableau de bord le charge une fois au lieu de le recevoir en double dans chaque page. Rien de personnel. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(catalogue(), { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
