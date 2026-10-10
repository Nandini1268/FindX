import React from 'react';

export default function FindXLogo({ size = 'md', showText = true, style = {} }) {
  const heights = { sm: 28, md: 36, lg: 48 };
  const h = heights[size] || 36;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', ...style }}>
      <svg
        height={h}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0px 4px 10px rgba(236,72,153,0.25))' }}
      >
        <defs>
          <linearGradient id="findx-grad-1" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="findx-grad-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Head dot for the human figure */}
        <circle cx="80" cy="22" r="14" fill="url(#findx-grad-1)" />

        {/* Outer stylized X loop */}
        <path
          d="M 45,130 C 25,100 35,55 70,45 C 95,38 125,55 135,80 C 145,105 135,130 110,135 C 95,138 75,125 65,110 L 125,45"
          stroke="url(#findx-grad-1)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Magnifying Glass Overlay */}
        <circle cx="92" cy="88" r="18" stroke="#ffffff" strokeWidth="6" fill="none" />
        <circle cx="92" cy="88" r="18" stroke="url(#findx-grad-1)" strokeWidth="6" fill="none" />
        <line x1="105" y1="101" x2="122" y2="118" stroke="url(#findx-grad-1)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="92" cy="88" r="6" fill="none" stroke="url(#findx-grad-1)" strokeWidth="3" />
      </svg>

      {showText && (
        <span style={{
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          fontWeight: 900,
          fontSize: size === 'sm' ? '1.15rem' : size === 'lg' ? '1.85rem' : '1.45rem',
          letterSpacing: '-0.02em',
          color: '#1e1b4b',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'baseline'
        }}>
          FIND
          <span style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            marginLeft: '1px'
          }}>
            X
          </span>
          <span style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#ec4899',
            display: 'inline-block',
            marginLeft: '2px',
            alignSelf: 'flex-end',
            marginBottom: '3px'
          }} />
        </span>
      )}
    </div>
  );
}
