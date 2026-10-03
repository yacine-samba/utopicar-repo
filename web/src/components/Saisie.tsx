"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Analyse } from "@/lib/analyse/couts";
import { lienLeboncoin, photosDepuisHtml, texteDepuisExtension, texteDepuisImport } from "@/lib/analyse/import";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { Champ, cx, inputCls } from "./ui";

type PhotoLocale = { id: string; url: string; data: string };
const BROUILLON = "utp-brouillon";

/** Réduit une photo (1280 px, JPEG) pour l'envoyer à l'analyse sans dépasser la taille autorisée. */
async function reduire(f: File): Promise<PhotoLocale | null> {
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", 0.8);
    return { id: Math.random().toString(36).slice(2), url, data: url.split(",")[1] };
  } catch {
    return null;
  }
}

/** Photo reçue en data URL (import par lien) : même réduction que les photos ajoutées à la main. */
async function depuisDataUrl(u: string, i: number) {
  const b = await (await fetch(u)).blob();
  return reduire(new File([b], `photo-${i + 1}.jpg`, { type: b.type || "image/jpeg" }));
}

const ERREURS_IMPORT: Record<string, string> = {
  lien: "Ce lien n'est pas celui d'une annonce Leboncoin. Pour La Centrale ou AutoScout24, copiez la page et collez-la ci-dessous.",
  introuvable: "Annonce introuvable : elle a peut-être été retirée ou vendue.",
  trop: "Vous avez importé beaucoup d'annonces aujourd'hui. Copiez la page de l'annonce et collez-la ci-dessous.",
};

const ETAPES = ["Lecture du texte de l'annonce", "Recherche des défauts qui coûtent cher", "Estimation du prix du marché", "Calcul des frais"];

