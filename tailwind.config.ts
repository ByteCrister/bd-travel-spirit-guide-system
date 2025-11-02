// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
        roboto: ["var(--font-roboto)"],
        lato: ["var(--font-lato)"],
        poppins: ["var(--font-poppins)"],
        montserrat: ["var(--font-montserrat)"],
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
        brand: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
