/** Symbole Utopicar (voiture stylisée). */
export function Symbole({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="282 812 1370 305" className={className} aria-hidden="true">
      <path
        d="M292 1102 C380 1020 500 975 628 970 C760 880 880 828 1030 828 C1160 828 1280 868 1393 912 L1277 972 C1100 1000 880 1015 700 1017 C560 1019 450 1040 388 1102 Z M710 970 C800 910 900 870 1020 870 C1100 870 1180 887 1242 905 C1216 929 1192 939 1170 942 C1030 960 860 970 710 970 Z"
        fill="#f4f1ec"
        fillRule="evenodd"
      />
      <path d="M1102 1102 L1297 1102 L1640 830 L1425 862 L1503 896 Z" fill="#ff5a1f" />
      <path d="M1490 997 L1553 946 C1561 962 1546 986 1552 1010 C1564 1048 1570 1080 1561 1103 L1554 1103 C1540 1062 1520 1030 1490 997 Z" fill="#ff5a1f" />
    </svg>
  );
}

export function Logo({ sous }: { sous?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-line-2 bg-[#15110d]">
        <Symbole className="h-auto w-[84%]" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        utopicar{sous && <small className="ml-1.5 text-sm font-medium text-o2">{sous}</small>}
      </span>
    </span>
  );
}
