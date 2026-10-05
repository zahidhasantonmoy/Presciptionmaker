import React from 'react';

export function RailwayLogo({ size = 74 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Outer Golden Border */}
      <circle cx="50" cy="50" r="49" fill="#006837" stroke="#b45309" strokeWidth="1.2" />

      {/* Decorative Wreath Ring */}
      <circle cx="50" cy="50" r="44" fill="#00582f" stroke="#eab308" strokeWidth="1" strokeDasharray="2 1.5" />

      {/* Inner White Rim */}
      <circle cx="50" cy="50" r="40" fill="#ffffff" />

      {/* Inner Red Core (Bangladesh Emblem style) */}
      <circle cx="50" cy="50" r="36" fill="#be123c" />

      {/* Golden National Star at 12 O'Clock */}
      <polygon
        points="50,18 51.8,22.8 56.5,23.1 52.8,26.2 54.1,31 50,28.2 45.9,31 47.2,26.2 43.5,23.1 48.2,22.8"
        fill="#facc15"
      />

      {/* Golden Laurel / Paddy Wreaths on both sides */}
      <path
        d="M23 42 C20 52 21 64 29 74"
        stroke="#facc15"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M77 42 C80 52 79 64 71 74"
        stroke="#facc15"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Wheat leaves details */}
      <circle cx="21" cy="46" r="1.4" fill="#fef08a" />
      <circle cx="20" cy="53" r="1.4" fill="#fef08a" />
      <circle cx="22" cy="61" r="1.4" fill="#fef08a" />
      <circle cx="25" cy="68" r="1.4" fill="#fef08a" />

      <circle cx="79" cy="46" r="1.4" fill="#fef08a" />
      <circle cx="80" cy="53" r="1.4" fill="#fef08a" />
      <circle cx="78" cy="61" r="1.4" fill="#fef08a" />
      <circle cx="75" cy="68" r="1.4" fill="#fef08a" />

      {/* Central Locomotive Engine Front Body */}
      <path
        d="M37 38 C37 34 63 34 63 38 L64 61 C64 65 60 67 50 67 C40 67 36 65 36 61 Z"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="1"
      />

      {/* Engine Roof Arc */}
      <path d="M38 41 Q50 36 62 41" stroke="#006837" strokeWidth="1.5" fill="none" />

      {/* Engine Large Windshield */}
      <rect x="40" y="42" width="20" height="9" rx="1.5" fill="#006837" />
      {/* Windshield Center Divider */}
      <line x1="50" y1="42" x2="50" y2="51" stroke="#ffffff" strokeWidth="1" />

      {/* Engine Headlights */}
      <circle cx="41.5" cy="57" r="2.5" fill="#facc15" stroke="#713f12" strokeWidth="0.8" />
      <circle cx="58.5" cy="57" r="2.5" fill="#facc15" stroke="#713f12" strokeWidth="0.8" />

      {/* Center Buffer / Emblem Light */}
      <circle cx="50" cy="61" r="2" fill="#be123c" stroke="#ffffff" strokeWidth="0.6" />

      {/* Cowcatcher / Rail Track Base */}
      <polygon points="34,67 66,67 62,75 38,75" fill="#1e293b" />
      <line x1="38" y1="71" x2="62" y2="71" stroke="#facc15" strokeWidth="1" />
      <line x1="43" y1="67" x2="41" y2="75" stroke="#ffffff" strokeWidth="0.8" />
      <line x1="50" y1="67" x2="50" y2="75" stroke="#ffffff" strokeWidth="0.8" />
      <line x1="57" y1="67" x2="59" y2="75" stroke="#ffffff" strokeWidth="0.8" />
    </svg>
  );
}
