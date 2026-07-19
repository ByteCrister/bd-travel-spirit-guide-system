"use client";

import { TOUR_CATEGORIES, TourCategories } from '@/constants/tour/tour.const';
import { useFormikContext } from 'formik';
import { UpdateTourContentItineraryDTO } from '@/types/tour/tour.types';
import {
    Palmtree, Landmark, UtensilsCrossed, Trees, Squirrel,
    Building2, Church, Castle, Ship, Check, X, FolderOpen
} from 'lucide-react';

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; color?: string; strokeWidth?: number }>;

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

const CATEGORY_CONFIG: Record<string, {
    label: string; icon: IconType; accentBg: string; accentText: string; accentBorder: string; description: string;
}> = {
    [TOUR_CATEGORIES.BEACHES]: { label: 'Beaches', icon: Palmtree, accentBg: 'bg-cyan-500', accentText: 'text-cyan-600', accentBorder: 'border-cyan-400', description: 'Coastal destinations' },
    [TOUR_CATEGORIES.CULTURE_HISTORY]: { label: 'Culture & History', icon: Landmark, accentBg: 'bg-amber-500', accentText: 'text-amber-600', accentBorder: 'border-amber-400', description: 'Historical sites & museums' },
    [TOUR_CATEGORIES.FOOD_DRINK]: { label: 'Food & Drink', icon: UtensilsCrossed, accentBg: 'bg-orange-500', accentText: 'text-orange-600', accentBorder: 'border-orange-400', description: 'Culinary experiences' },
    [TOUR_CATEGORIES.NATURE]: { label: 'Nature', icon: Trees, accentBg: 'bg-green-500', accentText: 'text-green-600', accentBorder: 'border-green-400', description: 'Outdoor activities' },
    [TOUR_CATEGORIES.WILDLIFE]: { label: 'Wildlife', icon: Squirrel, accentBg: 'bg-emerald-500', accentText: 'text-emerald-600', accentBorder: 'border-emerald-400', description: 'Safari & animal watching' },
    [TOUR_CATEGORIES.CITY]: { label: 'City', icon: Building2, accentBg: 'bg-slate-500', accentText: 'text-slate-600', accentBorder: 'border-slate-400', description: 'Urban exploration' },
    [TOUR_CATEGORIES.RELIGIOUS]: { label: 'Religious', icon: Church, accentBg: 'bg-purple-500', accentText: 'text-purple-600', accentBorder: 'border-purple-400', description: 'Spiritual destinations' },
    [TOUR_CATEGORIES.HERITAGE]: { label: 'Heritage', icon: Castle, accentBg: 'bg-rose-500', accentText: 'text-rose-600', accentBorder: 'border-rose-400', description: 'UNESCO & heritage sites' },
    [TOUR_CATEGORIES.CRUISE]: { label: 'Cruise', icon: Ship, accentBg: 'bg-blue-500', accentText: 'text-blue-600', accentBorder: 'border-blue-400', description: 'Cruise-based travel' },
};

const Step2Categories = () => {
    const { values, setFieldValue, touched, errors } = useFormikContext<UpdateTourContentItineraryDTO>();

    const toggleCategory = (category: TourCategories) => {
        const current = values.categories || [];
        setFieldValue('categories',
            current.includes(category) ? current.filter((c: string) => c !== category) : [...current, category]
        );
    };

    const clearAll = () => setFieldValue('categories', []);

    const selectedCategories = values.categories || [];
    const hasError = touched.categories && errors.categories;
    const categoryOptions = Object.values(TOUR_CATEGORIES);

    return (
        <div className={`${NEU_CARD} ${hasError ? 'ring-2 ring-[#FF2157]/50' : ''} overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-5 border-b ${NEU_DIVIDER}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={NEU_ICON_WELL}>
                            <FolderOpen className="w-4 h-4 text-[#006666]" />
                        </div>
                        <div>
                            <h3 className={`${NEU_HEADING} text-base`}>Content Categories</h3>
                            <p className={`${NEU_MUTED} mt-0.5`}>Choose categories that best describe this tour</p>
                        </div>
                    </div>
                    {selectedCategories.length > 0 && (
                        <span className={NEU_BADGE_PRIMARY}>{selectedCategories.length} selected</span>
                    )}
                </div>
            </div>

            <div className="px-6 py-5 space-y-5">
                {/* Selected summary */}
                {selectedCategories.length > 0 && (
                    <div className={`${NEU_SURFACE_INSET} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={NEU_LABEL}>Selected</span>
                            <button type="button" onClick={clearAll} className={NEU_BTN_DANGER_SM}>
                                <X className="h-3 w-3" /> Clear all
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((cat: string) => {
                                const cfg = CATEGORY_CONFIG[cat] || { label: cat, icon: FolderOpen };
                                const Icon = cfg.icon;
                                return (
                                    <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#E7E5E4]  text-[#1E2938]">
                                        <Icon className="h-3 w-3" /> {cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Category Grid — centred icon layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                    {categoryOptions.map((val) => {
                        const cfg = CATEGORY_CONFIG[val] || { label: val, icon: FolderOpen, accentBg: 'bg-gray-500', accentText: 'text-gray-600', accentBorder: 'border-gray-400', description: '' };
                        const Icon = cfg.icon;
                        const selected = selectedCategories.includes(val);

                        return (
                            <button
                                key={val}
                                type="button"
                                onClick={() => toggleCategory(val)}
                                className={[
                                    'relative p-4 rounded-xl flex flex-col items-center text-center gap-2.5 transition-all duration-200',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50',
                                    selected
                                        ? `bg-[#E7E5E4]  border-2 ${cfg.accentBorder}`
                                        : 'bg-[#E7E5E4]  border-2 border-transparent hover: hover:-translate-y-0.5',
                                ].join(' ')}
                            >
                                {/* Check indicator */}
                                <div className={[
                                    'absolute top-2 right-2 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                                    selected ? `${cfg.accentBg} border-transparent` : 'border-[#1E2938]/20 bg-[#E7E5E4] ',
                                ].join(' ')}>
                                    {selected && <Check className="h-2.5 w-2.5 text-white" />}
                                </div>

                                <div className={[
                                    'h-12 w-12 rounded-full flex items-center justify-center',
                                    selected ? cfg.accentBg : 'bg-[#E7E5E4] ',
                                ].join(' ')}>
                                    <Icon className={`h-6 w-6 ${selected ? 'text-white' : 'text-[#1E2938]/40'}`} />
                                </div>

                                <div>
                                    <p className={`font-[family-name:var(--font-space-mono)] font-bold text-sm ${selected ? cfg.accentText : 'text-[#1E2938]'}`}>
                                        {cfg.label}
                                    </p>
                                    <p className={NEU_MUTED}>{cfg.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {hasError && (
                    <p className="flex items-center gap-1.5 text-sm font-[family-name:var(--font-space-mono)] text-[#FF2157]">
                        <X className="h-4 w-4" /> {String(errors.categories)}
                    </p>
                )}

                {selectedCategories.length === 0 && !hasError && (
                    <p className={`${NEU_MUTED} text-center pt-1`}>Select one or more categories to classify this tour</p>
                )}
            </div>
        </div>
    );
};

export default Step2Categories;