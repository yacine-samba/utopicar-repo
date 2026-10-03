/** Chemin de retour sûr après connexion : interne au site uniquement. */
export const suiteSure = (v: string | null | undefined, defaut = "/app") => (v && /^\/(?![/\\])/.test(v) ? v : defaut);
