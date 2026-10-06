import { redirect } from "next/navigation";

/* Retiré de l'espace : la calculette de rentabilité est sur le site public (Benef). */
export default function Page() {
  redirect("/benef#calculateur");
}
