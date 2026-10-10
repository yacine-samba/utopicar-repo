/* Remplace @/lib/supabase/navigateur : aucun compte ni base pendant la capture. Toute requête renvoie « rien »,
   sans erreur, comme une session déconnectée. */
type Reponse = { data: null; error: null };
const vide: Reponse = { data: null, error: null };

function requete(): unknown {
  const p: Promise<Reponse> = Promise.resolve(vide);
  return new Proxy(p, {
    get(cible, cle) {
      if (cle === "then" || cle === "catch" || cle === "finally") return (cible as unknown as Record<string, (...a: unknown[]) => unknown>)[cle as string].bind(cible);
      return () => requete();
    },
  });
}

const client = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: null }),
  },
  from: () => requete(),
  rpc: () => requete(),
  channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
  removeChannel: () => {},
};

export const supabaseNavigateur = () => client;
