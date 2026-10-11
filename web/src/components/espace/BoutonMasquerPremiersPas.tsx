"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Masque la carte « Premiers pas » pour de bon (profils.reglages.premiers_pas). */
export function BoutonMasquerPremiersPas({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const [charge, setCharge] = useState(false);
  return (
    <button
      type="button"
      disabled={charge}
      className={className}
      onClick={async () => {
        setCharge(true);
        await fetch("/api/profil", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ premiers_pas: "masque" }) }).catch(() => null);
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
