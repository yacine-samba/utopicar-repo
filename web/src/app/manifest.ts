import type { MetadataRoute } from "next";

/** Application installable (écran d'accueil du téléphone) : s'ouvre directement sur l'espace, sans la barre du navigateur. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Utopicar",
    short_name: "Utopicar",
    description: "Analyse d'annonces auto, cote du marché, recherche et alertes Leboncoin.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#0f0d0b",
    theme_color: "#0f0d0b",
    lang: "fr",
    // Partager une annonce depuis l'appli Leboncoin (Android, application installée) : l'analyse démarre sur le lien.
    share_target: { action: "/app/analyser", method: "GET", params: { title: "titre", text: "texte", url: "url" } },
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
