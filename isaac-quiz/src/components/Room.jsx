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

function Door({ position }) {
  const isVertical = position === 'top' || position === 'bottom';
  const style = {
    position: 'absolute',
    zIndex: 2,
    ...(position === 'top' && { top: 0, left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'bottom' && { bottom: 0, left: '50%', transform: 'translateX(-50%) scaleY(-1)' }),
    ...(position === 'left' && { left: 0, top: '50%', transform: 'translateY(-50%) rotate(90deg)' }),
    ...(position === 'right' && { right: 0, top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }),
  };

  return (
    <div style={style}>
      <img
        src="/assets/door.png"
        alt=""
        style={{
          width: isVertical ? 64 : 48,
          height: isVertical ? 40 : 32,
          imageRendering: 'pixelated',
          display: 'block',
        }}
        draggable={false}
      />
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
        {/* Background walls using game sprite */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#1a1410',
        }}>
          {/* Top-left corner (original orientation) */}
          <img src="/assets/basement_bg.png" alt="" style={{
            position: 'absolute', top: 0, left: 0,
            imageRendering: 'pixelated',
            width: '50%', height: 'auto',
          }} draggable={false} />
          {/* Top-right corner (flipped horizontally) */}
          <img src="/assets/basement_bg.png" alt="" style={{
            position: 'absolute', top: 0, right: 0,
            imageRendering: 'pixelated',
            width: '50%', height: 'auto',
            transform: 'scaleX(-1)',
          }} draggable={false} />
          {/* Bottom-left corner (flipped vertically) */}
          <img src="/assets/basement_bg.png" alt="" style={{
            position: 'absolute', bottom: 0, left: 0,
            imageRendering: 'pixelated',
            width: '50%', height: 'auto',
            transform: 'scaleY(-1)',
          }} draggable={false} />
          {/* Bottom-right corner (flipped both) */}
          <img src="/assets/basement_bg.png" alt="" style={{
            position: 'absolute', bottom: 0, right: 0,
            imageRendering: 'pixelated',
            width: '50%', height: 'auto',
            transform: 'scale(-1, -1)',
          }} draggable={false} />
        </div>

        {/* Floor tiles */}
        <div style={{
          position: 'absolute',
          top: 32,
          left: 32,
          right: 32,
          bottom: 32,
          backgroundImage: 'url(/assets/basement_floor.png)',
          backgroundSize: '128px 128px',
          backgroundRepeat: 'repeat',
          imageRendering: 'pixelated',
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
