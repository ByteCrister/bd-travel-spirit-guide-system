import type { Metadata } from "next";
import HomePage from "@/components/landing/HomePage";
import fetchLandingData from "@/lib/mock/fetchLandingData";

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await fetchLandingData();

    const stats = pageData.heroStats;
    const guides = stats.find(s => s.label === "Registered Guides")?.value ?? 1200;
    const tours = stats.find(s => s.label === "Tours Managed")?.value ?? 8500;
    const cities = stats.find(s => s.label === "Cities Covered")?.value ?? 60;
    const rating = stats.find(s => s.label === "Avg. Satisfaction")?.value ?? 4.8;

    const title = "BD Travel Spirit Guide — Professional Tour Management in Bangladesh";
    const description =
        `Connect with ${guides}+ verified guides across ${cities} cities in Bangladesh. ` +
        `${tours}+ tours managed with a ${rating}/5 satisfaction rating. ` +
        `Book, manage, and coordinate travel experiences with ease.`;

    return {
        title,
        description,
        keywords: [
            "Bangladesh travel",
            "tour guide management",
            "BD travel spirit",
            "professional guides Bangladesh",
            "tour booking Bangladesh",
            "travel management system",
            "guide assistant platform",
        ],
        authors: [{ name: "BD Travel Spirit Guide" }],
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            type: "website",
            title,
            description,
            siteName: "BD Travel Spirit Guide",
            locale: "en_BD",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

const page = async () => {
    const pageData = await fetchLandingData();
    return <HomePage pageData={pageData} />;
};

export default page;