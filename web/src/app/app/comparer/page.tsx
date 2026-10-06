import { redirect } from "next/navigation";

/* Retiré de l'espace : le comparateur est désactivé pour l'instant (code gardé dans ListeRapports et l'historique Git). */
export default function Page() {
  redirect("/app/rapports");
}
