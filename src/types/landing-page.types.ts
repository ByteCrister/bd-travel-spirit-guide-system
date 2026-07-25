// src/types/landing-page.types.ts
import type { IconType } from "react-icons";

export type Stat = {
    label: string;
    value: number;
    icon?: IconType;
    suffix?: string;
    prefix?: string;
};

export type SocialLink = {
    label?: string;
    icon: string;
    url: string;
    order?: number;
};

export type LocationInfo = {
    country: string;
    city?: string;
    region?: string;
};

export interface HomePageDataTypes {
    heroStats: Stat[];
    socialLinks: SocialLink[];
    locations: LocationInfo[];
}