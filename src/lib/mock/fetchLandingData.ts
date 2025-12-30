import { HERO_STAT } from "@/constants/landing-page.const";
import { HomePageDataTypes } from "@/types/landing-page.types";

// Mock loader — replace with real CMS/DB fetch later
export default async function fetchLandingData(): Promise<HomePageDataTypes> {
    
    const data: HomePageDataTypes = {
        heroStats: [
            { label: HERO_STAT.REGISTERED_GUIDES, value: 1200 },
            { label: HERO_STAT.ASSISTANCE_VERIFIED, value: 2800 },
            { label: HERO_STAT.TOURS_MANAGED, value: 8500 },
            { label: HERO_STAT.AVG_SATISFACTION, value: 4.8, suffix: "/5" },
            { label: HERO_STAT.CITIES_COVERED, value: 60 },
            { label: HERO_STAT.PARTNERS_AND_VENDORS, value: 200 },
        ]
    }

    return data;
}