/* Polo 5 (6R, 5 portes) de profil, dessinée en code pour la page 404 : arrêtée de nuit, phares allumés, warnings qui clignotent.
   Avant à gauche ; les faisceaux des phares débordent du dessin (overflow visible). Aucun logo de marque. */
export function Polo404({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 230" className={className} overflow="visible" aria-hidden="true">
      <defs>
        <linearGradient id="p404-caisse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9ccd3" />
          <stop offset="0.38" stopColor="#7d838e" />
          <stop offset="0.62" stopColor="#3b4049" />
          <stop offset="1" stopColor="#15171c" />
        </linearGradient>
        <linearGradient id="p404-reflet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="p404-vitre" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3446" />
          <stop offset="0.5" stopColor="#0b0f17" />
          <stop offset="1" stopColor="#05070b" />
        </linearGradient>
        <linearGradient id="p404-faisceau" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#ffe9b0" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffe9b0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="p404-jante" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#e9ebef" />
          <stop offset="0.6" stopColor="#9aa0aa" />
          <stop offset="1" stopColor="#4a4f58" />
        </radialGradient>
        <radialGradient id="p404-halo">
          <stop offset="0" stopColor="#ffb14a" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ff7a1f" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ef622e" stopOpacity="0" />
        </radialGradient>
        <filter id="p404-flou" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* faisceaux des phares sur la route, puis ombre au sol */}
      <polygon points="56,128 -620,96 -620,226 56,144" fill="url(#p404-faisceau)" />
      <ellipse cx="300" cy="216" rx="280" ry="11" fill="#000" opacity="0.7" filter="url(#p404-flou)" />
      {/* reflets orange des warnings sur le bitume */}
      <g className="p404-warn">
        <ellipse cx="60" cy="220" rx="70" ry="6" fill="url(#p404-halo)" opacity="0.7" />
        <ellipse cx="540" cy="220" rx="70" ry="6" fill="url(#p404-halo)" opacity="0.7" />
      </g>

      {/* caisse */}
      <path
        d="M50 192 C40 190 34 182 34 170 C34 156 36 146 42 138 C48 130 60 126 76 123 L130 116 C156 112 176 110 192 109 L258 44 C266 36 276 33 290 32 L420 31 C444 31 462 35 476 42 L530 78 C541 90 547 102 549 116 L553 152 L551 182 C549 190 543 193 532 193 L509 193 A45 45 0 1 0 423 193 L185 193 A45 45 0 1 0 99 193 L62 193 C56 193 53 193 50 192 Z"
        fill="url(#p404-caisse)"
      />
      {/* reflet de lune sur le flanc */}
      <path d="M58 128 L120 118 C200 106 380 98 528 76 L540 92 C380 112 200 124 60 140 Z" fill="url(#p404-reflet)" />
      {/* nervure d'épaule et bas de caisse */}
      <path d="M58 134 C200 121 380 110 546 100" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.2" fill="none" />
      <path d="M108 172 C240 170 380 168 516 165" stroke="#000" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <path d="M184 190 L424 190 L422 184 L186 186 Z" fill="#0a0b0e" opacity="0.6" />

      {/* vitres, montants et rétroviseur */}
      <path d="M203 107 L262 48 C268 42 275 40 286 40 L414 39 C430 39 444 42 456 49 L500 78 C506 83 505 90 498 91 L212 108 C204 109 200 109 203 107 Z" fill="url(#p404-vitre)" />
      <path d="M232 70 L262 44 L300 42 L254 72 Z" fill="#fff" opacity="0.07" />
      <polygon points="330,40 342,40 345,101 333,102" fill="#07080b" />
      <path d="M436 41 L452 46 L478 94 L458 96 Z" fill="url(#p404-caisse)" />
      <path d="M214 100 C221 91 238 91 241 99 L237 108 L216 109 Z" fill="#2b2f37" />
      <ellipse cx="229" cy="99" rx="7" ry="2.2" className="p404-warn" fill="#ffae3d" />

      {/* portes et poignées */}
      <path d="M200 110 L196 186 M338 104 L340 186 M456 98 C468 128 470 160 464 186" stroke="#000" strokeOpacity="0.4" strokeWidth="1.4" fill="none" />
      <rect x="300" y="118" width="20" height="4" rx="2" fill="#0d0f13" opacity="0.7" />
      <rect x="420" y="112" width="20" height="4" rx="2" fill="#0d0f13" opacity="0.7" />

      {/* face avant : bouclier, prise d'air, phare et clignotant */}
      <path d="M38 166 C50 163 70 162 86 162 L84 176 C66 177 50 179 40 180 Z" fill="#0a0b0e" />
      <circle cx="74" cy="169" r="4" fill="#d9dde4" opacity="0.8" />
      <path d="M44 140 C52 130 70 126 96 122 L132 118 C134 122 132 128 126 131 C100 136 72 142 46 147 Z" fill="#f4f7ff" />
      <path d="M70 134 C86 130 104 127 122 125" stroke="#9fb6d6" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M44 140 C47 135 51 132 58 130 L58 144 C53 145 49 146 46 147 Z" className="p404-warn" fill="#ffae3d" />
      <circle cx="52" cy="139" r="34" fill="url(#p404-halo)" className="p404-warn" />

      {/* feu arrière et clignotant */}
      <path d="M530 80 C538 90 545 102 548 114 L549 128 L537 126 C533 112 529 98 525 84 Z" fill="#a3121c" />
      <path d="M536 104 L547 110 L548 120 L538 118 Z" className="p404-warn" fill="#ffae3d" />
      <circle cx="542" cy="110" r="30" fill="url(#p404-halo)" className="p404-warn" />

      {/* roues */}
      {[142, 466].map((x) => (
        <g key={x}>
          <circle cx={x} cy="178" r="37" fill="#0b0b0d" />
          <circle cx={x} cy="178" r="35" fill="none" stroke="#1d1f24" strokeWidth="2" />
          <g className="p404-roue">
            <circle cx={x} cy="178" r="26" fill="url(#p404-jante)" />
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((a) => (
              <rect key={a} x={x - 1.6} y="155" width="3.2" height="18" rx="1.6" fill="#24272d" transform={`rotate(${a} ${x} 178)`} />
            ))}
            <circle cx={x} cy="178" r="5" fill="#cfd3da" />
          </g>
          <circle cx={x} cy="178" r="26" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}
