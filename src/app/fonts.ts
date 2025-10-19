// G:\Projects\bd-travel-spirit-guide-system\src\app\fonts.ts
import { Inter, Roboto, Open_Sans, Lato, Poppins, Montserrat } from "next/font/google";

export const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"], // Inter has a default weight, so weight is optional
});

export const roboto = Roboto({
    variable: "--font-roboto",
    subsets: ["latin"],
    weight: ["400", "700"], // must specify weights
});

export const openSans = Open_Sans({
    variable: "--font-open-sans",
    subsets: ["latin"],
    weight: ["400", "600", "700"], // choose the weights you need
});

export const lato = Lato({
    variable: "--font-lato",
    subsets: ["latin"],
    weight: ["400", "700"], // required
});

export const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "700"], // required
});

export const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ["400", "600", "700"], // required
});
