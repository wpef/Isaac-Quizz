import React from 'react';

const heartStyle = {
  display: 'inline-block',
  width: 24,
  height: 24,
  margin: '0 2px',
};

export default function Hearts({ count, score, streak }) {
  const hearts = [];
  for (let i = 0; i < 6; i++) {
    hearts.push(
      <span key={i} style={{ ...heartStyle, opacity: i < count ? 1 : 0.25 }}>
        <svg viewBox="0 0 16 16" width="24" height="24">
          <path
            d="M2 2h2v1h1v1h2V3h1V2h2V1h3v1h1v2h-1v2h-1v2h-1v1H9v1H8v1H7v1H6v-1H5v-1H4V9H3V8H2V6H1V3h1V2z"
            fill={i < count ? '#d00' : '#444'}
          />
          <path
            d="M3 2h1v1h1v1H3V2zm6 0h1v1h1v1H9V2z"
            fill={i < count ? '#f66' : '#555'}
          />
        </svg>
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'rgba(0,0,0,0.6)',
      borderBottom: '2px solid #333',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{hearts}</div>
      <div style={{ display: 'flex', gap: 24, fontSize: 10 }}>
        <span>SCORE: {score}</span>
        <span>STREAK: {streak}</span>
      </div>
    </div>
  );
}
