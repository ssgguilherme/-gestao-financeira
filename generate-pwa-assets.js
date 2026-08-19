import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');
const screenshotsDir = path.join(publicDir, 'screenshots');

[publicDir, iconsDir, screenshotsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// CRC32 Table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function calcCRC32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = calcCRC32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generatePNG(width, height, drawFn) {
  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * lineSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineSize;
    rawData[rowOffset] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Draw Finance Icon
function drawFinanceIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxRadius = w / 2;

  // Background
  if (isMaskable) {
    // Solid background edge to edge for maskable
    if (dist < maxRadius * 0.75) {
      // Emerald Icon shape
      return [16, 185, 129, 255]; // Emerald #10b981
    }
    return [15, 23, 42, 255]; // Dark Slate #0f172a
  }

  // Rounded squircle container
  const padding = w * 0.08;
  const size = w - padding * 2;
  const cornerRadius = size * 0.28;

  const nx = x - padding;
  const ny = y - padding;

  if (nx >= 0 && nx <= size && ny >= 0 && ny <= size) {
    // Check corner roundedness
    const rx = nx < cornerRadius ? nx - cornerRadius : nx > size - cornerRadius ? nx - (size - cornerRadius) : 0;
    const ry = ny < cornerRadius ? ny - cornerRadius : ny > size - cornerRadius ? ny - (size - cornerRadius) : 0;

    if (rx * rx + ry * ry <= cornerRadius * cornerRadius) {
      // Inside icon rounded rect
      const normY = ny / size;
      // Emerald gradient
      const gVal = Math.floor(211 - normY * 60);
      const bVal = Math.floor(129 - normY * 30);

      // Diamond / Shield center symbol check
      const relX = Math.abs(x - cx) / (w * 0.28);
      const relY = Math.abs(y - cy) / (h * 0.28);

      if (relX + relY <= 1.0) {
        // Gold/White emblem
        return [255, 255, 255, 255];
      }

      return [16, gVal, bVal, 255];
    }
  }

  return [0, 0, 0, 0]; // Transparent background
}

// Draw Screenshot mock
function drawScreenshot(x, y, w, h) {
  const normY = y / h;
  const normX = x / w;

  // Header bar
  if (normY < 0.12) {
    return [15, 23, 42, 255]; // #0f172a
  }

  // Emerald accents
  if (normY > 0.15 && normY < 0.35 && normX > 0.1 && normX < 0.9) {
    return [16, 185, 129, 255];
  }

  return [30, 41, 59, 255]; // Slate card
}

console.log('Generating PWA Icons...');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

sizes.forEach((s) => {
  const fileName = s === 180 ? 'apple-touch-icon.png' : `icon-${s}.png`;
  const filePath = path.join(iconsDir, fileName);
  const buf = generatePNG(s, s, (x, y, w, h) => drawFinanceIcon(x, y, w, h, false));
  fs.writeFileSync(filePath, buf);
  console.log(`Saved ${fileName}`);
});

// Maskable 512
const maskablePath = path.join(iconsDir, 'maskable-512.png');
const maskableBuf = generatePNG(512, 512, (x, y, w, h) => drawFinanceIcon(x, y, w, h, true));
fs.writeFileSync(maskablePath, maskableBuf);
console.log('Saved maskable-512.png');

// Screenshots
const shotDesktop = generatePNG(640, 360, (x, y, w, h) => drawScreenshot(x, y, w, h));
fs.writeFileSync(path.join(screenshotsDir, 'dashboard-desktop.png'), shotDesktop);

const shotMobile = generatePNG(360, 640, (x, y, w, h) => drawScreenshot(x, y, w, h));
fs.writeFileSync(path.join(screenshotsDir, 'dashboard-mobile.png'), shotMobile);

console.log('All PWA assets generated successfully!');
