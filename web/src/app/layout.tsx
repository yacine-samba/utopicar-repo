import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Apparitions } from "@/components/site/Apparitions";
import { BoutonAnimations } from "@/components/site/BoutonAnimations";
import { Typographie } from "@/components/site/Typographie";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.utopicar.fr"),
  title: { default: "Utopicar : cote et analyse d'une annonce de voiture d'occasion", template: "%s · Utopicar" },
  // adresse canonique de chaque page (sans ?reprise, ?paiement…)
  alternates: { canonical: "./" },
  description: "Collez une annonce de voiture d'occasion : Utopicar estime sa cote, repère les défauts qui coûtent cher et vous dit quoi faire. Première analyse offerte.",
  openGraph: { siteName: "Utopicar", locale: "fr_FR", type: "website" },
};

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });
// Clash Display et Satoshi (Fontshare, licence ITF Free Font) servies par le site : plus de feuille de style tierce
// dans le chemin d'affichage (et Satoshi, que l'ancienne adresse Fontshare ne renvoyait pas, s'affiche enfin).
const clash = localFont({
  src: [
    { path: "./polices/clash-display-500.woff2", weight: "500" },
    { path: "./polices/clash-display-600.woff2", weight: "600" },
  ],
  variable: "--font-clash",
  display: "swap",
});
const satoshi = localFont({
  src: [
    { path: "./polices/satoshi-400.woff2", weight: "400" },
    { path: "./polices/satoshi-500.woff2", weight: "500" },
    { path: "./polices/satoshi-700.woff2", weight: "700" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#0f0d0b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${clash.variable} ${satoshi.variable}`}>
      <body>
        {/* bloc d'évitement : les deux premiers arrêts du clavier, invisibles jusqu'au focus */}
        <div className="evitement">
          <a href="#contenu" className="inline-flex min-h-11 items-center rounded-full bg-o px-4 py-2 font-semibold text-[#160904]">
            Aller au contenu
          </a>
          <BoutonAnimations className="inline-flex min-h-11 items-center rounded-full border border-line-2 bg-bg0 px-4 py-2 font-semibold text-ink" />
        </div>
        {children}
        <Apparitions />
        <Typographie />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
