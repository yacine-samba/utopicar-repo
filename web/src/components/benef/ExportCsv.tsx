"use client";

/** Télécharge un tableau en CSV (séparateur point-virgule, lisible par Excel en français). */
export function ExportCsv({ nom, entetes, lignes }: { nom: string; entetes: string[]; lignes: (string | number | null)[][] }) {
  return (
    <button
      type="button"
      className="btn btn-sm"
      disabled={!lignes.length}
      onClick={() => {
        const esc = (v: string | number | null) => (v == null ? "" : /[";\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
        const csv = "﻿" + [entetes, ...lignes].map((l) => l.map(esc).join(";")).join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const a = Object.assign(document.createElement("a"), { href: url, download: `${nom}.csv` });
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      Exporter en CSV
    </button>
  );
}