export function Saisie({
  mode,
  maxPhotos,
  villeInitiale,
  villeLabel,
  villeAide,
  bouton,
  retour,
  lienInitial,
  enPlus,
  onResultat,
}: {
  mode: "particulier" | "benef";
  maxPhotos: number;
  villeInitiale: string;
  villeLabel: string;
  villeAide: string;
  bouton: string;
  /** Page où revenir après l'inscription, si elle est nécessaire. */
  retour: string;
  /** Lien Leboncoin reçu par l'adresse (?lien=…, depuis le tableau de bord) : importé dès l'ouverture. */
  lienInitial?: string;
  enPlus?: ReactNode;
  onResultat: (a: Analyse, ville: string) => void;
}) {
  const router = useRouter();
  const [texte, setTexte] = useState("");
  const [ville, setVille] = useState(villeInitiale);
  const [photos, setPhotos] = useState<PhotoLocale[]>([]);
  const [charge, setCharge] = useState(false);
  const [sec, setSec] = useState(0);
  const [erreur, setErreur] = useState<{ t: string; offres?: string } | null>(null);
  const [lien, setLien] = useState("");
  const [lecture, setLecture] = useState(false);
  const fichier = useRef<HTMLInputElement>(null);

  // Annonce collée avant l'inscription : on la retrouve au retour.
  useEffect(() => {
    try {
      const b = JSON.parse(sessionStorage.getItem(BROUILLON) || "null");
      if (b?.mode === mode && b.lien) {
        sessionStorage.removeItem(BROUILLON);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reprise unique du brouillon
        setLien(b.lien);
        if (b.ville) setVille(b.ville);
        importer(b.lien, b.ville ?? "");
      } else if (b?.mode === mode && b.texte) {
        setTexte(b.texte);
        if (b.ville) setVille(b.ville);
        sessionStorage.removeItem(BROUILLON);
      } else if (lienInitial && lienLeboncoin(lienInitial)) {
        setLien(lienInitial);
        // Le lien quitte l'adresse : actualiser la page ne relance pas l'import.
        history.replaceState(null, "", location.pathname);
        importer(lienInitial, villeInitiale);
      }
    } catch {
      /* stockage indisponible */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois, à l'ouverture
  }, [mode]);

  useEffect(() => {
    if (!charge && !lecture) return;
    const t0 = Date.now();
    const i = setInterval(() => setSec(Math.round((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(i);
  }, [charge, lecture]);

  async function ajouter(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith("image/")).slice(0, maxPhotos - photos.length);
    const r = (await Promise.all(imgs.map(reduire))).filter((x): x is PhotoLocale => !!x);
    setPhotos((p) => [...p, ...r].slice(0, maxPhotos));
  }

  function versInscription(brouillon: Record<string, string>) {
    try {
      sessionStorage.setItem(BROUILLON, JSON.stringify({ mode, ...brouillon }));
    } catch {
      /* stockage indisponible */
    }
    router.push(`/inscription?next=${encodeURIComponent(retour)}`);
  }

  /** Lien Leboncoin collé : la fonction `annonce` (Apify) lit l'annonce et ses photos, puis l'analyse part toute seule. */
  async function importer(url: string, villeChoisie = ville) {
    setErreur(null);
    if (!lienLeboncoin(url)) {
      setErreur({ t: ERREURS_IMPORT.lien });
      return;
    }
    if (!SUPABASE_URL) {
      setErreur({ t: "L'import par lien ouvre très bientôt. Copiez la page de l'annonce et collez-la ci-dessous." });
      return;
    }
    const { data } = await supabaseNavigateur().auth.getSession();
    const jeton = data.session?.access_token;
    if (!jeton) {
      versInscription({ lien: url, ville: villeChoisie });
      return;
    }
    setLecture(true);
    setSec(0);
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/annonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jeton}`, apikey: SUPABASE_CLE },
        body: JSON.stringify({ url }),
      });
      const j = await r.json().catch(() => null);
      if (r.status === 401) return versInscription({ lien: url, ville: villeChoisie });
      if (!r.ok || !j?.ok) {
        setErreur({ t: ERREURS_IMPORT[j?.erreur] ?? "Lecture de l'annonce impossible pour le moment. Copiez la page de l'annonce et collez-la ci-dessous." });
        return;
      }
      const t = texteDepuisImport(j);
      setTexte(t);
      const ph = maxPhotos > 0 ? (await Promise.all((j.photos as string[]).slice(0, maxPhotos).map(depuisDataUrl))).filter((x): x is PhotoLocale => !!x) : [];
      setPhotos(ph);
      setLecture(false);
      await lancer(t, ph, villeChoisie);
    } catch {
      setErreur({ t: "Connexion impossible. Vérifiez votre réseau et réessayez." });
    } finally {
      setLecture(false);
    }
  }

  async function lancer(t = texte, ph = photos, v = ville) {
    setErreur(null);
    if (t.trim().length < 30) {
      setErreur({ t: "Collez le texte complet de l'annonce : titre, prix, kilométrage et description." });
      return;
    }
    setCharge(true);
    setSec(0);
    try {
      const r = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, texte: t, ville: v, photos: ph.map((p) => ({ media_type: "image/jpeg", data: p.data })) }),
      });
      const j = await r.json().catch(() => null);
      if (r.status === 401) return versInscription({ texte: t, ville: v });
      if (!r.ok || !j) {
        setErreur({ t: j?.erreur || "L'analyse a échoué, réessayez.", offres: j?.offres });
        return;
      }
      onResultat(j as Analyse, v);
    } catch {
      setErreur({ t: "Connexion impossible. Vérifiez votre réseau et réessayez." });
    } finally {
      setCharge(false);
    }
  }

  const etape = Math.min(ETAPES.length - 1, Math.floor(sec / 6));

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        lancer();
      }}
      onPaste={async (e) => {
        // Copie de l'extension UTOPICAR Scanner : texte structuré et photos jointes.
        const brut = e.clipboardData.getData("text/plain");
        const url = lienLeboncoin(brut);
        if (url && (e.target as HTMLElement).tagName === "TEXTAREA") {
          e.preventDefault();
          setLien(url);
          importer(url);
          return;
        }
        const converti = texteDepuisExtension(brut);
        if (converti) {
          e.preventDefault();
          setTexte(converti);
          const urls = photosDepuisHtml(e.clipboardData.getData("text/html")).slice(0, maxPhotos);
          if (urls.length) {
            const fichiers = await Promise.all(urls.map(async (u, i) => new File([await (await fetch(u)).blob()], `photo-${i + 1}.jpg`, { type: "image/jpeg" })));
            ajouter(fichiers);
          }
          return;
        }
        const f = Array.from(e.clipboardData.files);
        if (f.length && maxPhotos > 0) {
          e.preventDefault();
          ajouter(f);
        }
      }}
    >
      <div className="grid gap-2">
        <label htmlFor="lien-annonce" className="text-sm text-ink-2">
          Lien de l&apos;annonce Leboncoin
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="lien-annonce"
            type="url"
            inputMode="url"
            value={lien}
            onChange={(e) => setLien(e.target.value)}
            onPaste={(e) => {
              const url = lienLeboncoin(e.clipboardData.getData("text/plain"));
              if (!url) return;
              e.preventDefault();
              e.stopPropagation();
              setLien(url);
              importer(url);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                importer(lien);
              }
            }}
            placeholder="https://www.leboncoin.fr/ad/voitures/…"
            aria-describedby="lien-aide"
            className={cx(inputCls, "min-w-0 flex-1")}
          />
          <button type="button" onClick={() => importer(lien)} disabled={lecture || charge || !lien.trim()} className="btn btn-o shrink-0">
            {lecture ? "Lecture…" : "Analyser ce lien"}
          </button>
        </div>
        <p id="lien-aide" className="text-xs text-ink-3">
          Collez le lien : l&apos;annonce et ses photos sont récupérées, puis l&apos;analyse démarre toute seule (environ une minute).
        </p>
        {lecture && (
          <p className="flex items-center gap-2 text-sm text-ink-2" role="status">
            <span className="size-4 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" />
            Lecture de l&apos;annonce sur Leboncoin… <span className="num text-ink-3">{sec} s</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[.12em] text-ink-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        ou collez le texte
        <span className="h-px flex-1 bg-line" />
      </div>

      <Champ label="L'annonce" aide="Sur Leboncoin, La Centrale ou AutoScout24 : sélectionnez toute la page (Ctrl+A), copiez (Ctrl+C), puis collez ici (Ctrl+V).">
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={8}
          required
          placeholder={"Renault Clio IV 1.5 dCi 90 Business\n7 400 €\n2016 · 128 000 km · Diesel · Manuelle\nMelun 77000\n\nDescription : très bon état, CT ok, distribution faite…"}
          className={cx(inputCls, "min-h-44 resize-y leading-relaxed")}
        />
      </Champ>

      {maxPhotos > 0 ? (
        <div className="grid gap-2">
          <span className="text-sm text-ink-2">
            Photos <span className="text-ink-3">(facultatif, {maxPhotos} au plus ; vous pouvez aussi les coller)</span>
          </span>
          <div
            className="flex flex-wrap gap-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              ajouter(Array.from(e.dataTransfer.files));
            }}
          >
            {photos.map((p, i) => (
              <div key={p.id} className="relative size-20 overflow-hidden rounded-xl border border-line-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local en data URL */}
                <img src={p.url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                <button type="button" aria-label={`Retirer la photo ${i + 1}`} onClick={() => setPhotos((l) => l.filter((x) => x.id !== p.id))} className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/75 text-xs">
                  ✕
                </button>
              </div>
            ))}
            {photos.length < maxPhotos && (
              <button
                type="button"
                onClick={() => fichier.current?.click()}
                className="grid size-20 place-items-center rounded-xl border border-dashed border-line-2 text-2xl text-ink-3 transition hover:border-o/50 hover:text-o2"
                aria-label="Ajouter des photos"
              >
                +
              </button>
            )}
            <input
              ref={fichier}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                ajouter(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-3">
          L&apos;analyse des photos est comprise dans les formules <Link href="/tarifs" className="text-o2 underline underline-offset-4">Essentiel et Sérénité</Link>.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Champ label={villeLabel} aide={villeAide}>
          <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="ex. Lyon" className={inputCls} autoComplete="address-level2" />
        </Champ>
        {enPlus}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={charge || lecture} className="btn btn-o">
          {charge ? "Analyse en cours…" : bouton}
        </button>
        {charge && (
          <span className="flex items-center gap-2 text-sm text-ink-2" role="status">
            <span className="size-4 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" />
            {ETAPES[etape]}… <span className="num text-ink-3">{sec} s</span>
          </span>
        )}
      </div>
      {erreur && (
        <div role="alert" className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm">
          <p className="text-warn">{erreur.t}</p>
          {erreur.offres && (
            <Link href={`/tarifs#${erreur.offres === "benef" ? "benef" : "particuliers"}`} className="btn btn-o btn-sm mt-3">
              Voir les formules
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
