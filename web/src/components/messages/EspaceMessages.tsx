"use client";
/* Messages Leboncoin (option de Benef Pro) : compte Leboncoin, campagnes (une par recherche), mini tableau de bord,
   boîte de réception et suivi des envois. L'envoi lui-même est fait par la fonction Supabase « messages ». */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx, inputCls } from "@/lib/cx";

export type CompteLbc = { email: string; nom_affiche: string | null; statut: "nouveau" | "ok" | "erreur"; erreur: string | null; updated_at: string };
export type Campagne = { id: string; recherche_id: string; nom: string; message: string; actif: boolean; ignorer_refus: boolean; updated_at: string };
export type EnvoiLbc = { id: number; campagne_id: string | null; annonce_id: string; url: string; titre: string | null; prix: number | null; statut: "en_attente" | "en_cours" | "envoye" | "erreur" | "ignoree" | "annule"; raison: string | null; created_at: string; traite_le: string | null };
export type Conversation = { id: string; nom: string; annonce: string; annonce_id: string; dernier: string; le: string | null; non_lus: number };
export type Boite = { conversations: Conversation[]; non_lus: number; total: number; maj: string | null; demande: string | null; run_id: string | null; erreur: string | null };

const MESSAGE_DEFAUT = "Bonjour, votre {titre} est-elle toujours disponible ? Je suis professionnel de l'automobile, je peux me déplacer rapidement. Bonne journée.";
const STATUTS: Record<EnvoiLbc["statut"], [string, string]> = {
  en_attente: ["En attente", "border-line-2 text-ink-3"],
  en_cours: ["Envoi en cours", "border-o/40 text-o2"],
  envoye: ["Envoyé", "border-ok/40 text-ok"],
  erreur: ["Erreur", "border-bad/40 text-bad"],
  ignoree: ["Ignorée", "border-line-2 text-ink-3"],
  annule: ["Annulé", "border-line-2 text-ink-3"],
};
const quand = (d: string | null) => (d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");

function Interrupteur({ on, onClick, label, disabled }: { on: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onClick} className={cx("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-o" : "bg-line-2", disabled && "opacity-50")}>
      <span className={cx("absolute top-0.5 size-5 rounded-full bg-ink transition", on ? "left-[22px]" : "left-0.5")} aria-hidden="true" />
    </button>
  );
}

