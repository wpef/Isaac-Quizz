import React from 'react';
import { ROOM_ASSETS, useAsset, itemSprite } from '../lib/assets.js';

function Altar() {
  const has = useAsset(ROOM_ASSETS.altar);
  if (has) return <img className="pedestal__altar" src={ROOM_ASSETS.altar} alt="" draggable={false} />;
  // Item room pedestal: stone slab with two steps.
  return (
    <svg className="pedestal__altar" viewBox="0 0 92 46" aria-hidden="true">
      <rect x="24" y="4" width="44" height="6" fill="#a39a8c" />
      <rect x="22" y="9" width="48" height="4" fill="#7d7468" />
      <rect x="26" y="13" width="40" height="14" fill="#6a6259" />
      <rect x="26" y="13" width="40" height="2" fill="#8a8175" />
      <rect x="30" y="18" width="6" height="2" fill="#4d463f" />
      <rect x="52" y="22" width="8" height="2" fill="#4d463f" />
      <rect x="16" y="27" width="60" height="6" fill="#8f867a" />
      <rect x="16" y="33" width="60" height="4" fill="#5e574d" />
      <rect x="6" y="37" width="80" height="5" fill="#7d7468" />
      <rect x="6" y="42" width="80" height="4" fill="#4d463f" />
      <rect x="2" y="44" width="88" height="2" fill="#2b2622" />
    </svg>
  );
}

/**
 * state: 'idle' | 'correct' | 'wrong' | 'dim' ; picked: the player clicked this one.
 * Names are only rendered once `revealed` is true.
 */
function Price({ price }) {
  if (price === undefined || price === null) return null;
  if (price === 0) return <div className="pedestal__price pedestal__price--free">gratuit</div>;
  return (
    <div className="pedestal__price" aria-label={`${price} cœur${price > 1 ? 's' : ''}`}>
      {Array.from({ length: price }, (_, i) => <span key={i}>♥</span>)}
    </div>
  );
}

export default function Pedestal({ item, onClick, state = 'idle', picked = false, revealed = false, clickable = false, price }) {
  const cls = ['pedestal'];
  if (clickable) cls.push('pedestal--clickable');
  if (state === 'correct') cls.push('pedestal--correct');
  if (state === 'wrong') cls.push('pedestal--wrong');
  if (state === 'dim') cls.push('pedestal--dim');
  if (picked) cls.push('pedestal--picked');
  if (revealed) cls.push('pedestal--revealed');
  return (
    <button
      type="button"
      className={cls.join(' ')}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      aria-label={revealed ? item.name : 'Item mystère'}
    >
      <div className="pedestal__item">
        <div className="pedestal__glow" />
        <img src={itemSprite(item.id)} alt="" draggable={false} />
      </div>
      <Altar />
      <Price price={price} />
      <div className="pedestal__name">{item.name}</div>
    </button>
  );
}
