"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Typographie française : l'espace avant « : ; ? ! » et à l'intérieur des guillemets devient insécable,
   pour qu'un signe ne parte jamais seul en début de ligne (sur téléphone surtout). Appliqué au texte affiché,
   jamais aux champs de saisie ni au code. */
const IGNORER = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "KBD", "SVG", "NOSCRIPT"]);
const AVANT = / (?=[:;?!»])/g;
const APRES = /« /g;

function corriger(racine: Node) {
  const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      for (let p = n.parentElement; p; p = p.parentElement) if (IGNORER.has(p.tagName) || p.isContentEditable) return NodeFilter.FILTER_REJECT;
      return / [:;?!»]|« /.test(n.nodeValue ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  const noeuds: Text[] = [];
  while (w.nextNode()) noeuds.push(w.currentNode as Text);
  for (const n of noeuds) n.nodeValue = (n.nodeValue ?? "").replace(AVANT, " ").replace(APRES, "« ");
}

export function Typographie() {
  const chemin = usePathname();
  useEffect(() => {
    corriger(document.body);
    const mo = new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === "characterData") corriger(m.target);
        else m.addedNodes.forEach((n) => corriger(n));
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => mo.disconnect();
  }, [chemin]);
  return null;
}
