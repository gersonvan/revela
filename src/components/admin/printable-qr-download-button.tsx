"use client";

type PrintableQrDownloadButtonProps = {
  eventName: string;
  fileName: string;
  qrCodeDataUrl: string;
};

export function PrintableQrDownloadButton({
  eventName,
  fileName,
  qrCodeDataUrl,
}: PrintableQrDownloadButtonProps) {
  async function downloadPng() {
    const svg = createPrintableQrSvg({ eventName, qrCodeDataUrl });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);

    try {
      const image = await loadImage(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = 2160;
      canvas.height = 2700;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Não foi possível preparar o PNG.");
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (nextBlob) resolve(nextBlob);
          else reject(new Error("Não foi possível gerar o PNG."));
        }, "image/png");
      });

      const pngUrl = URL.createObjectURL(pngBlob);
      const anchor = document.createElement("a");
      anchor.href = pngUrl;
      anchor.download = fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(pngUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  return (
    <button
      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#D4562B] px-4 text-sm font-bold text-white"
      onClick={() => void downloadPng()}
      type="button"
    >
      Baixar PNG para impressão
    </button>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar a arte do QR Code."));
    image.src = src;
  });
}

function createPrintableQrSvg({
  eventName,
  qrCodeDataUrl,
}: {
  eventName: string;
  qrCodeDataUrl: string;
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1350" rx="56" fill="#FBF5EE"/>
  <rect x="92" y="92" width="896" height="1166" rx="48" fill="#FFFFFF" stroke="#E8DDD1" stroke-width="3"/>
  <text x="540" y="202" text-anchor="middle" fill="#D4562B" font-family="Georgia, serif" font-size="86" font-style="italic">revela</text>
  <text x="540" y="278" text-anchor="middle" fill="#8A6B55" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="4">PARTICIPE DO MURAL</text>
  <image href="${qrCodeDataUrl}" x="190" y="330" width="700" height="700"/>
  <text x="540" y="1098" text-anchor="middle" fill="#1D1108" font-family="Arial, sans-serif" font-size="76" font-weight="800">Envie sua foto</text>
  <text x="540" y="1162" text-anchor="middle" fill="#8A6B55" font-family="Arial, sans-serif" font-size="34">Aponte a câmera para participar</text>
  <text x="540" y="1228" text-anchor="middle" fill="#B09585" font-family="Arial, sans-serif" font-size="26">${escapeXml(eventName)}</text>
</svg>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
