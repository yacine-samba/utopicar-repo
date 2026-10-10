import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { donneesAdmin } from "@/lib/admin";
import { OFFRES } from "@/lib/offres";
import { GUIDES } from "@/lib/guides";
import { Administration } from "@/components/admin/Administration";

export const metadata: Metadata = { title: "Administration" };

function Kpi({ l, v, s }: { l: string; v: string | number; s?: string }) {
  return (
    <div className="carte p-4">
      <p className="text-xs text-ink-3">{l}</p>
      <p className="num mt-1 font-display text-2xl font-semibold">{v}</p>
      {s && <p className="mt-0.5 text-xs text-ink-3">{s}</p>}
    </div>
  );
}

/** Nombre d'inscriptions des `jours` derniers jours. */
function recents(l: { inscritLe: string }[], jours: number) {
  const depuis = new Date(Date.now() - jours * 86400_000).toISOString();
  return l.filter((x) => x.inscritLe >= depuis).length;
}

/** Administration : nouveaux comptes, inscrits au guide, cadeaux (formule, crédits, guides, option Messages). Comptes profils.admin seulement. */
export default async function Page() {
  const c = await compteCourant();
  if (!c) redirect("/connexion?next=/app/admin");
  if (!c.admin) redirect("/app");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return <p className="carte p-6 text-warn">Ajoutez SUPABASE_SERVICE_ROLE_KEY dans Vercel pour ouvrir l&apos;administration.</p>;

  const { comptes, inscrits, journal, analyses } = await donneesAdmin();
  const actifs = comptes.filter((x) => x.analysesMois > 0).length;
  const payants = comptes.filter((x) => !x.illimite && !x.offerte && OFFRES[x.formule].prix > 0).length;
  const offerts = comptes.filter((x) => x.offerte && x.offerte.id !== "gratuit").length;
  const ouverts = inscrits.filter((x) => x.ouvert).length;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Administration</h1>
        <p className="mt-1 text-ink-3">Nouveaux comptes, inscrits au guide, et ce que vous leur offrez.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi l="Comptes" v={comptes.length} s={`${recents(comptes, 1)} aujourd'hui · ${recents(comptes, 7)} en 7 jours`} />
        <Kpi l="Formules payantes" v={payants} s={`${offerts} formule${offerts > 1 ? "s" : ""} offerte${offerts > 1 ? "s" : ""}`} />
        <Kpi l="Inscrits au guide" v={inscrits.length} s={`${recents(inscrits, 1)} aujourd'hui · ${recents(inscrits, 7)} en 7 jours`} />
        <Kpi l="Analyses faites" v={analyses.total} s={`${analyses.jour} aujourd'hui · ${analyses.sept} en 7 jours`} />
        <Kpi l="Analyses ce mois" v={analyses.mois} s={`par ${actifs} compte${actifs > 1 ? "s" : ""}${actifs ? ` · ${(analyses.mois / actifs).toFixed(1).replace(".", ",")} par compte` : ""}`} />
        <Kpi l="Guides ouverts" v={inscrits.length ? `${Math.round((ouverts / inscrits.length) * 100)} %` : "—"} s={`${ouverts} sur ${inscrits.length}`} />
      </div>
      <Administration comptes={comptes} inscrits={inscrits} journal={journal} moi={c.id} guides={GUIDES.map(({ id, titre, pour }) => ({ id, titre, pour }))} />
    </div>
  );
}
