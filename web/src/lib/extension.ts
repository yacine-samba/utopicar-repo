"use client";
import { useEffect, useRef } from "react";

/* Pont avec l'extension Utopicar : l'extension garde l'annonce (ou le relevé) puis ouvre la page ;
   la page annonce qu'elle est prête, l'extension lui transmet les données. Rien ne transite par un serveur tiers. */
export type EnvoiExtension = { type: "annonce"; brut: string; images: string[] } | { type: "releve" | "lot"; brut: string };

export function useExtension(type: EnvoiExtension["type"], recevoir: (e: EnvoiExtension) => void) {
  const cb = useRef(recevoir);
  useEffect(() => {
    cb.current = recevoir;
  });
  useEffect(() => {
    const f = (e: MessageEvent) => {
      const d = e.data as { source?: string; type?: string; brut?: unknown; images?: unknown } | null;
      if (e.source !== window || e.origin !== location.origin || d?.source !== "utopicar-extension" || d.type !== type || typeof d.brut !== "string") return;
      cb.current(type === "annonce" ? { type, brut: d.brut, images: Array.isArray(d.images) ? d.images.filter((x): x is string => typeof x === "string" && x.startsWith("data:image/")).slice(0, 20) : [] } : { type, brut: d.brut });
    };
    addEventListener("message", f);
    postMessage({ source: "utopicar-page", type: "pret", attend: type }, location.origin);
    return () => removeEventListener("message", f);
  }, [type]);
}
