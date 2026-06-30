import QRCode from "qrcode";

export async function createQrCodeDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    color: {
      dark: "#172026",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}
