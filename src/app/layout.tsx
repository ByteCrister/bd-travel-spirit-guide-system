// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { plusJakartaSans, inter } from "./fonts";
import GlobalProvider from "@/components/wrappers/GlobalProvider";
import { Toaster } from "@/components/ui/sonner";

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
        <GlobalProvider>
          {/* App content */}
          {children}

          {/* Global toast notifications */}
          <Toaster
            position="bottom-right"
            richColors
            duration={5000}
          />
        </GlobalProvider>
      </body>
    </html>
  );
}
