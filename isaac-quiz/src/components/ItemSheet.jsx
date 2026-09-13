import React from 'react';
import { itemSprite } from '../lib/assets.js';
import { POOL_LABELS, statLine } from '../engine/items.js';

/** Platinum God card: what the player reads after answering, for every shown item. */
export default function ItemSheet({ item, tags }) {
  if (!item) return null;
  const stars = '★'.repeat(item.quality ?? 0) + '☆'.repeat(4 - (item.quality ?? 0));
  const pools = item.pools.map((p) => POOL_LABELS[p] || p).join(', ') || item.poolsRaw || '—';
  const line = statLine(item);
  return (
    <div className="item-sheet">
      <div className="item-sheet__head">
        <img src={itemSprite(item.id)} alt="" draggable={false} />
        <div>
          <div className="item-sheet__name">{item.name}</div>
          <div className="item-sheet__pickup">« {item.pickup} »</div>
        </div>
      </div>
      <div className="item-sheet__meta">
        <span>Qualité <span className="quality">{stars}</span> ({item.quality})</span>
        <span>{item.type === 'active' ? `Actif · ${item.recharge || '?'}` : 'Passif'}</span>
        <span>Pool : {pools}</span>
      </div>
      {line && <div className="item-sheet__stats">{line}</div>}
      <div className="item-sheet__desc">{item.description}</div>
      {item.unlock && <div className="item-sheet__unlock">Unlock : {item.unlock}</div>}
      {tags && item.tags?.length > 0 && (
        <div className="tagline">
          {item.tags.map((t) => <span key={t} className="tag">{tags[t]?.label || t}</span>)}
        </div>
      )}
    </div>
  );
}
