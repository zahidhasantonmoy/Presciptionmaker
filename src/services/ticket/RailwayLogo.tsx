import React from 'react';

export function RailwayLogo({ size = 74 }: { size?: number }) {
  return (
    <img
      src="/20428_4-78474535-icon.png"
      alt="Bangladesh Railway Emblem"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0
      }}
    />
  );
}
