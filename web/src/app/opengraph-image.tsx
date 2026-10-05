import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Image de partage (liens envoyés sur WhatsApp, Facebook, LinkedIn…). */
export const alt = "Utopicar : voyez en 10 secondes si une occasion est une vraie affaire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/icons/icon-512.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #0f0d0b 0%, #2a160c 100%)", color: "#f4f1ec" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={logo} width={96} height={96} alt="" style={{ borderRadius: 24 }} />
          <span style={{ fontSize: 44, fontWeight: 700 }}>utopicar</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>Cette occasion est-elle une vraie affaire ?</span>
          <span style={{ fontSize: 34, color: "#c9c0b6" }}>Cote du marché, défauts qui coûtent cher, prix à proposer. En 10 secondes.</span>
        </div>
        <span style={{ fontSize: 30, color: "#ff5a1f", fontWeight: 700 }}>utopicar.fr</span>
      </div>
    ),
    size,
  );
}
