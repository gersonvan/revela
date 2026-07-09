import { deflateSync } from "node:zlib";

import QRCode from "qrcode";

type Rgb = [number, number, number];

const COLORS = {
  accent: [212, 86, 43] as Rgb,
  background: [251, 245, 238] as Rgb,
  border: [232, 221, 209] as Rgb,
  card: [255, 255, 255] as Rgb,
  muted: [138, 107, 85] as Rgb,
  subtle: [176, 149, 133] as Rgb,
  text: [29, 17, 8] as Rgb,
};

const FONT: Record<string, string[]> = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  "!": ["1", "1", "1", "1", "1", "0", "1"],
  "-": ["000", "000", "000", "111", "000", "000", "000"],
  ".": ["0", "0", "0", "0", "0", "0", "1"],
  "0": ["111", "101", "101", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "010", "010", "111"],
  "2": ["111", "001", "001", "111", "100", "100", "111"],
  "3": ["111", "001", "001", "111", "001", "001", "111"],
  "4": ["101", "101", "101", "111", "001", "001", "001"],
  "5": ["111", "100", "100", "111", "001", "001", "111"],
  "6": ["111", "100", "100", "111", "101", "101", "111"],
  "7": ["111", "001", "001", "010", "010", "010", "010"],
  "8": ["111", "101", "101", "111", "101", "101", "111"],
  "9": ["111", "101", "101", "111", "001", "001", "111"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
};

export async function createPrintableQrPngBuffer({
  eventName,
  uploadUrl,
}: {
  eventName: string;
  uploadUrl: string;
}) {
  const canvas = createCanvas(1080, 1350, COLORS.background);

  fillRoundedRect(canvas, 92, 92, 896, 1166, 48, COLORS.card);
  strokeRoundedRect(canvas, 92, 92, 896, 1166, 48, COLORS.border, 3);

  drawTextCentered(canvas, "REVELA", 540, 154, 11, COLORS.accent, 2);
  drawTextCentered(canvas, "PARTICIPE DO MURAL", 540, 248, 5, COLORS.muted, 3);

  drawQrCode(canvas, uploadUrl, 190, 330, 700);

  drawTextCentered(canvas, "ENVIE SUA FOTO", 540, 1062, 12, COLORS.text, 3);
  drawTextCentered(canvas, "APONTE A CAMERA PARA PARTICIPAR", 540, 1150, 5, COLORS.muted, 2);
  drawTextCentered(canvas, normalizeText(eventName).slice(0, 34), 540, 1216, 4, COLORS.subtle, 2);

  return encodePng(canvas);
}

function createCanvas(width: number, height: number, color: Rgb) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = 255;
  }
  return { data, height, width };
}

function drawQrCode(
  canvas: ReturnType<typeof createCanvas>,
  value: string,
  x: number,
  y: number,
  size: number,
) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const moduleCount = qr.modules.size;
  const quietZone = 4;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = Math.floor(size / totalModules);
  const qrSize = moduleSize * totalModules;
  const offset = Math.floor((size - qrSize) / 2);

  fillRect(canvas, x, y, size, size, COLORS.card);

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!qr.modules.data[row * moduleCount + col]) continue;
      fillRect(
        canvas,
        x + offset + (col + quietZone) * moduleSize,
        y + offset + (row + quietZone) * moduleSize,
        moduleSize,
        moduleSize,
        COLORS.text,
      );
    }
  }
}

function drawTextCentered(
  canvas: ReturnType<typeof createCanvas>,
  text: string,
  centerX: number,
  y: number,
  scale: number,
  color: Rgb,
  spacing = 2,
) {
  const normalized = normalizeText(text);
  const width = measureText(normalized, scale, spacing);
  drawText(canvas, normalized, Math.round(centerX - width / 2), y, scale, color, spacing);
}

function drawText(
  canvas: ReturnType<typeof createCanvas>,
  text: string,
  x: number,
  y: number,
  scale: number,
  color: Rgb,
  spacing: number,
) {
  let cursorX = x;
  for (const char of text) {
    const glyph = FONT[char] ?? FONT[" "];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === "1") {
          fillRect(canvas, cursorX + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursorX += glyph[0].length * scale + spacing * scale;
  }
}

function measureText(text: string, scale: number, spacing: number) {
  return [...text].reduce((width, char, index) => {
    const glyph = FONT[char] ?? FONT[" "];
    return width + glyph[0].length * scale + (index === text.length - 1 ? 0 : spacing * scale);
  }, 0);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 !.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fillRoundedRect(
  canvas: ReturnType<typeof createCanvas>,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: Rgb,
) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      if (isInsideRoundedRect(px, py, x, y, width, height, radius)) {
        setPixel(canvas, px, py, color);
      }
    }
  }
}

function strokeRoundedRect(
  canvas: ReturnType<typeof createCanvas>,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: Rgb,
  strokeWidth: number,
) {
  fillRoundedRect(canvas, x, y, width, height, radius, color);
  fillRoundedRect(
    canvas,
    x + strokeWidth,
    y + strokeWidth,
    width - strokeWidth * 2,
    height - strokeWidth * 2,
    Math.max(0, radius - strokeWidth),
    COLORS.card,
  );
}

function isInsideRoundedRect(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const right = x + width - 1;
  const bottom = y + height - 1;
  const cx = px < x + radius ? x + radius : px > right - radius ? right - radius : px;
  const cy = py < y + radius ? y + radius : py > bottom - radius ? bottom - radius : py;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function fillRect(
  canvas: ReturnType<typeof createCanvas>,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Rgb,
) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      setPixel(canvas, px, py, color);
    }
  }
}

function setPixel(canvas: ReturnType<typeof createCanvas>, x: number, y: number, color: Rgb) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const index = (y * canvas.width + x) * 4;
  canvas.data[index] = color[0];
  canvas.data[index + 1] = color[1];
  canvas.data[index + 2] = color[2];
  canvas.data[index + 3] = 255;
}

function encodePng(canvas: ReturnType<typeof createCanvas>) {
  const scanlines = Buffer.alloc((canvas.width * 4 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    const scanlineStart = y * (canvas.width * 4 + 1);
    scanlines[scanlineStart] = 0;
    canvas.data.copy(
      scanlines,
      scanlineStart + 1,
      y * canvas.width * 4,
      (y + 1) * canvas.width * 4,
    );
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", createIhdr(canvas.width, canvas.height)),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function createIhdr(width: number, height: number) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return data;
}

function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
