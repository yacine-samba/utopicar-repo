"use client";
import { useEffect } from "react";
import { CLE_PROFIL, lireProfil } from "@/lib/orientation";

/** Pastille choisie sur le site avant une inscription Google ou Apple : envoyée au profil une fois dans l'espace, puis oubliée. */
export function ProfilDepuisNavigateur() {
  useEffect(() => {
    const p = lireProfil();
    if (!Object.keys(p).length) return;
    fetch("/api/profil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboarding: p }) })
      .then((r) => {
        if (r.ok || r.status === 400) localStorage.removeItem(CLE_PROFIL);
      })
      .catch(() => undefined);
  }, []);
  return null;
}
