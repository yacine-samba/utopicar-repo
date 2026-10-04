import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/* Jeton signé pour confirmer une nouvelle adresse e-mail : identifiant, adresse, expiration (1 heure).
   Signé avec la clé de service, connue du seul serveur. */
const secret = () => {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return createHmac("sha256", "utopicar-email").update(k).digest();
};
const signer = (s: string) => createHmac("sha256", secret()).update(s).digest("base64url");

export function jetonEmail(uid: string, email: string) {
  const corps = Buffer.from(JSON.stringify({ u: uid, e: email, x: Date.now() + 3600_000 })).toString("base64url");
  return `${corps}.${signer(corps)}`;
}

export function lireJetonEmail(j: string): { uid: string; email: string } | null {
  const [corps, sig] = j.split(".");
  if (!corps || !sig) return null;
  const attendu = Buffer.from(signer(corps));
  const recu = Buffer.from(sig);
  if (attendu.length !== recu.length || !timingSafeEqual(attendu, recu)) return null;
  try {
    const o = JSON.parse(Buffer.from(corps, "base64url").toString());
    if (typeof o.u !== "string" || typeof o.e !== "string" || typeof o.x !== "number" || o.x < Date.now()) return null;
    return { uid: o.u, email: o.e };
  } catch {
    return null;
  }
}
