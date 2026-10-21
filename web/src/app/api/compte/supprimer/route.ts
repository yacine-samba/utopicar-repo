import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { supabaseService } from "@/lib/supabase/service";
import { paiementsActifs, stripe } from "@/lib/stripe";

/** Droit à l'effacement : résilie l'abonnement Stripe puis supprime le compte et ses données (cascade). */
export async function POST() {
  const compte = await compteCourant();
  if (!compte) return Response.json({ erreur: "Non connecté." }, { status: 401 });
  const svc = supabaseService();
  const { data: profil } = await svc.from("profils").select("stripe_customer_id").eq("id", compte.id).maybeSingle();
  if (profil?.stripe_customer_id && paiementsActifs()) {
    // le compte n'est supprimé qu'une fois les abonnements résiliés : sinon un prélèvement continuerait sans compte
    try {
      const subs = await stripe().subscriptions.list({ customer: profil.stripe_customer_id, status: "all", limit: 20 });
      await Promise.all(subs.data.filter((s) => !["canceled", "incomplete_expired"].includes(s.status)).map((s) => stripe().subscriptions.cancel(s.id)));
    } catch (e) {
      console.error("suppression : résiliation stripe", e);
      return Response.json({ erreur: "L'abonnement n'a pas pu être résilié, le compte n'est pas supprimé. Réessayez dans un instant." }, { status: 502 });
    }
  }
  const { error } = await svc.auth.admin.deleteUser(compte.id);
  if (error) return Response.json({ erreur: "Suppression impossible." }, { status: 500 });
  await (await supabaseServeur()).auth.signOut();
  return Response.json({ ok: true });
}
