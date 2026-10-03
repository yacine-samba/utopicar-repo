/** Variables publiques Supabase. Sans elles, le site s'affiche mais les comptes sont désactivés. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_CLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
/** Comptes ouverts seulement si le serveur a aussi sa clé secrète (quotas, rapports, paiements).
    À n'appeler que côté serveur : la clé secrète n'existe jamais dans le navigateur. */
export const comptesActifs = () => Boolean(SUPABASE_URL && SUPABASE_CLE && process.env.SUPABASE_SERVICE_ROLE_KEY);
