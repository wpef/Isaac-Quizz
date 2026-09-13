import React from 'react';
import { ROOM_ASSETS, useAsset } from '../lib/assets.js';

function Door({ side }) {
  const key = `door${side[0].toUpperCase()}${side.slice(1)}`;
  const has = useAsset(ROOM_ASSETS[key]);
  return (
    <div className={`door door--${side}`} aria-hidden="true">
      {has && <img src={ROOM_ASSETS[key]} alt="" draggable={false} />}
    </div>
  );
}

function Torch({ side }) {
  const has = useAsset(ROOM_ASSETS.torch);
  return (
    <div className={`torch torch--${side}`} aria-hidden="true">
      <div className="torch__glow" />
      {has ? (
        <img src={ROOM_ASSETS.torch} alt="" draggable={false} style={{ width: 14, height: 22 }} />
      ) : (
        <>
          <div className="torch__stick" />
          <div className="torch__flame" />
        </>
      )}
    </div>
  );
}

/** Full-screen Basement item room. `roomKey` changes trigger the door-transition slide. */
export default function Room({ children, roomKey = 0, leaving = false }) {
  const hasFloor = useAsset(ROOM_ASSETS.floor);
  const hasWall = useAsset(ROOM_ASSETS.wall);
  const wallClass = `room__wall${hasWall ? ' room__wall--img' : ''}`;
  const wallStyle = hasWall ? { '--wall-img': `url(${ROOM_ASSETS.wall})` } : undefined;
  return (
    <div className="room">
      <div
        className={`room__floor${hasFloor ? ' room__floor--img' : ''}`}
        style={hasFloor ? { '--floor-img': `url(${ROOM_ASSETS.floor})` } : undefined}
      />
      <div className={`${wallClass} room__wall--top`} style={wallStyle} />
      <div className={`${wallClass} room__wall--bottom`} style={wallStyle} />
      <div className={`${wallClass} room__wall--left`} style={wallStyle} />
      <div className={`${wallClass} room__wall--right`} style={wallStyle} />
      <Door side="top" />
      <Door side="bottom" />
      <Door side="left" />
      <Door side="right" />
      <Torch side="left" />
      <Torch side="right" />
      <div key={roomKey} className={`room__content${leaving ? ' room__content--leaving' : ''}`}>
        {children}
      </div>
    </div>
  );
}
