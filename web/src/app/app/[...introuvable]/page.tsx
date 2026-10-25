import { notFound } from "next/navigation";

/* Adresse inconnue sous /app : la page introuvable de l'espace (avec son menu) plutôt que celle du site. */
export default function Page() {
  notFound();
}
