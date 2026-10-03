"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Analyse } from "@/lib/analyse/couts";
import { photosDepuisHtml, texteDepuisExtension } from "@/lib/analyse/import";
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

const ETAPES = ["Lecture du texte de l'annonce", "Recherche des défauts qui coûtent cher", "Estimation du prix du marché", "Calcul des frais"];

export function Saisie({
  mode,
  maxPhotos,
  villeInitiale,
  villeLabel,
  villeAide,
  bouton,
  retour,
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
  const fichier = useRef<HTMLInputElement>(null);

  // Annonce collée avant l'inscription : on la retrouve au retour.
  useEffect(() => {
    try {
      const b = JSON.parse(sessionStorage.getItem(BROUILLON) || "null");
      if (b?.mode === mode && b.texte) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reprise unique du brouillon
        setTexte(b.texte);
        if (b.ville) setVille(b.ville);
        sessionStorage.removeItem(BROUILLON);
      }
    } catch {
      /* stockage indisponible */
    }
  }, [mode]);

  useEffect(() => {
    if (!charge) return;
    const t0 = Date.now();
    const i = setInterval(() => setSec(Math.round((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(i);
  }, [charge]);

  async function ajouter(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith("image/")).slice(0, maxPhotos - photos.length);
    const r = (await Promise.all(imgs.map(reduire))).filter((x): x is PhotoLocale => !!x);
    setPhotos((p) => [...p, ...r].slice(0, maxPhotos));
  }

  async function lancer() {
    setErreur(null);
    if (texte.trim().length < 30) {
      setErreur({ t: "Collez le texte complet de l'annonce : titre, prix, kilométrage et description." });
      return;
    }
    setCharge(true);
    setSec(0);
    try {
      const r = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, texte, ville, photos: photos.map((p) => ({ media_type: "image/jpeg", data: p.data })) }),
      });
      const j = await r.json().catch(() => null);
      if (r.status === 401) {
        try {
          sessionStorage.setItem(BROUILLON, JSON.stringify({ mode, texte, ville }));
        } catch {
          /* stockage indisponible */
        }
        router.push(`/inscription?next=${encodeURIComponent(retour)}`);
        return;
      }
      if (!r.ok || !j) {
        setErreur({ t: j?.erreur || "L'analyse a échoué, réessayez.", offres: j?.offres });
        return;
      }
      onResultat(j as Analyse, ville);
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
        <button type="submit" disabled={charge} className="btn btn-o">
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
