"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import { lienImportable, texteDepuisImport } from "@/lib/analyse/import";
import type { Analyse } from "@/lib/analyse/couts";
import { ecrireProfil, lireProfil } from "@/lib/orientation";
import { CLES_EXEMPLES, EXEMPLES, euros } from "@/lib/demo";
import { cx, inputCls } from "../ui";
import type { Apercu } from "../analyse/Patience";
import { Patience } from "../analyse/Patience";
import { InscriptionInline } from "../compte/InscriptionInline";
import type { Fournisseur } from "../compte/ConnexionSociale";
import { CarteApercu, type Contenu } from "./CarteApercu";

/* Le hero devient le produit : un champ, un vrai aperçu en 2 secondes sans compte, et l'inscription dans la même carte
   quand la personne veut le rapport complet. Trois exemples pour ceux qui n'ont pas d'annonce sous la main. */

type Etat = "vide" | "lecture" | "apercu" | "analyse";
type Origine = { lien: string | null; liens: string[]; vendeur: unknown };
type Famille = "particulier" | "benef";
const CLE_REPRISE = "utp-essai";
const ERREURS_IMPORT: Record<string, string> = {
  lien: "Ce lien n'est pas une annonce Leboncoin, La Centrale ou AutoScout24 : collez le texte de la page.",
  trop: "Beaucoup d'essais d'affilée : créez votre compte gratuit pour continuer, ou collez le texte de l'annonce.",
  quota: "Votre analyse offerte a déjà servi : collez le texte de l'annonce pour l'aperçu, ou choisissez une formule.",
  introuvable: "Annonce introuvable : elle a peut-être été retirée. Collez le texte de la page si elle est encore en ligne.",
  config: "La lecture par lien est indisponible pour le moment : collez le texte de l'annonce.",
  apify: "Lecture de l'annonce impossible pour le moment : collez le texte de la page.",
};

