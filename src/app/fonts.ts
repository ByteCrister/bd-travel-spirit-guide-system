// G:\Projects\bd-travel-spirit-guide-system\src\app\fonts.ts
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

// Primary font: Plus Jakarta Sans (weights 300-800)
export const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta-sans",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    display: "swap",
});

// Secondary font: Inter for logo elements
export const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});
