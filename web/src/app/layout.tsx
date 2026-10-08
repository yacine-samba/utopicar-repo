import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Apparitions } from "@/components/site/Apparitions";
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

export const viewport: Viewport = { themeColor: "#0f0d0b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={serif.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap" />
      </head>
      <body>
        <a href="#contenu" className="sr-only-focusable fixed left-3 top-3 z-50 rounded-full bg-o px-4 py-2 font-semibold text-[#160904]">
          Aller au contenu
        </a>
        {children}
        <Apparitions />
        <Typographie />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