export function EspaceMessages({ compte, campagnes: c0, recherches, envois, boite, etat }: { compte: CompteLbc | null; campagnes: Campagne[]; recherches: { id: string; nom: string; trouvees: number | null }[]; envois: EnvoiLbc[]; boite: Boite | null; etat: { actif: boolean; jusquAu: string | null; passe: boolean } }) {
  const router = useRouter();
  const [campagnes, setCampagnes] = useState(c0);
  const [liste, setListe] = useState(envois);
  const [msg, setMsg] = useState("");
  const n = (s: EnvoiLbc["statut"]) => liste.filter((e) => e.statut === s).length;
  const fin = etat.jusquAu ? new Date(etat.jusquAu) : null;
  const arrete = !etat.actif || etat.passe;

  async function actualiserBoite() {
    const { error } = await supabaseNavigateur().rpc("lbc_actualiser_boite");
    setMsg(error ? error.message : "Demande enregistrée : la boîte de réception se met à jour dans 2 à 4 minutes (une requête Leboncoin toutes les 2 minutes au plus). Rechargez la page ensuite.");
  }

  async function annuler(e: EnvoiLbc) {
    const { error } = await supabaseNavigateur().from("lbc_envois").update({ statut: "annule" }).eq("id", e.id).eq("statut", "en_attente");
    if (!error) setListe((l) => l.map((x) => (x.id === e.id ? { ...x, statut: "annule" } : x)));
  }

  return (
    <div className="grid gap-6">
      {arrete && (
        <p role="status" className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
          Les envois automatiques sont à l&apos;arrêt{fin && etat.actif ? ` depuis le ${quand(etat.jusquAu)} (fin de la période d'essai)` : ""} : rien ne part, vos campagnes et votre file sont gardées.
        </p>
      )}
      {!arrete && fin && (
        <p role="status" className="rounded-2xl border border-o/40 bg-o/10 p-4 text-sm text-o2">
          Période d&apos;essai : les envois automatiques s&apos;arrêtent le {quand(etat.jusquAu)}.
        </p>
      )}

      <section aria-labelledby="m-tb" className="grid gap-3">
        <h2 id="m-tb" className="sr-only">Tableau de bord</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Messages envoyés", String(n("envoye")), "premier message uniquement"],
            ["En attente", String(n("en_attente") + n("en_cours")), "une annonce toutes les 1 à 2 min"],
            ["Réponses reçues", boite ? String(boite.total) : "—", boite?.maj ? `boîte lue le ${quand(boite.maj)}` : "boîte jamais lue"],
            ["Non lus", boite ? String(boite.non_lus) : "—", "sur Leboncoin"],
          ].map(([l, v, s]) => (
            <div key={l} className="carte p-4">
              <p className="text-xs text-ink-3">{l}</p>
              <p className="num mt-1 font-display text-2xl font-semibold">{v}</p>
              <p className="mt-0.5 text-xs text-ink-3">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <CompteLeboncoin compte={compte} onFait={() => router.refresh()} />

      <section aria-labelledby="m-camp" className="carte grid gap-4 p-5 sm:p-6">
        <div>
          <h2 id="m-camp" className="font-display text-xl font-semibold">Campagnes</h2>
          <p className="text-sm text-ink-3">
            Une campagne par recherche : les annonces Leboncoin de sa dernière actualisation (ouvrez la recherche et cliquez sur « Actualiser » pour en ajouter) reçoivent votre premier message, une seule fois chacune (une annonce déjà contactée, ici ou sur Leboncoin, ne l&apos;est jamais deux fois). Écrivez <code className="rounded bg-glass px-1">{"{titre}"}</code> ou <code className="rounded bg-glass px-1">{"{prix}"}</code> pour reprendre ceux de l&apos;annonce.
          </p>
        </div>
        {campagnes.map((c) => (
          <FormCampagne key={c.id} c={c} recherches={recherches} compteOk={!!compte && compte.statut !== "erreur"} onMaj={(x) => setCampagnes((l) => (x ? l.map((y) => (y.id === x.id ? x : y)) : l.filter((y) => y.id !== c.id)))} />
        ))}
        <FormCampagne key={`nouvelle-${campagnes.length}`} recherches={recherches.filter((r) => !campagnes.some((c) => c.recherche_id === r.id))} compteOk={!!compte && compte.statut !== "erreur"} onMaj={(x) => x && setCampagnes((l) => [...l, x])} />
      </section>

      <section aria-labelledby="m-boite" className="carte grid gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="m-boite" className="font-display text-xl font-semibold">Boîte de réception</h2>
          <button type="button" onClick={actualiserBoite} disabled={!compte || !!boite?.demande || !!boite?.run_id} className="btn btn-sm">
            {boite?.demande || boite?.run_id ? "Lecture en cours…" : "Actualiser"}
          </button>
        </div>
        {msg && <p role="status" className="text-sm text-ink-2">{msg}</p>}
        {boite?.erreur && <p className="text-sm text-warn">Dernière lecture impossible : {boite.erreur}</p>}
        {boite?.conversations?.length ? (
          <ul className="grid gap-2">
            {boite.conversations.map((x) => (
              <li key={x.id} className={cx("grid gap-0.5 rounded-xl border p-3 text-sm", x.non_lus ? "border-o/40 bg-o/5" : "border-line")}>
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <b className="font-medium">{x.nom || "Vendeur"}{x.non_lus ? <span className="ml-2 rounded-full bg-o px-2 py-px text-[11px] font-semibold text-[#160904]">{x.non_lus} non lu{x.non_lus > 1 ? "s" : ""}</span> : null}</b>
                  <span className="text-xs text-ink-3">{quand(x.le)}</span>
                </span>
                {x.annonce && <span className="truncate text-ink-3">{x.annonce}</span>}
                {x.dernier && <span className="text-ink-2">« {x.dernier} »</span>}
                {x.annonce_id && <a href={`https://www.leboncoin.fr/ad/voitures/${x.annonce_id}`} target="_blank" rel="noopener noreferrer" className="w-fit text-xs text-o2 underline-offset-4 hover:underline">Annonce ↗</a>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-3">{boite?.maj ? "Aucune conversation." : "La boîte n'a pas encore été lue : cliquez sur « Actualiser »."} Répondez aux vendeurs directement sur Leboncoin.</p>
        )}
      </section>

      <section aria-labelledby="m-envois" className="grid gap-3">
        <h2 id="m-envois" className="font-display text-xl font-semibold">Suivi des envois</h2>
        {liste.length ? (
          <ul className="grid gap-2">
            {liste.slice(0, 150).map((e) => (
              <li key={e.id} className="carte flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0">
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="block truncate font-medium underline-offset-4 hover:underline">{e.titre || `Annonce ${e.annonce_id}`}</a>
                  <span className="text-xs text-ink-3">
                    {e.prix != null ? `${e.prix.toLocaleString("fr-FR")} € · ` : ""}{e.statut === "en_attente" ? `ajoutée le ${quand(e.created_at)}` : quand(e.traite_le)}{e.raison ? ` · ${e.raison}` : ""}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={cx("rounded-full border px-2 py-0.5 text-xs", STATUTS[e.statut][1])}>{STATUTS[e.statut][0]}</span>
                  {e.statut === "en_attente" && <button type="button" onClick={() => annuler(e)} className="btn btn-sm min-h-8 px-3 text-ink-3">Ne pas envoyer</button>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="carte p-5 text-sm text-ink-3">Aucun envoi pour l&apos;instant : activez une campagne.</p>
        )}
      </section>
    </div>
  );
}

/** Compte Leboncoin : la double authentification doit être désactivée avant tout. Mot de passe chiffré dès l'enregistrement. */
function CompteLeboncoin({ compte, onFait }: { compte: CompteLbc | null; onFait: () => void }) {
  const [edition, setEdition] = useState(!compte);
  const [sans2fa, setSans2fa] = useState(!!compte);
  const [email, setEmail] = useState(compte?.email ?? "");
  const [mdp, setMdp] = useState("");
  const [nom, setNom] = useState(compte?.nom_affiche ?? "");
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!sans2fa) return setEtat("Désactivez d'abord la double authentification sur votre compte Leboncoin, puis cochez la case.");
    if (!compte && !mdp) return setEtat("Indiquez le mot de passe de votre compte Leboncoin.");
    setCharge(true);
    const { error } = await supabaseNavigateur().rpc("lbc_enregistrer", { p_email: email.trim(), p_mdp: mdp, p_nom: nom.trim() });
    setCharge(false);
    setMdp("");
    if (error) return setEtat(error.message);
    setEtat("Compte enregistré. Le mot de passe est chiffré : personne ne peut le relire, pas même nous.");
    setEdition(false);
    onFait();
  }

  async function oublier() {
    if (!confirm("Effacer votre compte Leboncoin d'Utopicar ? Les campagnes s'arrêtent et les messages en attente sont annulés.")) return;
    const { error } = await supabaseNavigateur().rpc("lbc_oublier");
    setEtat(error ? error.message : "Compte effacé.");
    if (!error) onFait();
  }

  return (
    <section aria-labelledby="m-compte" className="carte grid gap-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="m-compte" className="font-display text-xl font-semibold">Compte Leboncoin</h2>
        {compte && (
          <span className={cx("rounded-full border px-2.5 py-0.5 text-xs", compte.statut === "ok" ? "border-ok/40 text-ok" : compte.statut === "erreur" ? "border-bad/40 text-bad" : "border-line-2 text-ink-3")}>
            {compte.statut === "ok" ? "Connexion vérifiée" : compte.statut === "erreur" ? "Connexion refusée" : "Pas encore utilisé"}
          </span>
        )}
      </div>
      {compte?.statut === "erreur" && (
        <p className="rounded-xl border border-bad/40 bg-bad/10 p-3 text-sm text-bad">
          Leboncoin a refusé la connexion : {compte.erreur}. Vos campagnes sont arrêtées. Vérifiez que la double authentification est désactivée et que le mot de passe est le bon, puis enregistrez-le de nouveau.
        </p>
      )}
      {compte && !edition ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            <b>{compte.email}</b>
            {compte.nom_affiche ? <span className="text-ink-3"> · affiché « {compte.nom_affiche} »</span> : null}
            <span className="block text-xs text-ink-3">Mot de passe chiffré, enregistré le {quand(compte.updated_at)}</span>
          </span>
          <span className="flex gap-2">
            <button type="button" onClick={() => setEdition(true)} className="btn btn-sm">Modifier</button>
            <button type="button" onClick={oublier} className="btn btn-sm text-ink-3">Effacer</button>
          </span>
        </div>
      ) : (
        <form onSubmit={enregistrer} className="grid gap-4">
          <div className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
            <p className="font-semibold text-warn">Avant tout : désactivez la double authentification</p>
            <p className="mt-1 text-ink-2">Sur Leboncoin : Mon compte › Connexion et sécurité › Validation en deux étapes, désactivez-la. Sinon Leboncoin demande un code à chaque envoi et rien ne part. Déconnectez aussi l&apos;application Leboncoin de votre téléphone si elle valide les connexions.</p>
            <label className="mt-2 flex items-center gap-2 text-ink">
              <input type="checkbox" checked={sans2fa} onChange={(e) => setSans2fa(e.target.checked)} className="size-4 accent-[#ff5a1f]" />
              J&apos;ai désactivé la double authentification
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">E-mail du compte Leboncoin</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!sans2fa} autoComplete="off" className={inputCls} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">Mot de passe Leboncoin{compte ? " (vide : inchangé)" : ""}</span>
              <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} disabled={!sans2fa} autoComplete="new-password" className={inputCls} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-2">Nom affiché au vendeur</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} disabled={!sans2fa} maxLength={60} placeholder="ex. Malek" className={inputCls} />
            </label>
          </div>
          <p className="text-xs text-ink-3">Le mot de passe est chiffré dès l&apos;enregistrement (AES-256, clé dans le coffre de la base). Il n&apos;est déchiffré qu&apos;au moment de l&apos;envoi, en mémoire, pour la connexion à Leboncoin, et n&apos;apparaît jamais dans le site ni dans les journaux.</p>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={charge || !sans2fa} className="btn btn-o btn-sm">{charge ? "Enregistrement…" : "Enregistrer"}</button>
            {compte && <button type="button" onClick={() => setEdition(false)} className="btn btn-sm">Annuler</button>}
          </div>
        </form>
      )}
      {etat && <p role="status" className="text-sm text-ink-2">{etat}</p>}
    </section>
  );
}

/** Une campagne : recherche ciblée, message, refus de démarchage respecté (par défaut), interrupteur. Sans `c` : nouvelle campagne. */
function FormCampagne({ c, recherches, compteOk, onMaj }: { c?: Campagne; recherches: { id: string; nom: string; trouvees: number | null }[]; compteOk: boolean; onMaj: (x: Campagne | null) => void }) {
  const [rid, setRid] = useState(c?.recherche_id ?? recherches[0]?.id ?? "");
  const [message, setMessage] = useState(c?.message ?? MESSAGE_DEFAUT);
  const [refus, setRefus] = useState(c?.ignorer_refus ?? true);
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);
  const nomRecherche = recherches.find((r) => r.id === rid)?.nom ?? c?.nom ?? "";

  async function enregistrer(actif = c?.actif ?? false) {
    if (!rid) return setEtat("Choisissez une recherche (lancez-en une dans Recherche).");
    if (message.trim().length < 10) return setEtat("Le message est trop court.");
    if (actif && !compteOk) return setEtat("Enregistrez d'abord votre compte Leboncoin (ci-dessus).");
    setCharge(true);
    const sb = supabaseNavigateur();
    const ligne = { recherche_id: rid, nom: nomRecherche.slice(0, 160) || "Recherche", message: message.trim().slice(0, 2500), ignorer_refus: refus, actif, updated_at: new Date().toISOString() };
    const { data, error } = c
      ? await sb.from("lbc_campagnes").update(ligne).eq("id", c.id).select("id, recherche_id, nom, message, actif, ignorer_refus, updated_at").single()
      : await sb.from("lbc_campagnes").insert(ligne).select("id, recherche_id, nom, message, actif, ignorer_refus, updated_at").single();
    setCharge(false);
    if (error || !data) return setEtat(error?.message ?? "Enregistrement impossible.");
    setEtat(actif ? "Campagne active : les annonces de la recherche entrent dans la file à la prochaine minute." : "Campagne enregistrée, en pause.");
    onMaj(data as Campagne);
  }

  async function supprimer() {
    if (!c || !confirm(`Supprimer la campagne « ${c.nom} » ? Les messages déjà envoyés restent dans le suivi.`)) return;
    const { error } = await supabaseNavigateur().from("lbc_campagnes").delete().eq("id", c.id);
    if (!error) onMaj(null);
  }

  if (!c && !recherches.length)
    return <p className="rounded-xl border border-dashed border-line-2 p-4 text-sm text-ink-3">Toutes vos recherches ont une campagne. Lancez une nouvelle recherche pour en créer une autre.</p>;

  return (
    <div className={cx("grid gap-3 rounded-2xl border p-4", c?.actif ? "border-o/50" : "border-line", !c && "border-dashed")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">{c ? c.nom : "Nouvelle campagne"}</p>
        {c && (
          <label className="flex items-center gap-2 text-sm">
            {c.actif ? "Active" : "En pause"}
            <Interrupteur on={c.actif} label={c.actif ? "Mettre en pause" : "Activer"} disabled={charge} onClick={() => enregistrer(!c.actif)} />
          </label>
        )}
      </div>
      {!c && (
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Recherche ciblée</span>
          <select value={rid} onChange={(e) => setRid(e.target.value)} className={inputCls}>
            {recherches.map((r) => (
              <option key={r.id} value={r.id}>{r.nom}{r.trouvees != null ? ` (${r.trouvees} annonces)` : ""}</option>
            ))}
          </select>
        </label>
      )}
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Premier message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={2500} className={cx(inputCls, "resize-y leading-relaxed")} />
      </label>
      <div className="flex items-start justify-between gap-4 rounded-xl border border-line p-3 text-sm">
        <span>
          <span className="block font-medium">Ignorer les annonces qui refusent le démarchage</span>
          <span className="block text-ink-3">« Pas de démarchage », « pros s&apos;abstenir », « particuliers uniquement »… Activé par défaut.</span>
          {!refus && <span className="mt-1 block text-warn">Désactivé : ces annonces seront aussi contactées, sous votre seule responsabilité (règles de Leboncoin, refus explicite du vendeur).</span>}
        </span>
        <Interrupteur on={refus} label="Ignorer les annonces qui refusent le démarchage" onClick={() => setRefus((v) => !v)} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {c ? (
          <>
            <button type="button" onClick={() => enregistrer()} disabled={charge} className="btn btn-sm">Enregistrer</button>
            <button type="button" onClick={supprimer} className="btn btn-sm text-ink-3">Supprimer</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => enregistrer(true)} disabled={charge || !rid} className="btn btn-o btn-sm">Créer et activer</button>
            <button type="button" onClick={() => enregistrer(false)} disabled={charge || !rid} className="btn btn-sm">Créer en pause</button>
          </>
        )}
        {etat && <p role="status" className="text-sm text-ink-2">{etat}</p>}
      </div>
    </div>
  );
}
