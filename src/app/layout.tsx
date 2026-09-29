import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ConfiguratorProvider } from "@/components/ConfiguratorProvider";
import "./globals.css";

// Exposed as CSS variables; globals.css maps them to the --font-sans / --font-display tokens.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Design Your Workspace",
  description: "Build your rental workspace — desk, chair, monitors and extras — and see it come together before you rent.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ConfiguratorProvider>{children}</ConfiguratorProvider>
      </body>
    </html>
  );
}
