import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// EasyPad – Sanowara Template Vector Assets
// Crisp, vector-rendered components for perfect print & high-DPI display
// ─────────────────────────────────────────────────────────────────────────────

export function CaduceusEmblem({ size = 72, color = '#1e3a8a' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 120 108" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Knob */}
      <circle cx="60" cy="12" r="7" fill={color} />
      <circle cx="60" cy="12" r="4.5" fill="#f59e0b" />
      {/* Central Staff */}
      <path d="M57.5 18H62.5V102H57.5V18Z" fill={color} />
      <rect x="58.5" y="18" width="3" height="84" fill="#d97706" />
      
      {/* Outstretched Wings */}
      <path
        d="M60 26C78 14 102 16 112 28C104 36 90 36 60 40C30 36 16 36 8 28C18 16 42 14 60 26Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M60 28C74 18 96 20 104 30C96 34 84 34 60 38C36 34 24 34 16 30C24 20 46 18 60 28Z"
        fill="#f8fafc"
        opacity="0.3"
      />
      <path
        d="M60 30C70 22 88 24 96 32C88 35 78 35 60 38C42 35 32 35 24 32C32 24 50 22 60 30Z"
        fill={color}
        opacity="0.8"
      />

      {/* Coiled Twin Serpents */}
      {/* Serpent 1 */}
      <path
        d="M60 40C74 44 80 54 60 62C40 70 46 80 60 84C74 88 70 96 60 98"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Serpent 2 */}
      <path
        d="M60 40C46 44 40 54 60 62C80 70 74 80 60 84C46 88 50 96 60 98"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Snake Heads */}
      <circle cx="53" cy="38" r="3.5" fill={color} />
      <circle cx="67" cy="38" r="3.5" fill={color} />
      <circle cx="53" cy="38" r="1.5" fill="#f59e0b" />
      <circle cx="67" cy="38" r="1.5" fill="#f59e0b" />
    </svg>
  );
}

export function PopularLogoSvg({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="14" fill="#6b1a4f" />
      {/* Medical Cross in center */}
      <path d="M42 22H58V42H78V58H58V78H42V58H22V42H42V22Z" fill="#ffffff" />
      <circle cx="50" cy="50" r="7" fill="#6b1a4f" />
      <circle cx="50" cy="50" r="3" fill="#ffffff" />
    </svg>
  );
}

export function HotlinePhoneSvg({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#fef2f2" stroke="#dc2626" strokeWidth="4" />
      <path
        d="M34 32C32 34 30 38 32 44C34 50 40 60 50 66C56 70 60 70 64 68L70 62C72 60 72 56 68 54L60 50C58 48 54 50 52 52L48 50C44 46 42 42 40 38L42 36C44 34 44 30 42 28L38 22C36 18 32 18 30 20L34 32Z"
        fill="#dc2626"
      />
    </svg>
  );
}

export function JotnoQrSvg({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
      {/* Corner marker top-left */}
      <rect x="10" y="10" width="24" height="24" fill="#1e293b" />
      <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
      <rect x="18" y="18" width="8" height="8" fill="#1e293b" />

      {/* Corner marker top-right */}
      <rect x="66" y="10" width="24" height="24" fill="#1e293b" />
      <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
      <rect x="74" y="18" width="8" height="8" fill="#1e293b" />

      {/* Corner marker bottom-left */}
      <rect x="10" y="66" width="24" height="24" fill="#1e293b" />
      <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
      <rect x="18" y="74" width="8" height="8" fill="#1e293b" />

      {/* QR data bits simulation */}
      <rect x="42" y="14" width="6" height="6" fill="#1e293b" />
      <rect x="52" y="14" width="6" height="6" fill="#1e293b" />
      <rect x="42" y="24" width="6" height="6" fill="#1e293b" />
      <rect x="46" y="34" width="8" height="8" fill="#1e293b" />
      <rect x="22" y="44" width="6" height="6" fill="#1e293b" />
      <rect x="34" y="44" width="6" height="6" fill="#1e293b" />
      <rect x="60" y="44" width="6" height="6" fill="#1e293b" />
      <rect x="72" y="44" width="6" height="6" fill="#1e293b" />
      <rect x="44" y="56" width="12" height="6" fill="#1e293b" />
      <rect x="64" y="64" width="8" height="8" fill="#1e293b" />
      <rect x="76" y="74" width="10" height="10" fill="#1e293b" />
      <rect x="44" y="76" width="8" height="8" fill="#1e293b" />
    </svg>
  );
}
