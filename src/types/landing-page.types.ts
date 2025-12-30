// src/types/landing-page.types.ts
import type { IconType } from "react-icons";

export type Stat = {
    label: string;
    value: number;
    icon?: IconType;
    suffix?: string;
    prefix?: string;
};

export interface HomePageDataTypes {
    heroStats: Stat[]
}