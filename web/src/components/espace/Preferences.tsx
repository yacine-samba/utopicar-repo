"use client";
import { createContext, useContext, type ReactNode } from "react";

/* Préférences d'affichage de l'espace (Compte › Accessibilité), lues par les composants clients. */
type Prefs = { favoris: boolean };
const Contexte = createContext<Prefs>({ favoris: false });
export const usePreferences = () => useContext(Contexte);

export function PreferencesEspace({ favoris, children }: { favoris: boolean; children: ReactNode }) {
  return <Contexte.Provider value={{ favoris }}>{children}</Contexte.Provider>;
}
