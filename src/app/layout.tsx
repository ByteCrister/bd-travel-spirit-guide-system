// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { inter, roboto, lato, poppins, montserrat } from "./fonts";

export const metadata: Metadata = {
  title: "My Next.js 15 App",
  description: "Using Next.js 15 with Tailwind and Google Fonts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${roboto.variable} ${lato.variable} ${poppins.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
