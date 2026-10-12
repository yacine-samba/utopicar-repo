/* Remplace next/image hors de Next : une balise <img> ordinaire. */
import type { ImgHTMLAttributes } from "react";

type Src = string | { src: string; width?: number; height?: number };
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: Src; priority?: boolean; fill?: boolean; quality?: number; placeholder?: string; blurDataURL?: string; unoptimized?: boolean };

export default function Image({ src, priority, fill, quality, placeholder, blurDataURL, unoptimized, style, ...reste }: Props) {
  void quality; void placeholder; void blurDataURL; void unoptimized;
  const s = typeof src === "string" ? src : src.src;
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={s} loading={priority ? "eager" : reste.loading} style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style} {...reste} />
  );
}
