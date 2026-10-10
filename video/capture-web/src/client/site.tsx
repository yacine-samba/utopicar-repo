/* Script commun des pages rendues côté serveur : la typographie française du site (espaces insécables avant « : ; ? ! »),
   par le vrai composant Typographie du layout racine. */
import { createRoot } from "react-dom/client";
import { Typographie } from "@/components/site/Typographie";

const hote = document.createElement("div");
hote.hidden = true;
document.body.append(hote);
createRoot(hote).render(<Typographie />);
