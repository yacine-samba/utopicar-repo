"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { lienLeboncoin } from "@/lib/analyse/import";
import { inputCls } from "@/lib/cx";
import { Ico } from "./Icones";

/** Champ « collez le lien » du tableau de bord : ouvre l'analyse et lance l'import tout de suite. */
export function AnalyseRapide({ titre, texte }: { titre: string; texte: string }) {
  const router = useRouter();
  const id = useId();
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  const aller = (brut: string) => {
    const l = lienLeboncoin(brut);
    if (!l) return setErr("Collez le lien d'une annonce Leboncoin (il commence par https://www.leboncoin.fr/). Pour un autre site, utilisez « Coller le texte ».");
    router.push(`/app/analyser?lien=${encodeURIComponent(l)}`);
  };
  return (
    <section aria-labelledby={`${id}-t`} className="relative overflow-hidden rounded-3xl border border-o/30 bg-[radial-gradient(120%_120%_at_0%_0%,rgb(255_90_31/0.16),transparent_60%)] p-5 sm:p-7">
      <h2 id={`${id}-t`} className="font-display text-xl font-semibold sm:text-2xl">
        {titre}
      </h2>
      <p className="mt-1 max-w-2xl text-ink-2">{texte}</p>
      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          aller(v);
        }}
      >
        <label htmlFor={`${id}-l`} className="sr-only">
          Lien de l&apos;annonce Leboncoin
        </label>
        <div className="relative flex-1">
          <Ico nom="lien" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-3" />
          <input
            id={`${id}-l`}
            value={v}
            onChange={(e) => {
              setV(e.target.value);
              setErr("");
            }}
            onPaste={(e) => {
              const t = e.clipboardData.getData("text");
              if (lienLeboncoin(t)) {
                e.preventDefault();
                setV(t.trim());
                aller(t);
              }
            }}
            inputMode="url"
            autoComplete="off"
            placeholder="https://www.leboncoin.fr/ad/voitures/…"
            aria-invalid={!!err}
            aria-describedby={err ? `${id}-e` : undefined}
            className={`${inputCls} pl-12`}
          />
        </div>
        <button type="submit" className="btn btn-o whitespace-nowrap">
          Analyser
        </button>
      </form>
      {err ? (
        <p id={`${id}-e`} role="alert" className="mt-3 text-sm text-warn">
          {err}
        </p>
      ) : (
        <p className="mt-3 text-sm text-ink-3">
          Annonce La Centrale, AutoScout24 ou autre ?{" "}
          <Link href="/app/analyser" className="text-o2 underline underline-offset-4">
            Coller le texte
          </Link>
        </p>
      )}
    </section>
  );
}
