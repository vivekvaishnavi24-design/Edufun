import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(2, 9); // color type 2 (Truecolor RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines (width * 3 bytes per pixel + 1 filter byte per line)
  const rawData = Buffer.alloc(height * (width * 3 + 1));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, pos++); // Filter type 0: None
    const gradientRatio = y / height;
    const curR = Math.floor(r * (1 - gradientRatio * 0.4));
    const curG = Math.floor(g * (1 - gradientRatio * 0.3));
    const curB = Math.floor(Math.min(255, b + gradientRatio * 40));

    for (let x = 0; x < width; x++) {
      // Draw a subtle cap in the center
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.45 && Math.abs(dy * 2 + dx * 0.5) < 0.5) {
        // Center cap emblem (white)
        rawData.writeUInt8(255, pos++);
        rawData.writeUInt8(255, pos++);
        rawData.writeUInt8(255, pos++);
      } else {
        rawData.writeUInt8(curR, pos++);
        rawData.writeUInt8(curG, pos++);
        rawData.writeUInt8(curB, pos++);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

// Standard CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate PNG assets in public
const p192 = createPng(192, 192, 79, 70, 229);
fs.writeFileSync('public/pwa-192x192.png', p192);

const p512 = createPng(512, 512, 79, 70, 229);
fs.writeFileSync('public/pwa-512x512.png', p512);
fs.writeFileSync('public/pwa-maskable-512x512.png', p512);
fs.writeFileSync('public/apple-touch-icon.png', p192);

console.log('PNG PWA icons created successfully');
