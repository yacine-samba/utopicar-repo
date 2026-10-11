/* Remplace next/navigation hors de Next : des crochets sans effet (aucune navigation pendant la capture). */
const rien = () => {};
const routeur = { push: rien, replace: rien, refresh: rien, back: rien, forward: rien, prefetch: rien };
export const useRouter = () => routeur;
export const usePathname = () => (globalThis as { __CHEMIN__?: string }).__CHEMIN__ ?? "/app";
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];
export const redirect = rien;
export const permanentRedirect = rien;
export const notFound = rien;
