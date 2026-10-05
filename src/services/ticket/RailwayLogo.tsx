import React from 'react';

export function RailwayLogo({ size = 70 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Outer Green Ring */}
      <circle cx="50" cy="50" r="48" fill="#006633" stroke="#b45309" strokeWidth="1.5" />
      {/* Inner White Ring */}
      <circle cx="50" cy="50" r="43" fill="#ffffff" />
      {/* Inner Red Circle */}
      <circle cx="50" cy="50" r="38" fill="#e11d48" />

      {/* Star at Top */}
      <polygon
        points="50,15 52,20 57,20 53,23 55,28 50,25 45,28 47,23 43,20 48,20"
        fill="#facc15"
      />

      {/* Train Silhouette in Center */}
      <path
        d="M36 40 C36 34 64 34 64 40 L65 62 C65 66 61 68 50 68 C39 68 35 66 35 62 Z"
        fill="#ffffff"
      />
      {/* Train Windshield */}
      <rect x="40" y="42" width="20" height="9" rx="2" fill="#006633" />
      {/* Train Headlights */}
      <circle cx="41" cy="58" r="2.5" fill="#facc15" />
      <circle cx="59" cy="58" r="2.5" fill="#facc15" />
      <circle cx="50" cy="62" r="2" fill="#006633" />

      {/* Railroad Cowcatcher / Tracks */}
      <path
        d="M34 68 L66 68 L62 76 L38 76 Z"
        fill="#1e293b"
      />
      <line x1="38" y1="72" x2="62" y2="72" stroke="#ffffff" strokeWidth="1" />
      <line x1="44" y1="68" x2="42" y2="76" stroke="#ffffff" strokeWidth="1" />
      <line x1="50" y1="68" x2="50" y2="76" stroke="#ffffff" strokeWidth="1" />
      <line x1="56" y1="68" x2="58" y2="76" stroke="#ffffff" strokeWidth="1" />

      {/* Decorative Laurel Branches / Leaves */}
      <path
        d="M26 38 C23 48 24 64 33 74"
        stroke="#facc15"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M74 38 C77 48 76 64 67 74"
        stroke="#facc15"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
