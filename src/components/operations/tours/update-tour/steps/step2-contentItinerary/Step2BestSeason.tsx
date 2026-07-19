"use client";

import { useFormikContext } from "formik";
import { UpdateTourContentItineraryDTO } from "@/types/tour/tour.types";
import { Sun, Cloud, Snowflake, Leaf, Calendar, Check, X, CloudRain, Wind, Sparkles } from "lucide-react";
import { Season, SEASON } from "@/constants/tour/tour.const";

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_CARD = 'rounded-2xl bg-[#E7E5E4]  border border-white/60';
const NEU_SURFACE_INSET = 'bg-[#E7E5E4] ';
const NEU_HEADING = 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL = 'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED = 'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_BADGE_PRIMARY = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#006666]/10 text-[#006666] ';
const NEU_DIVIDER = 'border-[#1E2938]/10';
const NEU_ICON_WELL = 'p-2.5 rounded-xl bg-[#E7E5E4] ';
const NEU_BTN_DANGER_SM = 'inline-flex items-center gap-1 text-xs font-[family-name:var(--font-space-mono)] text-[#1E2938]/50 hover:text-[#FF2157] transition-colors duration-200';
// ─────────────────────────────────────────────────────────────

const SEASON_CONFIG = {
    [SEASON.SPRING]: { label: 'Spring', icon: Leaf, accentBg: 'bg-green-500', accentText: 'text-green-600', accentBorder: 'border-green-400', description: 'Blooming season' },
    [SEASON.SUMMER]: { label: 'Summer', icon: Sun, accentBg: 'bg-yellow-500', accentText: 'text-yellow-600', accentBorder: 'border-yellow-400', description: 'Hot and dry season' },
    [SEASON.MONSOON]: { label: 'Monsoon', icon: CloudRain, accentBg: 'bg-sky-500', accentText: 'text-sky-600', accentBorder: 'border-sky-400', description: 'Rainy season' },
    [SEASON.AUTUMN]: { label: 'Autumn', icon: Wind, accentBg: 'bg-orange-500', accentText: 'text-orange-600', accentBorder: 'border-orange-400', description: 'After monsoon' },
    [SEASON.LATE_AUTUMN]: { label: 'Late Autumn', icon: Cloud, accentBg: 'bg-amber-500', accentText: 'text-amber-600', accentBorder: 'border-amber-400', description: 'Dry transition' },
    [SEASON.WINTER]: { label: 'Winter', icon: Snowflake, accentBg: 'bg-blue-500', accentText: 'text-blue-600', accentBorder: 'border-blue-400', description: 'Cool season' },
    [SEASON.YEAR_ROUND]: { label: 'Year Round', icon: Sparkles, accentBg: 'bg-purple-500', accentText: 'text-purple-600', accentBorder: 'border-purple-400', description: 'All seasons suitable' },
};

function Step2BestSeason() {
    const { values, setFieldValue, touched, errors } = useFormikContext<UpdateTourContentItineraryDTO>();

    const toggleSeason = (season: Season) => {
        const current = values.bestSeason || [];
        setFieldValue('bestSeason',
            current.includes(season) ? current.filter((s: string) => s !== season) : [...current, season]
        );
    };

    const clearAll = () => setFieldValue("bestSeason", []);

    const selectedSeasons = values.bestSeason || [];
    const hasError = touched.bestSeason && errors.bestSeason;

    return (
        <div className={`${NEU_CARD} ${hasError ? 'ring-2 ring-[#FF2157]/50' : ''} overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-5 border-b ${NEU_DIVIDER}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={NEU_ICON_WELL}>
                            <Calendar className="w-4 h-4 text-[#006666]" />
                        </div>
                        <div>
                            <h3 className={`${NEU_HEADING} text-base`}>Best Season to Visit</h3>
                            <p className={`${NEU_MUTED} mt-0.5`}>Select the ideal seasons for this tour</p>
                        </div>
                    </div>
                    {selectedSeasons.length > 0 && (
                        <span className={NEU_BADGE_PRIMARY}>{selectedSeasons.length} selected</span>
                    )}
                </div>
            </div>

            <div className="px-6 py-5 space-y-5">
                {/* Selected summary strip */}
                {selectedSeasons.length > 0 && (
                    <div className={`${NEU_SURFACE_INSET} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={NEU_LABEL}>Selected</span>
                            <button type="button" onClick={clearAll} className={NEU_BTN_DANGER_SM}>
                                <X className="h-3 w-3" /> Clear all
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedSeasons.map((s: string) => {
                                const cfg = SEASON_CONFIG[s as keyof typeof SEASON_CONFIG];
                                if (!cfg) return null;
                                const Icon = cfg.icon;
                                return (
                                    <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#E7E5E4]  text-[#1E2938]">
                                        <Icon className="h-3 w-3" /> {cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(SEASON_CONFIG).map(([seasonValue, cfg]) => {
                        const Icon = cfg.icon;
                        const selected = selectedSeasons.includes(seasonValue as Season);
                        return (
                            <button
                                key={seasonValue}
                                type="button"
                                onClick={() => toggleSeason(seasonValue as Season)}
                                className={[
                                    'relative p-4 rounded-xl text-left transition-all duration-200',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50',
                                    selected
                                        ? `bg-[#E7E5E4]  border-2 ${cfg.accentBorder}`
                                        : 'bg-[#E7E5E4]  border-2 border-transparent hover: hover:-translate-y-0.5',
                                ].join(' ')}
                            >
                                <div className={[
                                    'absolute top-2.5 right-2.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                                    selected ? `${cfg.accentBg} border-transparent` : 'border-[#1E2938]/20 bg-[#E7E5E4] ',
                                ].join(' ')}>
                                    {selected && <Check className="h-3 w-3 text-white" />}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={[
                                        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                                        selected ? cfg.accentBg : 'bg-[#E7E5E4] ',
                                    ].join(' ')}>
                                        <Icon className={`h-5 w-5 ${selected ? 'text-white' : 'text-[#1E2938]/40'}`} />
                                    </div>
                                    <div>
                                        <p className={`font-[family-name:var(--font-space-mono)] font-bold text-sm ${selected ? cfg.accentText : 'text-[#1E2938]'}`}>
                                            {cfg.label}
                                        </p>
                                        <p className={NEU_MUTED}>{cfg.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {hasError && (
                    <p className="flex items-center gap-1.5 text-sm font-[family-name:var(--font-space-mono)] text-[#FF2157]">
                        <X className="h-4 w-4" /> {String(errors.bestSeason)}
                    </p>
                )}

                {selectedSeasons.length === 0 && !hasError && (
                    <p className={`${NEU_MUTED} text-center pt-1`}>Select one or more seasons when this tour is best to visit</p>
                )}
            </div>
        </div>
    );
}

export default Step2BestSeason;