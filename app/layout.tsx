import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import CelestialBackdrop from "@/components/CelestialBackdrop";
import InstallPrompt from "@/components/InstallPrompt";
import ChunkErrorReload from "@/components/ChunkErrorReload";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tarot-reader-wheat.vercel.app";
const title = "Tarot Reader";
const description =
  "Ask a question, draw a spread, and receive an AI-woven tarot reading.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tarot Reader — Your journey, revealed",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title,
  },
};

export const viewport: Viewport = {
  themeColor: "#1b1535",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <CelestialBackdrop />
        <div className="flex flex-col flex-1 relative z-10">{children}</div>
        <InstallPrompt />
        <ChunkErrorReload />
        <footer className="relative z-10 text-center px-4 pt-8 pb-10">
          <div className="gold-divider max-w-xs mx-auto mb-5" />
          <p className="text-xs tracking-wide text-lavender-gray/50">
            Card art: Soimoi deck via{" "}
            <a
              href="https://github.com/mixvlad/TarotCards"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/70 underline decoration-gold/30 underline-offset-2 hover:text-gold transition-colors"
            >
              mixvlad/TarotCards
            </a>
            , licensed{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/70 underline decoration-gold/30 underline-offset-2 hover:text-gold transition-colors"
            >
              CC BY-NC 4.0
            </a>
            .
          </p>
        </footer>
      </body>
    </html>
  );
}
