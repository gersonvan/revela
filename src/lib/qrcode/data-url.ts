import QRCode from "qrcode";

export async function createQrCodeDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    color: {
      dark: "#1D1108",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}

export async function createQrCodeSvgDataUrl(value: string) {
  const svg = await QRCode.toString(value, {
    color: {
      dark: "#1D1108",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
    margin: 1,
    type: "svg",
    width: 760,
  });

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
