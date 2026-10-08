"use client";
/* Photos préparées pour l'analyse (réduites en JPEG, sous la taille autorisée), communes à la saisie et à l'analyse en arrière-plan. */

export type PhotoLocale = { id: string; url: string; data: string };

/** Image décodée par le navigateur : createImageBitmap, sinon une balise img (Safari lit ainsi les photos HEIC de l'iPhone). */
async function decoder(f: Blob): Promise<{ img: CanvasImageSource; w: number; h: number }> {
  try {
    const bmp = await createImageBitmap(f);
    return { img: bmp, w: bmp.width, h: bmp.height };
  } catch {
    const u = URL.createObjectURL(f);
    try {
      const im = new Image();
      im.src = u;
      await im.decode();
      return { img: im, w: im.naturalWidth, h: im.naturalHeight };
    } finally {
      setTimeout(() => URL.revokeObjectURL(u), 1000);
    }
  }
}

/** Réduit une photo (1280 px, JPEG) pour l'envoyer à l'analyse sans dépasser la taille autorisée. */
export async function reduire(f: File): Promise<PhotoLocale | null> {
  try {
    const { img, w, h } = await decoder(f);
    if (!w || !h) return null;
    const k = Math.min(1, 1280 / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", 0.8);
    const data = url.split(",")[1] ?? "";
    // canvas vide (image non décodée) ou trop lourde pour l'analyse
    if (data.length < 2000 || data.length > 1_500_000) return null;
    return { id: Math.random().toString(36).slice(2), url, data };
  } catch {
    return null;
  }
}
export const estImage = (f: File) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif|gif|bmp|avif)$/i.test(f.name);

/** Photo reçue en data URL (import par lien) : même réduction que les photos ajoutées à la main. */
export async function depuisDataUrl(u: string, i: number) {
  const b = await (await fetch(u)).blob();
  return reduire(new File([b], `photo-${i + 1}.jpg`, { type: b.type || "image/jpeg" }));
}

