import { Card, CardContent } from "../ui/card";

import {
    FaUsers,
    FaUserShield,
    FaSuitcase,
    FaStar,
    FaGlobeAsia,
    FaHandshake,
} from "react-icons/fa";
import { ChevronDown, Sparkles } from "lucide-react";

import formatHeroStat from "@/utils/helpers/formatHeroStat.landing";
import CountUpStat from "../global/CountUpStat";
import HeroCTAbtn from "./client/HeroCTAbtn";
import { MotionDiv } from "../global/motion-elements";
import { Stat } from "@/types/landing-page.types";
import { HERO_STAT } from "@/constants/landing-page.const";
import type { IconType } from "react-icons";

// Define the props interface
interface HeroProps {
    heroStats: Stat[];
}

// Map labels to icons (you can customize this as needed)
const labelToIcon: Record<string, IconType> = {
    [HERO_STAT.REGISTERED_GUIDES]: FaUsers,
    [HERO_STAT.ASSISTANCE_VERIFIED]: FaUserShield,
    [HERO_STAT.TOURS_MANAGED]: FaSuitcase,
    [HERO_STAT.AVG_SATISFACTION]: FaStar,
    [HERO_STAT.CITIES_COVERED]: FaGlobeAsia,
    [HERO_STAT.PARTNERS_AND_VENDORS]: FaHandshake,
};

const defaultHeroStats = [
    { label: HERO_STAT.REGISTERED_GUIDES, value: 1200 },
    { label: HERO_STAT.ASSISTANCE_VERIFIED, value: 2800 },
    { label: HERO_STAT.TOURS_MANAGED, value: 8500 },
    { label: HERO_STAT.AVG_SATISFACTION, value: 4.8, suffix: "/5" },
    { label: HERO_STAT.CITIES_COVERED, value: 60 },
    { label: HERO_STAT.PARTNERS_AND_VENDORS, value: 200 },
];

export default function Hero({ heroStats = defaultHeroStats }: HeroProps) {
    // Convert heroStats to the full Stat type with icons
    const stats: Stat[] = heroStats.map((stat) => ({
        ...stat,
        icon: labelToIcon[stat.label] ?? FaUsers, // Fallback to FaUsers if label not found
    }));

    return (
        <section
            aria-labelledby="hero-title"
            className="
        relative min-h-screen flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500
      "
        >
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-slate-900/70" />

            {/* Radial accent overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.15),transparent_50%)]" />

            {/* Floating decorative motion blobs (sit above overlays, below content) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <MotionDiv
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl"
                />
                <MotionDiv
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-40 right-20 w-16 h-16 bg-red-500/20 rounded-full blur-xl"
                />
                <MotionDiv
                    animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-40 left-1/4 w-24 h-24 bg-green-500/20 rounded-full blur-xl"
                />
            </div>

            {/* Content wrapper (above everything) */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Badge */}
                        <MotionDiv
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 mb-8"
                        >
                            <Sparkles className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium text-white">
                                Professional Travel Management
                            </span>
                        </MotionDiv>

                        {/* Main heading */}
                        <h1
                            id="hero-title"
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
                        >
                            Empowering Travel Experiences with{" "}
                            <span className="bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                BD Travel Spirit Guide
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl text-slate-200 leading-relaxed mb-12 max-w-3xl mx-auto">
                            Connect Guides and assistance&apos;s to manage tours, collaborate
                            seamlessly, and deliver trusted travel experiences across
                            Bangladesh.
                        </p>

                        {/* CTA Buttons */}
                        <HeroCTAbtn />

                    </MotionDiv>

                    {/* Stats Grid */}
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
                    >
                        {stats.map(({ icon, label, value, suffix, prefix }, i) => {
                            const formatted = formatHeroStat(value, { suffix, prefix });
                            const endRaw = Number(formatted.displayValue);
                            const end = Number.isFinite(endRaw) ? endRaw : 0;
                            const Icon = icon ?? FaUsers;
                            return (
                                <MotionDiv
                                    key={label}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                                    whileHover={{ y: -8, scale: 1.05 }}
                                    className="group"
                                >
                                    <Card className="h-full bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300 rounded-2xl overflow-hidden shadow-lg">
                                        <CardContent className="p-6 text-center">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="h-6 w-6" aria-hidden="true" />
                                            </div>

                                            <div className="text-2xl font-bold text-white mb-1">

                                                <CountUpStat end={end} suffix={formatted.suffix} />

                                            </div>

                                            <div className="text-xs font-medium text-slate-200 uppercase tracking-wider">
                                                {label}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </MotionDiv>
                            );
                        })}
                    </MotionDiv>
                </div>
            </div>

            {/* Scroll indicator */}
            <MotionDiv
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <MotionDiv
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-2 text-white/60"
                >
                    <span className="text-sm font-medium">Scroll to explore</span>
                    <ChevronDown className="h-5 w-5 scroll-indicator" />
                </MotionDiv>
            </MotionDiv>
        </section>
    );
}
