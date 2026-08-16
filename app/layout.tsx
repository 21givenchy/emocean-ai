import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "EMOCEAN — Bioadaptive Experience Lab",
  description: "A public, evidence-aware place to discover interface settings that support your work and experience a breathing-responsive world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-full bg-black text-white`}>{children}</body>
    </html>
  );
}