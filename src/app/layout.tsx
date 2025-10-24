// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { plusJakartaSans, inter } from "./fonts";

export const metadata: Metadata = {
  title: "BD Travel Spirit Guide - Professional Travel Management",
  description: "Empowering travel experiences with professional guides and seamless tour management across Bangladesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
