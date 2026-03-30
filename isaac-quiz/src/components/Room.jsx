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
      top: '18%',
      zIndex: 2,
    }}>
      <img
        src="/assets/fireplace.png"
        alt=""
        style={{
          width: 48,
          height: 48,
          imageRendering: 'pixelated',
          animation: 'flicker 0.4s ease-in-out infinite alternate',
        }}
        draggable={false}
      />
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 12,
        width: 24,
        height: 24,
        borderRadius: '50%',
        animation: 'torchGlow 1.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
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
        overflow: 'hidden',
      }}>
        {/* Full room background image */}
        <img
          src="/assets/room_bg.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />

        {/* Torches */}
        <Torch left />
        <Torch />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 3,
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
