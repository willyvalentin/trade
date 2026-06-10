import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trade",
  description: "Private mock trading recommendations app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
