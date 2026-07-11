import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarot Reader",
  description: "Ask a question, draw a spread, and receive an AI-woven tarot reading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex flex-col flex-1">{children}</div>
        <footer className="text-center text-xs text-purple-300/40 py-6 px-4">
          Card art: Soimoi deck via{" "}
          <a
            href="https://github.com/mixvlad/TarotCards"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-purple-200/60"
          >
            mixvlad/TarotCards
          </a>
          , licensed{" "}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-purple-200/60"
          >
            CC BY-NC 4.0
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
