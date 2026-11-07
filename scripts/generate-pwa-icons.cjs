const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, pixelFn) {
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((1 + rowBytes) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowBytes);
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedIDAT = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedIDAT);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Helper math for smooth antialiasing
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Rounded box SDF
function sdRoundedBox(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  return Math.min(Math.max(qx, qy), 0.0) + Math.hypot(Math.max(qx, 0.0), Math.max(qy, 0.0)) - r;
}

// 4-point sparkle star SDF
function sdSparkle(px, py, size) {
  const x = Math.abs(px) / size;
  const y = Math.abs(py) / size;
  if (x > 1 || y > 1) return 1.0;
  // Astroid curve x^(2/3) + y^(2/3) <= 1
  const astroid = Math.pow(x, 0.7) + Math.pow(y, 0.7);
  return (astroid - 0.7) * size;
}

function renderFinanFlowIcon(x, y, size, isMaskable = false) {
  // Normalize coordinates -1 to 1 centered at 0,0
  const nx = (x / size) * 2 - 1;
  const ny = (y / size) * 2 - 1;

  // Background base: sleek deep slate
  let bgR = 11, bgG = 18, bgB = 32; // #0b1220
  let bgA = 255;

  // Outer container:
  // For maskable icon: full-bleed background without rounded corners
  // For standard icon: subtle squircle / rounded card
  if (!isMaskable) {
    const cardD = sdRoundedBox(nx, ny, 0.88, 0.88, 0.30);
    const cardAlpha = 1.0 - smoothstep(-0.015, 0.015, cardD);
    if (cardAlpha <= 0) return [0, 0, 0, 0];
    bgA = Math.round(cardAlpha * 255);
  }

  // Radial ambient emerald glow in center
  const centerDist = Math.hypot(nx, ny);
  const glow = Math.exp(-centerDist * 1.8) * 0.45;
  let r = Math.round(bgR + 16 * glow);
  let g = Math.round(bgG + 185 * glow);
  let b = Math.round(bgB + 129 * glow);

  // Scale emblem down slightly if maskable for safe zone padding
  const emblemScale = isMaskable ? 0.72 : 0.85;
  const ex = nx / emblemScale;
  const ey = ny / emblemScale;

  // Diamond/Shield Badge (tilted rounded square)
  // Rotate by 45 degrees
  const angle = Math.PI / 4;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const rx = ex * cosA - ey * sinA;
  const ry = ex * sinA + ey * cosA;

  const diamondD = sdRoundedBox(rx, ry, 0.46, 0.46, 0.16);
  const diamondAlpha = 1.0 - smoothstep(-0.02, 0.02, diamondD);

  if (diamondAlpha > 0) {
    // Gradient from vibrant emerald (#10b981) to bright teal/cyan (#06b6d4)
    const tGrad = (ey + 0.5); // vertical gradient
    const dR = Math.round(16 + (6 - 16) * clamp(tGrad, 0, 1));
    const dG = Math.round(185 + (182 - 185) * clamp(tGrad, 0, 1));
    const dB = Math.round(129 + (212 - 129) * clamp(tGrad, 0, 1));

    // Outer border of diamond
    const borderD = Math.abs(diamondD);
    const borderGlow = (1.0 - smoothstep(0.0, 0.04, borderD)) * 0.4;

    r = Math.round(r * (1 - diamondAlpha) + (dR + borderGlow * 255) * diamondAlpha);
    g = Math.round(g * (1 - diamondAlpha) + (dG + borderGlow * 255) * diamondAlpha);
    b = Math.round(b * (1 - diamondAlpha) + (dB + borderGlow * 255) * diamondAlpha);
  }

  // Upward Growth Chart Trend Arrow
  // Line 1: (-0.28, 0.16) to (-0.08, -0.04)
  // Line 2: (-0.08, -0.04) to (0.10, 0.12)
  // Line 3: (0.10, 0.12) to (0.30, -0.16)
  const strokeW = 0.055;
  const d1 = distToSegment(ex, ey, -0.28, 0.16, -0.08, -0.04);
  const d2 = distToSegment(ex, ey, -0.08, -0.04, 0.10, 0.12);
  const d3 = distToSegment(ex, ey, 0.10, 0.12, 0.30, -0.16);

  // Arrow Head:
  const dArrow1 = distToSegment(ex, ey, 0.18, -0.16, 0.30, -0.16);
  const dArrow2 = distToSegment(ex, ey, 0.30, -0.04, 0.30, -0.16);

  const minLineD = Math.min(d1, d2, d3, dArrow1, dArrow2);
  const lineAlpha = 1.0 - smoothstep(strokeW - 0.015, strokeW + 0.015, minLineD);

  if (lineAlpha > 0) {
    r = Math.round(r * (1 - lineAlpha) + 255 * lineAlpha);
    g = Math.round(g * (1 - lineAlpha) + 255 * lineAlpha);
    b = Math.round(b * (1 - lineAlpha) + 255 * lineAlpha);
  }

  // Four-point sparkle star in the upper left corner
  const sparkleD = sdSparkle(ex + 0.22, ey + 0.24, 0.14);
  const sparkleAlpha = 1.0 - smoothstep(-0.01, 0.02, sparkleD);

  if (sparkleAlpha > 0) {
    r = Math.round(r * (1 - sparkleAlpha) + 255 * sparkleAlpha);
    g = Math.round(g * (1 - sparkleAlpha) + 255 * sparkleAlpha);
    b = Math.round(b * (1 - sparkleAlpha) + 255 * sparkleAlpha);
  }

  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), bgA];
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [
  { name: 'icon-72.png', size: 72, maskable: false },
  { name: 'icon-96.png', size: 96, maskable: false },
  { name: 'icon-128.png', size: 128, maskable: false },
  { name: 'icon-144.png', size: 144, maskable: false },
  { name: 'icon-152.png', size: 152, maskable: false },
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-384.png', size: 384, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'maskable-512.png', size: 512, maskable: true },
];

for (const target of sizes) {
  console.log(`Gerando ${target.name} (${target.size}x${target.size})...`);
  const buf = createPNG(target.size, target.size, (x, y, w, h) =>
    renderFinanFlowIcon(x, y, w, target.maskable)
  );
  fs.writeFileSync(path.join(iconsDir, target.name), buf);
}

// Remove test.png if present
const testFile = path.join(iconsDir, 'test.png');
if (fs.existsSync(testFile)) fs.unlinkSync(testFile);

console.log('✅ Todos os ícones PWA gerados com sucesso!');
