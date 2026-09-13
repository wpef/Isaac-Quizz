#!/usr/bin/env node
// Generate the PWA icons (pixel-art heart on a pedestal) without any image dependency.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const OUT = path.join(ROOT, 'public/icons');

// 16x16 palette-indexed pixel art.
const P = {
  '.': [18, 14, 11, 255], // background
  'r': [224, 38, 42, 255], // heart red
  'h': [255, 138, 138, 255], // heart highlight
  'd': [120, 16, 20, 255], // heart shadow
  's': [143, 134, 122, 255], // stone light
  't': [106, 98, 89, 255], // stone
  'u': [77, 70, 63, 255], // stone dark
  'k': [0, 0, 0, 255], // outline
};
const ART = [
  '................',
  '....kkk..kkk....',
  '...krhhk.krrk...',
  '..krrhhrkrrrrk..',
  '..krrrrrrrrrrk..',
  '..krrrrrrrrrrk..',
  '...krrrrrrrrk...',
  '....krrrrrrk....',
  '.....krrrrk.....',
  '......krrk......',
  '.......kk.......',
  '.....kssssk.....',
  '....kttttttk....',
  '...kuuuuuuuuk...',
  '..ksssssssssskk.',
  '..kuuuuuuuuuuuk.',
];

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixelAt) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelAt(x, y);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function render(size, { padding = 0 } = {}) {
  const inner = size - padding * 2;
  const scale = inner / 16;
  return png(size, (x, y) => {
    const ix = Math.floor((x - padding) / scale);
    const iy = Math.floor((y - padding) / scale);
    if (ix < 0 || iy < 0 || ix > 15 || iy > 15) return P['.'];
    return P[ART[iy][ix]] || P['.'];
  });
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'icon-192.png'), render(192));
fs.writeFileSync(path.join(OUT, 'icon-512.png'), render(512));
fs.writeFileSync(path.join(OUT, 'icon-512-maskable.png'), render(512, { padding: 64 }));
console.log('icons written to public/icons');
