import React, { useState } from 'react';

const BASE = 'https://raw.githubusercontent.com/Heidar-An/Binding-Of-Isaac-Item-Dataset/main';

function getImageUrl(item) {
  const folder = item.imgFolder || 'passive';
  const imgName = item.img || item.name.replace(/'/g, '');
  return `${BASE}/${folder}-collectible-icons/${encodeURIComponent(imgName)}/${encodeURIComponent(imgName)}_0.png`;
}

export default function Pedestal({ item, onClick, disabled, result, hideLabel }) {
  const [imgError, setImgError] = useState(false);
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
        {imgError ? (
          <div style={{
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#333',
            border: '2px solid #555',
            borderRadius: 4,
            fontSize: 24,
            color: '#e0d5c0',
          }}>
            ?
          </div>
        ) : (
          <img
            src={getImageUrl(item)}
            alt={hideLabel ? '???' : item.name}
            onError={() => setImgError(true)}
            style={{
              width: 64,
              height: 64,
              imageRendering: 'pixelated',
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Pedestal sprite */}
      <img
        src="/assets/pedestal.png"
        alt=""
        style={{
          width: 64,
          height: 32,
          imageRendering: 'pixelated',
        }}
        draggable={false}
      />

      {/* Item name - hidden for ICON_QUIZ until answered */}
      <div style={{
        marginTop: 8,
        fontSize: 8,
        textAlign: 'center',
        maxWidth: 100,
        lineHeight: 1.4,
        color: isCorrect ? '#0f0' : isWrong ? '#f00' : '#ccc',
        visibility: hideLabel ? 'hidden' : 'visible',
      }}>
        {item.name}
      </div>
    </div>
  );
}
