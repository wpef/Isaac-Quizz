import React from 'react';
import { ROOM_ASSETS, useAsset, itemSprite } from '../lib/assets.js';

const HEART_PATH = 'M2 3h2V2h3v1h2V2h3v1h2v3h-1v2h-1v2h-1v2h-1v1h-1v1H7v-1H6v-1H5v-2H4V8H3V6H2V3z';

function Heart({ kind }) {
  const assetKey = { full: 'heartRed', half: 'heartHalf', empty: 'heartEmpty', soul: 'heartSoul', black: 'heartBlack' }[kind];
  const has = useAsset(ROOM_ASSETS[assetKey]);
  if (has) return <img className="heart" src={ROOM_ASSETS[assetKey]} alt="" draggable={false} />;
  const fill = { full: '#e0262a', half: '#e0262a', empty: '#3a2a2a', soul: '#7cc6ff', black: '#2c2a3a' }[kind];
  const hi = { full: '#ff8a8a', half: '#ff8a8a', empty: '#4a3838', soul: '#d6efff', black: '#5a5670' }[kind];
  return (
    <svg className="heart" viewBox="0 0 16 16" aria-hidden="true">
      <path d={HEART_PATH} fill="#000" transform="translate(0.5,0.5)" />
      {kind === 'half' ? (
        <>
          <path d={HEART_PATH} fill="#3a2a2a" />
          <clipPath id="halfClip"><rect x="0" y="0" width="8" height="16" /></clipPath>
          <path d={HEART_PATH} fill={fill} clipPath="url(#halfClip)" />
        </>
      ) : (
        <path d={HEART_PATH} fill={fill} />
      )}
      <rect x="3" y="3" width="2" height="1" fill={hi} />
      <rect x="3" y="4" width="1" height="1" fill={hi} />
    </svg>
  );
}

function hearts(hp) {
  const list = [];
  const max = hp?.max ?? 3;
  const red = hp?.red ?? max;
  for (let i = 0; i < max; i++) {
    const left = red - i;
    list.push(left >= 1 ? 'full' : left >= 0.5 ? 'half' : 'empty');
  }
  for (let i = 0; i < (hp?.soul ?? 0); i++) list.push('soul');
  for (let i = 0; i < (hp?.black ?? 0); i++) list.push('black');
  return list;
}

export default function Hud({ hp, score, streak, bestStreak, floor, progress, heldItem, difficulty }) {
  return (
    <div className="hud">
      <div>
        <div className="hud__hearts" aria-label="Vie">
          {hearts(hp).map((k, i) => <Heart key={i} kind={k} />)}
        </div>
        {floor && <div className="hud__floor">{floor}</div>}
        {heldItem && (
          <div className="hud__held">
            <img src={itemSprite(heldItem.id)} alt="" draggable={false} />
            <span>{heldItem.name}</span>
          </div>
        )}
      </div>
      <div className="hud__side">
        <div className="hud__row">
          <span>SCORE {score}</span>
          {progress && <span>{progress}</span>}
        </div>
        <div className="hud__row">
          <span className={streak >= 3 ? 'hud__streak--hot' : ''}>STREAK {streak}</span>
          <span className="hud__floor">BEST {bestStreak}</span>
        </div>
        {difficulty && <div className="hud__floor">{difficulty.toUpperCase()}</div>}
      </div>
    </div>
  );
}
