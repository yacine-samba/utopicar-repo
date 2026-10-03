import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://utopicar.fr"),
  title: { default: "Utopicar", template: "%s · Utopicar" },
  description: "Collez une annonce de voiture d'occasion : Utopicar vous dit si c'est une bonne affaire et ce qu'elle va vraiment vous coûter.",
};

export const viewport: Viewport = { themeColor: "#0f0d0b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
