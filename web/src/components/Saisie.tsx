"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Analyse } from "@/lib/analyse/couts";
import { Champ, cx, inputCls } from "./ui";

type PhotoLocale = { id: string; url: string; data: string };
const MAX_PHOTOS = 6;

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
  villeInitiale,
  villeLabel,
  villeAide,
  bouton,
  enPlus,
  onResultat,
}: {
  villeInitiale: string;
  villeLabel: string;
  villeAide: string;
  bouton: string;
  enPlus?: ReactNode;
  onResultat: (a: Analyse, ville: string) => void;
}) {
  const [texte, setTexte] = useState("");
  const [ville, setVille] = useState(villeInitiale);
  const [photos, setPhotos] = useState<PhotoLocale[]>([]);
  const [charge, setCharge] = useState(false);
  const [sec, setSec] = useState(0);
  const [erreur, setErreur] = useState("");
  const fichier = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!charge) return;
    const t0 = Date.now();
    const i = setInterval(() => setSec(Math.round((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(i);
  }, [charge]);

  async function ajouter(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith("image/")).slice(0, MAX_PHOTOS - photos.length);
    const r = (await Promise.all(imgs.map(reduire))).filter((x): x is PhotoLocale => !!x);
    setPhotos((p) => [...p, ...r].slice(0, MAX_PHOTOS));
  }

  async function lancer() {
    setErreur("");
    if (texte.trim().length < 30) {
      setErreur("Collez le texte complet de l'annonce (titre, prix, kilométrage, description).");
      return;
    }
    setCharge(true);
    setSec(0);
    try {
      const r = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte, ville, photos: photos.map((p) => ({ media_type: "image/jpeg", data: p.data })) }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j) throw new Error(j?.erreur || "L'analyse a échoué, réessayez.");
      onResultat(j as Analyse, ville);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "L'analyse a échoué, réessayez.");
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
      onPaste={(e) => {
        const f = Array.from(e.clipboardData.files);
        if (f.length) {
          e.preventDefault();
          ajouter(f);
        }
      }}
    >
      <Champ label="L'annonce" aide="Sur Leboncoin, La Centrale ou AutoScout24 : sélectionnez toute la page (Ctrl+A), copiez, collez ici.">
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={8}
          required
          placeholder={"Renault Clio IV 1.5 dCi 90 Business\n7 400 €\n2016 · 128 000 km · Diesel · Manuelle\nMelun 77000\n\nDescription : très bon état, CT ok, distribution faite…"}
          className={cx(inputCls, "min-h-44 resize-y leading-relaxed")}
        />
      </Champ>

      <div className="grid gap-2">
        <span className="text-sm text-ink-2">
          Photos <span className="text-ink-3">(facultatif, {MAX_PHOTOS} maximum, vous pouvez aussi les coller)</span>
        </span>
        <div
          className="flex flex-wrap gap-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            ajouter(Array.from(e.dataTransfer.files));
          }}
        >
          {photos.map((p) => (
            <div key={p.id} className="relative size-20 overflow-hidden rounded-xl border border-line-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local en data URL */}
              <img src={p.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Retirer la photo"
                onClick={() => setPhotos((l) => l.filter((x) => x.id !== p.id))}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Champ label={villeLabel} aide={villeAide}>
          <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="ex. Lyon" className={inputCls} autoComplete="address-level2" />
        </Champ>
        {enPlus}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={charge}
          className="rounded-full bg-o px-6 py-3 font-display text-base font-semibold text-[#160904] shadow-[0_10px_30px_-10px_rgba(255,90,31,.8)] transition hover:bg-o2 disabled:opacity-60"
        >
          {charge ? "Analyse en cours…" : bouton}
        </button>
        {charge && (
          <span className="flex items-center gap-2 text-sm text-ink-2" aria-live="polite">
            <span className="size-4 animate-spin rounded-full border-2 border-o/30 border-t-o" />
            {ETAPES[etape]}… <span className="num text-ink-3">{sec} s</span>
          </span>
        )}
        {erreur && (
          <p role="alert" className="text-sm text-bad">
            {erreur}
          </p>
        )}
      </div>
    </form>
  );
}
