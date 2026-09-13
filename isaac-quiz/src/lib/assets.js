// Room assets: real game sprites dropped in public/sprites/room/ win, otherwise the CSS
// pixel-art fallback is used. Probed once per file, cached for the session.
import { useEffect, useState } from 'react';

export const ROOM_ASSETS = {
  floor: '/sprites/room/floor.png',
  wall: '/sprites/room/wall.png',
  doorTop: '/sprites/room/door_top.png',
  doorBottom: '/sprites/room/door_bottom.png',
  doorLeft: '/sprites/room/door_left.png',
  doorRight: '/sprites/room/door_right.png',
  altar: '/sprites/room/altar.png',
  torch: '/sprites/room/torch.png',
  heartRed: '/sprites/room/heart_red.png',
  heartHalf: '/sprites/room/heart_half.png',
  heartEmpty: '/sprites/room/heart_empty.png',
  heartSoul: '/sprites/room/heart_soul.png',
  heartBlack: '/sprites/room/heart_black.png',
};

const cache = new Map();
const listeners = new Set();

function probe(url) {
  if (cache.has(url)) return cache.get(url);
  const p = new Promise((resolve) => {
    if (typeof Image === 'undefined') return resolve(false);
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = url;
  }).then((ok) => {
    cache.set(url, ok);
    listeners.forEach((l) => l());
    return ok;
  });
  cache.set(url, p);
  return p;
}

/** true when the asset exists, false otherwise (false while probing). */
export function useAsset(url) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    probe(url);
    return () => listeners.delete(l);
  }, [url]);
  const v = cache.get(url);
  return v === true;
}

export const itemSprite = (id) => `/sprites/items/${String(id).padStart(3, '0')}.png`;
