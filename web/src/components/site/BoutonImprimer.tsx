"use client";

export function BoutonImprimer({ children = "Enregistrer en PDF", className = "btn btn-sm" }: { children?: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={() => print()} className={className}>
      {children}
    </button>
  );
}