export function Essai({ fournisseurs, depuis, familleInitiale = null }: { fournisseurs: Fournisseur[]; depuis: "hero" | "benef"; familleInitiale?: Famille | null }) {
  const router = useRouter();
  const id = useId();
  const champ = useRef<HTMLTextAreaElement>(null);
  const titreCarte = useRef<HTMLParagraphElement>(null);
  const [valeur, setValeur] = useState("");
  const [etat, setEtat] = useState<Etat>("vide");
  const [contenu, setContenu] = useState<Contenu | null>(null);
  const [fini, setFini] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurAnalyse, setErreurAnalyse] = useState<string | null>(null);
  const [texte, setTexte] = useState("");
  const [origine, setOrigine] = useState<Origine | null>(null);
  const [connecte, setConnecte] = useState<boolean | null>(null);
  const [famille, setFamille] = useState<Famille | null>(familleInitiale);
  const [sec, setSec] = useState(0);
  const suite = `${depuis === "benef" ? "/benef" : "/"}?reprise=1`;

  useEffect(() => {
    let actif = true;
    supabaseNavigateur()
      .auth.getSession()
      .then(({ data }) => actif && setConnecte(!!data.session))
      .catch(() => actif && setConnecte(false));
    return () => {
      actif = false;
    };
  }, []);

  // Lien « #essai » (sections de la page, autres pages) : le champ prend le focus.
  useEffect(() => {
    if (location.hash === "#essai") champ.current?.focus();
    // Next fait défiler sans événement hashchange : on écoute aussi les clics sur les liens vers #essai
    const f = (e: Event) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href$="#essai"]');
      if (a || (e.type === "hashchange" && location.hash === "#essai")) setTimeout(() => champ.current?.focus({ preventScroll: true }), 450);
    };
    addEventListener("hashchange", f);
    document.addEventListener("click", f);
    return () => {
      removeEventListener("hashchange", f);
      document.removeEventListener("click", f);
    };
  }, []);

  useEffect(() => {
    if (etat !== "analyse") return;
    const t0 = Date.now();
    const i = setInterval(() => setSec(Math.round((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(i);
  }, [etat]);

  const choisirFamille = (f: Famille) => {
    setFamille(f);
    ecrireProfil({ ...lireProfil(), but: f === "benef" ? "pro" : "achat", famille: f });
    track("pastille_famille", { famille: f });
  };

  /** Analyse complète (compte ouvert) : le rapport s'ouvre dans l'espace. */
  const analyserComplet = useCallback(
    async (t: string, og: Origine | null) => {
      setEtat("analyse");
      setErreurAnalyse(null);
      setSec(0);
      try {
        const r = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "particulier", texte: t, ville: "", photos: [], ...(og ? { photosLiens: og.liens.filter((u) => /^https:\/\//.test(u)).slice(0, 30), lienAnnonce: og.lien || undefined, vendeur: og.vendeur ?? undefined } : {}) }),
        });
        const j = (await r.json().catch(() => null)) as (Analyse & { erreur?: string }) | null;
        if (!r.ok || !j?.rapportId) {
          setErreurAnalyse(j?.erreur ?? "L'analyse n'a pas abouti. Réessayez depuis votre espace.");
          setEtat("apercu");
          return;
        }
        track("rapport_ouvert", { depuis });
        router.push(`/app/rapports/${j.rapportId}`);
        router.refresh();
      } catch {
        setErreurAnalyse("Connexion impossible. Vérifiez votre réseau et réessayez depuis votre espace.");
        setEtat("apercu");
      }
    },
    [depuis, router],
  );

  // Retour d'une inscription Google/Apple : l'annonce collée avant est reprise, l'analyse complète part toute seule.
  useEffect(() => {
    if (connecte !== true) return;
    try {
      const b = JSON.parse(sessionStorage.getItem(CLE_REPRISE) || "null") as { texte?: string; origine?: Origine | null } | null;
      if (!b?.texte) return;
      sessionStorage.removeItem(CLE_REPRISE);
      history.replaceState(null, "", location.pathname);
      track("inscription_inline_ok", { fournisseur: "social" });
      // reprise différée : l'état est posé hors du corps de l'effet
      const t = setTimeout(() => {
        setTexte(b.texte!);
        setOrigine(b.origine ?? null);
        void analyserComplet(b.texte!, b.origine ?? null);
      }, 0);
      return () => clearTimeout(t);
    } catch {
      /* stockage indisponible */
    }
  }, [connecte, analyserComplet]);

  function ouvrirCarte(c: Contenu | null) {
    setContenu(c);
    setFini(false);
    setErreur(null);
    setErreurAnalyse(null);
    setEtat("apercu");
    requestAnimationFrame(() => titreCarte.current?.focus({ preventScroll: true }));
  }

  async function apercu(t: string, og: Origine | null, source: "texte" | "lien") {
    setTexte(t);
    setOrigine(og);
    ouvrirCarte(null);
    try {
      const r = await fetch("/api/analyse/apercu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texte: t }) });
      if (r.status === 429) {
        setEtat("vide");
        setErreur(ERREURS_IMPORT.trop);
        track("apercu_limite");
        return;
      }
      const a = r.ok ? ((await r.json()) as Apercu) : null;
      if (!a) {
        setEtat("vide");
        setErreur("L'aperçu n'a pas abouti. Vérifiez que le texte contient bien le titre, le prix et la description.");
        return;
      }
      setContenu({ type: "apercu", a });
      setFini(true);
      track("apercu_vu", { source, cote: !!a.cote });
    } catch {
      setEtat("vide");
      setErreur("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
  }

  /** Lien collé : la fonction `annonce` lit l'annonce (sans compte : 3 par jour), puis l'aperçu suit. */
  async function importer(url: string) {
    if (!SUPABASE_URL) return setErreur(ERREURS_IMPORT.config);
    setEtat("lecture");
    setErreur(null);
    try {
      const { data } = await supabaseNavigateur().auth.getSession();
      const jeton = data.session?.access_token;
      const r = await fetch(`${SUPABASE_URL}/functions/v1/annonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_CLE, ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}) },
        body: JSON.stringify({ url }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        setEtat("vide");
        setErreur(ERREURS_IMPORT[j?.erreur as string] ?? ERREURS_IMPORT.apify);
        if (j?.erreur === "trop") track("apercu_limite");
        return;
      }
      const t = texteDepuisImport(j);
      await apercu(t, { lien: j.url, liens: Array.isArray(j.liens) ? j.liens : [], vendeur: j.vendeur ?? null }, "lien");
    } catch {
      setEtat("vide");
      setErreur("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
  }

  function envoyer(e: React.FormEvent) {
    e.preventDefault();
    const v = valeur.trim();
    if (!v) {
      setErreur("Collez d'abord le lien ou le texte d'une annonce.");
      champ.current?.focus();
      return;
    }
    if (lienImportable(v)) return void importer(v);
    if (/^https?:\/\//i.test(v)) return setErreur(ERREURS_IMPORT.lien);
    if (v.length < 30) return setErreur("Collez le texte complet de l'annonce : titre, prix, kilométrage et description.");
    void apercu(v, null, "texte");
  }

  function exemple(cle: string) {
    setTexte("");
    setOrigine(null);
    ouvrirCarte({ type: "exemple", cle });
    setFini(true);
    track("apercu_vu", { source: "exemple", cote: true });
  }

  function nouvelle() {
    setEtat("vide");
    setContenu(null);
    setValeur("");
    setTexte("");
    setOrigine(null);
    setErreur(null);
    setErreurAnalyse(null);
    champ.current?.focus();
  }

  const reel = contenu?.type === "apercu" && fini && !!texte;
  const benef = famille === "benef";

  if (etat === "analyse")
    return (
      <div className="carte mx-auto max-w-2xl p-5 text-left sm:p-6">
        <Patience phase="analyse" sec={sec} apercu={contenu?.type === "apercu" ? contenu.a : null} nbPhotos={0} benef={false} />
      </div>
    );

  return (
    <div id="essai" className="mx-auto grid max-w-2xl scroll-mt-28 gap-5">
      {etat !== "apercu" && (
        <form method="get" action="/analyse" onSubmit={envoyer} className="grid gap-3">
          <label htmlFor={`${id}-a`} className="sr-only">
            Lien ou texte de l&apos;annonce
          </label>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <textarea
              ref={champ}
              id={`${id}-a`}
              name="lien"
              value={valeur}
              onChange={(e) => {
                setValeur(e.target.value);
                setErreur(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              rows={2}
              placeholder="Collez le lien Leboncoin, La Centrale, AutoScout24, ou le texte de l'annonce"
              aria-describedby={erreur ? `${id}-e` : undefined}
              aria-invalid={!!erreur}
              disabled={etat === "lecture"}
              className={cx(inputCls, "min-h-14 resize-none text-base leading-snug sm:min-h-[52px]")}
            />
            <button type="submit" disabled={etat === "lecture"} className="btn btn-o sm:self-start">
              {etat === "lecture" ? "Lecture de l'annonce…" : "Analyser"}
            </button>
          </div>
          {erreur && (
            <p id={`${id}-e`} role="alert" className="text-sm text-warn">
              {erreur}
            </p>
          )}
          <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-ink-3">
            ou essayez :
            {CLES_EXEMPLES.map((k) => (
              <button key={k} type="button" onClick={() => exemple(k)} className="rounded-full border border-line-2 bg-glass px-3 py-1 text-ink-2 transition hover:border-o/50 hover:text-ink">
                {EXEMPLES[k].onglet} <span className="num text-ink-3">· {euros(EXEMPLES[k].prix)}</span>
              </button>
            ))}
          </p>
        </form>
      )}

      {etat === "apercu" && (
        <>
          <CarteApercu contenu={contenu} fini={fini} titreRef={titreCarte} />
          {contenu?.type === "exemple" && fini && (
            <p className="text-sm text-ink-2">
              C&apos;est un exemple analysé par l&apos;outil.{" "}
              <button type="button" onClick={nouvelle} className="font-medium text-o2 underline underline-offset-4">
                Collez la vôtre
              </button>
              , l&apos;aperçu est immédiat.
            </p>
          )}
          {reel && (
            <section className="carte grid gap-4 p-5 text-left sm:p-6" aria-labelledby={`${id}-s`}>
              <div className="grid gap-2">
                <p className="text-sm text-ink-3">Vous achetez pour vous, ou pour revendre ?</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Pour vous ou pour revendre">
                  {(
                    [
                      ["particulier", "J'achète pour moi"],
                      ["benef", "Je revends"],
                    ] as [Famille, string][]
                  ).map(([f, l]) => (
                    <button key={f} type="button" aria-pressed={famille === f} onClick={() => choisirFamille(f)} className={cx("rounded-full border px-3.5 py-1.5 text-sm transition", famille === f ? "border-o/60 bg-o/12 text-ink" : "border-line-2 text-ink-2 hover:text-ink")}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 id={`${id}-s`} className="font-display text-xl font-semibold">
                  Le rapport complet
                </h2>
                <p className="mt-1 text-ink-2">
                  {benef
                    ? "Coût réel d'achat, prix à proposer, questions au vendeur, points à contrôler sur place. Votre espace s'ouvre en Benef : marge nette après frais, prix d'offre et plafond dès la formule Starter. Première analyse offerte."
                    : "Coût réel d'achat, prix à proposer, questions au vendeur, lecture des photos, points à contrôler sur place. Première analyse offerte, sans carte bancaire."}
                </p>
              </div>
              {erreurAnalyse && (
                <p role="alert" className="rounded-2xl border border-warn/40 bg-warn/10 px-4 py-2.5 text-sm text-warn">
                  {erreurAnalyse}{" "}
                  <Link href="/app" className="underline underline-offset-4">
                    Ouvrir mon espace
                  </Link>
                </p>
              )}
              {connecte ? (
                <button type="button" onClick={() => void analyserComplet(texte, origine)} className="btn btn-o w-fit">
                  Voir mon rapport
                </button>
              ) : (
                <InscriptionInline
                  fournisseurs={fournisseurs}
                  suite={suite}
                  onSucces={() => {
                    track("inscription_inline_ok", { fournisseur: "email" });
                    void analyserComplet(texte, origine);
                  }}
                  avantSocial={() => {
                    try {
                      sessionStorage.setItem(CLE_REPRISE, JSON.stringify({ texte, origine }));
                    } catch {
                      /* stockage indisponible */
                    }
                  }}
                />
              )}
              <button type="button" onClick={nouvelle} className="w-fit text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                Nouvelle annonce
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
