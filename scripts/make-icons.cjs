const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateIconPNG(size, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowLen = 1 + size * 4;
  const raw = Buffer.alloc(rowLen * size);

  const cx = size / 2;
  const cy = size / 2;
  const cornerRadius = isMaskable ? 0 : size * 0.22;

  // Background deep forest emerald #064E3B -> #0B3327
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLen;
    raw[rowStart] = 0; // Filter none
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;

      // Rounded rect check if not maskable
      let inside = true;
      if (!isMaskable) {
        const dx = Math.abs(x - cx) - (size / 2 - cornerRadius);
        const dy = Math.abs(y - cy) - (size / 2 - cornerRadius);
        if (dx > 0 && dy > 0) {
          inside = Math.hypot(dx, dy) <= cornerRadius;
        }
      }

      if (!inside) {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
        continue;
      }

      // Deep emerald gradient background
      const ny = y / size;
      let bgR = Math.round(11 + ny * 6);
      let bgG = Math.round(51 - ny * 12);
      let bgB = Math.round(39 - ny * 14);

      // Distances for Islamic geometric circle and book
      const nx = (x - cx) / (size * 0.4);
      const nyrel = (y - cy) / (size * 0.4);
      const distFromCenter = Math.hypot(nx, nyrel);

      // Gold Crescent Moon
      const c1 = Math.hypot(nx - 0.15, nyrel + 0.35);
      const c2 = Math.hypot(nx - 0.3, nyrel + 0.25);
      const isCrescent = (c1 <= 0.65 && c2 >= 0.52);

      // Open Quran book shape
      const inLeftBook = (nx >= -0.75 && nx <= -0.05 && nyrel >= 0.1 && nyrel <= 0.55);
      const inRightBook = (nx >= 0.05 && nx <= 0.75 && nyrel >= 0.1 && nyrel <= 0.55);

      // Outer accent gold ring
      const isRing = distFromCenter >= 0.88 && distFromCenter <= 0.94;

      if (isRing) {
        // Gold / Mint ring
        raw[px] = 245;
        raw[px + 1] = 158;
        raw[px + 2] = 11;
        raw[px + 3] = 220;
      } else if (isCrescent) {
        // Glowing gold crescent
        raw[px] = 253;
        raw[px + 1] = 230;
        raw[px + 2] = 138;
        raw[px + 3] = 255;
      } else if (inLeftBook || inRightBook) {
        // Luminous mint pages
        if (inLeftBook) {
          raw[px] = 90;
          raw[px + 1] = 216;
          raw[px + 2] = 181;
          raw[px + 3] = 255;
        } else {
          raw[px] = 226;
          raw[px + 1] = 251;
          raw[px + 2] = 239;
          raw[px + 3] = 255;
        }
      } else {
        raw[px] = bgR;
        raw[px + 1] = bgG;
        raw[px + 2] = bgB;
        raw[px + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'icon-192.png'), generateIconPNG(192, false));
fs.writeFileSync(path.join(pubDir, 'icon-512.png'), generateIconPNG(512, false));
fs.writeFileSync(path.join(pubDir, 'icon-maskable-512.png'), generateIconPNG(512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), generateIconPNG(180, false));

console.log('Generated PWA icon PNGs successfully!');
