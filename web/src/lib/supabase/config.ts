/** Variables publiques Supabase. Sans elles, le site s'affiche mais les comptes sont désactivés. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_CLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const comptesActifs = () => Boolean(SUPABASE_URL && SUPABASE_CLE);
