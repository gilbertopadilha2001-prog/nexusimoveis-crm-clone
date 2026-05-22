import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus Imóveis — CRM WhatsApp",
  description: "CRM WhatsApp · Curitiba",
  icons: {
    icon: "/seo/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      style={
        {
          "--font-sans": "var(--font-inter), system-ui, sans-serif",
          "--font-display": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
