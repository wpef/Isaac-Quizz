import React from 'react';

const torchKeyframes = `
@keyframes flicker {
  0%, 100% { opacity: 1; transform: scaleY(1); }
  25% { opacity: 0.85; transform: scaleY(0.95); }
  50% { opacity: 0.95; transform: scaleY(1.05); }
  75% { opacity: 0.8; transform: scaleY(0.9); }
}
@keyframes torchGlow {
  0%, 100% { box-shadow: 0 0 20px 10px rgba(255,150,30,0.3); }
  50% { box-shadow: 0 0 30px 15px rgba(255,150,30,0.5); }
}
`;

function Torch({ left }) {
  return (
    <div style={{
      position: 'absolute',
      left: left ? 40 : undefined,
      right: left ? undefined : 40,
      top: '20%',
    }}>
      {/* Bracket */}
      <svg width="20" height="40" viewBox="0 0 20 40">
        <rect x="8" y="16" width="4" height="24" fill="#666" />
        <rect x="4" y="12" width="12" height="6" fill="#777" />
      </svg>
      {/* Flame */}
      <div style={{
        position: 'absolute',
        top: -4,
        left: 2,
        width: 16,
        height: 20,
        background: 'radial-gradient(ellipse at center, #ff6 0%, #f80 50%, transparent 70%)',
        borderRadius: '50% 50% 30% 30%',
        animation: 'flicker 0.4s ease-in-out infinite alternate',
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 4,
        width: 12,
        height: 12,
        borderRadius: '50%',
        animation: 'torchGlow 1.5s ease-in-out infinite',
      }} />
    </div>
  );
}

function Door({ position }) {
  const isVertical = position === 'top' || position === 'bottom';
  const style = {
    position: 'absolute',
    ...(position === 'top' && { top: 0, left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'bottom' && { bottom: 0, left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'left' && { left: 0, top: '50%', transform: 'translateY(-50%)' }),
    ...(position === 'right' && { right: 0, top: '50%', transform: 'translateY(-50%)' }),
  };

  return (
    <div style={style}>
      <svg
        width={isVertical ? 60 : 30}
        height={isVertical ? 30 : 60}
        viewBox={isVertical ? '0 0 60 30' : '0 0 30 60'}
      >
        {isVertical ? (
          <>
            <rect x="0" y="0" width="60" height="30" fill="#2a2a2a" />
            <rect x="8" y={position === 'top' ? 0 : 6} width="44" height="24" fill="#1a1a1a" />
            <rect x="12" y={position === 'top' ? 0 : 10} width="36" height="16" fill="#111" />
          </>
        ) : (
          <>
            <rect x="0" y="0" width="30" height="60" fill="#2a2a2a" />
            <rect x={position === 'left' ? 0 : 6} y="8" width="24" height="44" fill="#1a1a1a" />
            <rect x={position === 'left' ? 0 : 10} y="12" width="16" height="36" fill="#111" />
          </>
        )}
      </svg>
    </div>
  );
}

export default function Room({ children }) {
  return (
    <>
      <style>{torchKeyframes}</style>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#1a1410',
        overflow: 'hidden',
      }}>
        {/* Tile floor */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        {/* Walls */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 32,
          background: 'linear-gradient(180deg, #2a2018 0%, #1a1410 100%)',
          borderBottom: '3px solid #3a2a18',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 32,
          background: 'linear-gradient(0deg, #2a2018 0%, #1a1410 100%)',
          borderTop: '3px solid #3a2a18',
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: 32,
          background: 'linear-gradient(90deg, #2a2018 0%, #1a1410 100%)',
          borderRight: '3px solid #3a2a18',
        }} />
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: 32,
          background: 'linear-gradient(270deg, #2a2018 0%, #1a1410 100%)',
          borderLeft: '3px solid #3a2a18',
        }} />

        {/* Torches */}
        <Torch left />
        <Torch />

        {/* Doors */}
        <Door position="top" />
        <Door position="bottom" />
        <Door position="left" />
        <Door position="right" />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {children}
        </div>
      </div>
    </>
  );
}
