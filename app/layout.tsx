import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trade",
  description: "Private mock trading recommendations app",
};

const themeBootstrapScript = `
(() => {
  document.documentElement.dataset.theme = "dark";
})();
`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
