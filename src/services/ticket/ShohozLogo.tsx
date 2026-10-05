import React from 'react';

export function ShohozLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: "'Roboto', Arial, sans-serif",
        lineHeight: 1.15,
        userSelect: 'none',
        ...style
      }}
    >
      <span style={{ fontSize: '6.5pt', color: '#4b5563', fontWeight: 500, lineHeight: 1, position: 'static', height: 'auto' }}>
        Powered by
      </span>
      <span style={{ fontSize: '9pt', color: '#005d8f', fontWeight: 700, lineHeight: 1.1, position: 'static', height: 'auto' }}>
        Shohoz
      </span>
      <span style={{ fontSize: '8pt', color: '#334155', fontWeight: 600, lineHeight: 1.1, position: 'static', height: 'auto' }}>
        Synesis
      </span>
      <span style={{ fontSize: '8pt', color: '#039d48', fontWeight: 700, lineHeight: 1.1, position: 'static', height: 'auto' }}>
        Vincen <span style={{ color: '#16a34a', fontWeight: 900 }}>JV</span>
      </span>
    </div>
  );
}
