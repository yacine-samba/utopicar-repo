"use client";
import { useId, useState } from "react";
import { inputCls } from "../ui";

const FN = "https://rvdfifhgosovdapdltps.supabase.co/functions/v1/contact";

/** Formulaire de contact : message stocké puis transféré par email (fonction Supabase « contact »). */
export function FormContact() {
  const id = useId();
  const [etat, setEtat] = useState<"" | "envoi" | "ok">("");
  const [err, setErr] = useState("");
  if (etat === "ok")
    return (
      <p role="status" className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-ok">
        Message envoyé. La réponse arrive par email, en général sous 48 heures.
      </p>
    );
  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const prenom = String(f.get("prenom") || "").trim();
        const email = String(f.get("email") || "").trim();
        const message = String(f.get("message") || "").trim();
        if (!prenom || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 5) return setErr("Remplissez les trois champs, avec une adresse email valide.");
        setErr("");
        setEtat("envoi");
        try {
          const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ site: "utopicar", prenom, email, message, site_web: f.get("site_web") || "" }) });
          const d = await r.json().catch(() => ({}));
          if (r.ok && d.ok) return setEtat("ok");
          setErr(d.erreur === "trop" ? "Trop de messages envoyés. Réessayez dans une heure." : "L'envoi a échoué. Réessayez dans un instant.");
        } catch {
          setErr("Connexion impossible. Réessayez dans un instant.");
        }
        setEtat("");
      }}
    >
      <p className="text-sm text-ink-3">Tous les champs sont obligatoires.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Prénom</span>
          <input name="prenom" required autoComplete="given-name" maxLength={60} className={inputCls} aria-describedby={err ? `${id}-e` : undefined} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Email pour la réponse</span>
          <input name="email" type="email" required autoComplete="email" className={inputCls} aria-describedby={err ? `${id}-e` : undefined} />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Message</span>
        <textarea name="message" required rows={5} maxLength={3000} className={inputCls} aria-describedby={err ? `${id}-e` : undefined} />
      </label>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Ne pas remplir <input name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {err && (
        <p id={`${id}-e`} role="alert" className="text-sm text-bad">
          {err}
        </p>
      )}
      <button type="submit" disabled={etat === "envoi"} className="btn btn-o w-fit">
        {etat === "envoi" ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
