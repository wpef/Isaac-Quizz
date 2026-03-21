import React from 'react';

function getImageUrl(id) {
  const padded = String(id).padStart(3, '0');
  return `https://raw.githubusercontent.com/wofsauge/IsaacDocs/main/docs/images/items/collectibles/collectibles_${padded}.png`;
}

export default function Pedestal({ item, onClick, disabled, result }) {
  const isCorrect = result === 'correct';
  const isWrong = result === 'wrong';

  let glowColor = 'transparent';
  if (isCorrect) glowColor = '#0f0';
  if (isWrong) glowColor = '#f00';

  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'transform 0.15s',
        transform: disabled ? 'none' : undefined,
        filter: disabled && !result ? 'brightness(0.5)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Item image with glow */}
      <div style={{
        width: 64,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderRadius: 4,
        boxShadow: `0 0 16px ${glowColor}`,
        transition: 'box-shadow 0.3s',
        imageRendering: 'pixelated',
      }}>
        <img
          src={getImageUrl(item.id)}
          alt={item.name}
          style={{
            width: 64,
            height: 64,
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />
      </div>

      {/* Pedestal SVG */}
      <svg width="80" height="40" viewBox="0 0 80 40">
        <rect x="16" y="0" width="48" height="4" fill="#8b7355" />
        <rect x="12" y="4" width="56" height="4" fill="#a08060" />
        <rect x="8" y="8" width="64" height="24" fill="#6b5335" />
        <rect x="12" y="8" width="56" height="2" fill="#9b8365" />
        <rect x="4" y="32" width="72" height="4" fill="#a08060" />
        <rect x="0" y="36" width="80" height="4" fill="#8b7355" />
      </svg>

      {/* Item name */}
      <div style={{
        marginTop: 8,
        fontSize: 8,
        textAlign: 'center',
        maxWidth: 100,
        lineHeight: 1.4,
        color: isCorrect ? '#0f0' : isWrong ? '#f00' : '#ccc',
      }}>
        {item.name}
      </div>
    </div>
  );
}
