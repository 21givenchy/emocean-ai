import "./globals.css";

export const metadata = {
  title: "Emotion Detection Camera",
  description: "Real-time facial emotion detection using webcam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}