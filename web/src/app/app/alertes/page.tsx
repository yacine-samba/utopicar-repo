import { redirect } from "next/navigation";

/* Retiré de l'espace : les alertes e-mail sont un interrupteur sur chaque recherche. */
export default function Page() {
  redirect("/app/recherche?vue=historique");
}
