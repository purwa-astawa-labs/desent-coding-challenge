import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ConfiguratorProvider } from "@/components/ConfiguratorProvider";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ConfiguratorProvider>{children}</ConfiguratorProvider>
      </body>
    </html>
  );
}
