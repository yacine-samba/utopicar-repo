import { OFFRES, PARTICULIERS, BENEF } from "@/lib/offres";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.utopicar.fr";

/** Données structurées (schema.org) : qui édite le site, ce que fait l'application et ses formules. Une fois par page du site public. */
export function JsonLdSite() {
  const offres = [...PARTICULIERS, ...BENEF].map((id) => OFFRES[id]).filter((o) => !o.cachee);
  const data = [
    { "@context": "https://schema.org", "@type": "Organization", name: "Utopicar", url: SITE, logo: `${SITE}/icons/icon-512.png`, sameAs: [] },
    { "@context": "https://schema.org", "@type": "WebSite", name: "Utopicar", url: SITE, inLanguage: "fr-FR" },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Utopicar",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE,
      description: "Collez une annonce de voiture d'occasion : cote du marché, défauts qui coûtent cher, coût réel d'achat et prix à proposer.",
      offers: offres.map((o) => ({ "@type": "Offer", name: o.nom, price: o.prix.toFixed(2), priceCurrency: "EUR", category: o.famille === "benef" ? "Benef (achat-revente)" : "Particulier", ...(o.prix ? { billingIncrement: "P1M" } : {}) })),
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Fil d'Ariane d'une page (chemins relatifs au site). */
export function JsonLdFil({ etapes }: { etapes: { nom: string; chemin: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: etapes.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.nom, item: `${SITE}${e.chemin}` })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** FAQ d'une page, au format que Google affiche sous le résultat. */
export function JsonLdFaq({ questions }: { questions: { q: string; r: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.r } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
