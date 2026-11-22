/**
 * Standalone Zero-Dependency ISO/IEC 18004 Vector QR Code SVG Generator
 * 100% Offline-First, CORS-Free Data URI for Canvas, PNG/PDF/PPTX Export & Live Presentations
 */

const VERSIONS: Array<{
  version: number;
  size: number;
  totalDataBytes: number;
  ecBytesPerBlock: number;
  numBlocks: number;
  alignCenter?: number;
}> = [
  { version: 1, size: 21, totalDataBytes: 19, ecBytesPerBlock: 7, numBlocks: 1 },
  { version: 2, size: 25, totalDataBytes: 34, ecBytesPerBlock: 10, numBlocks: 1, alignCenter: 18 },
  { version: 3, size: 29, totalDataBytes: 55, ecBytesPerBlock: 15, numBlocks: 1, alignCenter: 22 },
  { version: 4, size: 33, totalDataBytes: 80, ecBytesPerBlock: 20, numBlocks: 1, alignCenter: 26 },
  { version: 5, size: 37, totalDataBytes: 108, ecBytesPerBlock: 26, numBlocks: 1, alignCenter: 30 },
  { version: 6, size: 41, totalDataBytes: 136, ecBytesPerBlock: 18, numBlocks: 2, alignCenter: 34 },
];

// GF(256) tables for Reed-Solomon Error Correction (primitive polynomial 0x11D)
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function getGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const root = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function computeReedSolomon(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = getGeneratorPoly(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecLen - 1] = 0;
    for (let j = 0; j < ecLen; j++) {
      rem[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return rem;
}

export function generateQrMatrix(rawText: string): boolean[][] {
  const text = (rawText || 'https://designflow.app').trim();
  const encoder = new TextEncoder();
  let utf8 = encoder.encode(text);
  if (utf8.length > 130) {
    utf8 = utf8.slice(0, 130);
  }

  const vInfo = VERSIONS.find(v => utf8.length + 2 <= v.totalDataBytes) || VERSIONS[VERSIONS.length - 1];
  const { size, totalDataBytes, ecBytesPerBlock, numBlocks, alignCenter } = vInfo;

  // Build data bit stream: Byte mode (0100) + 8-bit length + bytes + 0000 terminator
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4);
  pushBits(utf8.length, 8);
  for (const b of utf8) pushBits(b, 8);
  pushBits(0, Math.min(4, totalDataBytes * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const dataBytes = new Uint8Array(totalDataBytes);
  for (let i = 0; i < bits.length / 8; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i * 8 + b];
    }
    dataBytes[i] = byte;
  }
  const pads = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < totalDataBytes; i++, p++) {
    dataBytes[i] = pads[p % 2];
  }

  // Split into blocks & compute EC
  const blockSize = totalDataBytes / numBlocks;
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  for (let b = 0; b < numBlocks; b++) {
    const block = dataBytes.slice(b * blockSize, (b + 1) * blockSize);
    dataBlocks.push(block);
    ecBlocks.push(computeReedSolomon(block, ecBytesPerBlock));
  }

  // Interleave codewords
  const finalCodewords: number[] = [];
  for (let i = 0; i < blockSize; i++) {
    for (let b = 0; b < numBlocks; b++) finalCodewords.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < ecBytesPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) finalCodewords.push(ecBlocks[b][i]);
  }

  // Initialize matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunctionModule = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = dark;
      reserved[r][c] = true;
    }
  };

  // Finder patterns + separators
  const drawFinder = (top: number, left: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setFunctionModule(top + r, left + c, inOuter && (onBorder || inInner));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Alignment pattern for V2+
  if (alignCenter) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const dark = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        setFunctionModule(alignCenter + r, alignCenter + c, dark);
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0;
    if (!reserved[6][i]) setFunctionModule(6, i, dark);
    if (!reserved[i][6]) setFunctionModule(i, 6, dark);
  }

  // Dark module & reserve format info areas
  setFunctionModule(size - 8, 8, true);
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    if (!reserved[8][size - 1 - i]) reserved[8][size - 1 - i] = true;
    if (!reserved[size - 1 - i][8]) reserved[size - 1 - i][8] = true;
  }

  // Place data bits in upward/downward 2-column zigzag with mask 0 ((r + c) % 2 === 0)
  let bitIdx = 0;
  const totalBits = finalCodewords.length * 8;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      const r = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        if (!reserved[r][c]) {
          let dark = false;
          if (bitIdx < totalBits) {
            const byte = finalCodewords[bitIdx >> 3];
            dark = ((byte >> (7 - (bitIdx & 7))) & 1) === 1;
            bitIdx++;
          }
          if ((r + c) % 2 === 0) dark = !dark;
          matrix[r][c] = dark;
        }
      }
    }
    upward = !upward;
  }

  // Format information for Level L (01) and Mask 0 (000) -> 0x77C4
  const formatBits = 0x77c4;
  const getFmtBit = (i: number) => ((formatBits >> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) matrix[8][i] = getFmtBit(i);
  matrix[8][7] = getFmtBit(6);
  matrix[8][8] = getFmtBit(7);
  matrix[7][8] = getFmtBit(8);
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = getFmtBit(i);

  for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = getFmtBit(i);
  for (let i = 8; i < 15; i++) matrix[size - 15 + i][8] = getFmtBit(i);

  return matrix;
}

export function getQrCodeSvgString(
  content: string,
  size = 300,
  color = '000000',
  bgColor = 'ffffff'
): string {
  const matrix = generateQrMatrix(content || 'https://designflow.app');
  const modules = matrix.length;
  const quietZone = 2;
  const totalModules = modules + quietZone * 2;
  const fg = color.startsWith('#') ? color : `#${color}`;
  const bg = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;

  let pathData = '';
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (matrix[r][c]) {
        const x = c + quietZone;
        const y = r + quietZone;
        pathData += `M${x},${y}h1v1h-1z`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} ${totalModules}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bg}"/><path d="${pathData}" fill="${fg}"/></svg>`;
}

export function getQrCodeUrl(
  content: string,
  size = 300,
  color = '000000',
  bgColor = 'ffffff'
): string {
  const svg = getQrCodeSvgString(content, size, color, bgColor);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getQrCodePngDataUrl(
  content: string,
  size = 300,
  color = '000000',
  bgColor = 'ffffff'
): string {
  if (typeof document === 'undefined') {
    return getQrCodeUrl(content, size, color, bgColor);
  }
  const matrix = generateQrMatrix(content || 'https://designflow.app');
  const modules = matrix.length;
  const quietZone = 2;
  const totalModules = modules + quietZone * 2;
  const fg = color.startsWith('#') ? color : `#${color}`;
  const bg = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;

  const canvas = document.createElement('canvas');
  const scale = Math.max(4, Math.ceil(size / totalModules));
  canvas.width = totalModules * scale;
  canvas.height = totalModules * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return getQrCodeUrl(content, size, color, bgColor);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fg;
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (matrix[r][c]) {
        ctx.fillRect((c + quietZone) * scale, (r + quietZone) * scale, scale, scale);
      }
    }
  }
  return canvas.toDataURL('image/png');
}

