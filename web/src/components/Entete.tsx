import Link from "next/link";
import type { ReactNode } from "react";

export function Marque() {
  return (
    <svg viewBox="0 0 512 512" className="size-8" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#15110d" />
      <g transform="translate(256 256) scale(.3) translate(-966 -965)">
        <path
          d="M292 1102 C380 1020 500 975 628 970 C760 880 880 828 1030 828 C1160 828 1280 868 1393 912 L1277 972 C1100 1000 880 1015 700 1017 C560 1019 450 1040 388 1102 Z M710 970 C800 910 900 870 1020 870 C1100 870 1180 887 1242 905 C1216 929 1192 939 1170 942 C1030 960 860 970 710 970 Z"
          fill="#f4f1ec"
          fillRule="evenodd"
        />
        <path d="M1102 1102 L1297 1102 L1640 830 L1425 862 L1503 896 Z" fill="#ff5a1f" />
        <path d="M1490 997 L1553 946 C1561 962 1546 986 1552 1010 C1564 1048 1570 1080 1561 1103 L1554 1103 C1540 1062 1520 1030 1490 997 Z" fill="#ff5a1f" />
      </g>
    </svg>
  );
}

export function Entete({ href, sous, children }: { href: string; sous: string; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg0/75 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href={href} className="flex items-center gap-2.5 no-underline">
          <Marque />
          <span className="font-display text-lg font-semibold tracking-tight">
            Utopicar <small className="ml-1 text-sm font-medium text-o2">{sous}</small>
          </span>
        </Link>
        {children}
      </div>
    </header>
  );
}
