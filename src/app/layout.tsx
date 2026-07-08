import type { Metadata } from "next";
import { Bricolage_Grotesque, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-sans-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Revela",
  description: "Fotos que revelam o momento.",
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { rel: "icon", url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
