'use client';

import { DIFFICULTY_LEVEL, DifficultyLevel } from '@/constants/tour/tour.const';
import { useFormikContext } from 'formik';
import { UpdateTourContentItineraryDTO } from '@/types/tour/tour.types';
import { Mountain, Leaf, MountainIcon, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_CARD = 'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_CARD_SM = 'rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60';
const NEU_SURFACE_INSET = 'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_INPUT = 'rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] text-sm shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 px-3 h-11 w-full';
const NEU_HEADING = 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_MUTED = 'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_DIVIDER = 'border-[#1E2938]/10';
const NEU_ICON_WELL = 'p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]';
// ─────────────────────────────────────────────────────────────

interface DifficultyConfig {
    label: string;
    accentBg: string;
    accentText: string;
    dotColor: string;
    icon: React.ReactNode;
    description: string;
    details: string[];
}

const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
    [DIFFICULTY_LEVEL.EASY]: {
        label: 'Easy',
        accentBg: 'bg-green-500',
        accentText: 'text-green-600',
        dotColor: 'bg-green-500',
        icon: <Leaf className="h-4 w-4" />,
        description: 'Suitable for beginners and families',
        details: [
            'Flat terrain with minimal elevation gain',
            'Suitable for all ages and fitness levels',
            'Typically involves walking on paved or well-maintained paths',
        ],
    },
    [DIFFICULTY_LEVEL.MODERATE]: {
        label: 'Moderate',
        accentBg: 'bg-blue-500',
        accentText: 'text-blue-600',
        dotColor: 'bg-blue-500',
        icon: <MountainIcon className="h-4 w-4" />,
        description: 'Some physical effort required',
        details: [
            'May include some hills or uneven terrain',
            'Requires basic level of fitness',
            'Suitable for most active travelers',
        ],
    },
    [DIFFICULTY_LEVEL.CHALLENGING]: {
        label: 'Challenging',
        accentBg: 'bg-yellow-500',
        accentText: 'text-yellow-600',
        dotColor: 'bg-yellow-500',
        icon: <Activity className="h-4 w-4" />,
        description: 'Requires good physical fitness',
        details: [
            'Significant elevation changes and uneven terrain',
            'Requires good physical condition',
            'May involve longer distances or time commitments',
        ],
    },
};

function Step2Difficulty() {
    const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();
    const difficultyLevels = Object.values(DIFFICULTY_LEVEL) as DIFFICULTY_LEVEL[];
    const currentCfg = values.difficulty ? DIFFICULTY_CONFIG[values.difficulty] : null;
    const selectedIndex = values.difficulty ? difficultyLevels.indexOf(values.difficulty as DIFFICULTY_LEVEL) : -1;

    const handleDifficultyChange = (value: string) => {
        setFieldValue('difficulty', value as DifficultyLevel);
    };

    return (
        <div className={`${NEU_CARD} overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-5 border-b ${NEU_DIVIDER}`}>
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL}>
                        <Mountain className="w-4 h-4 text-[#006666]" />
                    </div>
                    <div>
                        <h3 className={`${NEU_HEADING} text-base`}>Difficulty Level</h3>
                        <p className={`${NEU_MUTED} mt-0.5`}>Select the physical difficulty of this tour</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-5 space-y-5">
                {/* Select */}
                <div>
                    <Select value={values.difficulty || ''} onValueChange={handleDifficultyChange}>
                        <SelectTrigger className={`${NEU_INPUT} !h-12`}>
                            <SelectValue placeholder="Choose difficulty level" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#E7E5E4] border border-white/60 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] rounded-xl">
                            {difficultyLevels.map((level) => {
                                const cfg = DIFFICULTY_CONFIG[level];
                                return (
                                    <SelectItem key={level} value={level} className="focus:bg-[#006666]/10 rounded-lg">
                                        <div className="flex items-center gap-3 py-1">
                                            <div className={`w-8 h-8 rounded-xl ${cfg?.accentBg} flex items-center justify-center text-white shadow-[2px_2px_4px_rgba(0,0,0,0.15)]`}>
                                                {cfg?.icon}
                                            </div>
                                            <div>
                                                <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm capitalize text-[#1E2938]">{level}</p>
                                                <p className={NEU_MUTED}>{cfg?.description}</p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Selected display */}
                {values.difficulty && currentCfg && (
                    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
                        {/* Selected badge row */}
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl ${currentCfg.accentBg} flex items-center justify-center text-white shadow-[2px_2px_5px_rgba(0,0,0,0.15)]`}>
                                {currentCfg.icon}
                            </div>
                            <div>
                                <p className={`font-[family-name:var(--font-space-mono)] font-bold ${currentCfg.accentText} capitalize`}>
                                    {values.difficulty}
                                </p>
                                <p className={NEU_MUTED}>{currentCfg.description}</p>
                            </div>
                        </div>

                        {/* Progress dots */}
                        <div className="flex items-center gap-2">
                            {difficultyLevels.map((level, i) => {
                                const cfg = DIFFICULTY_CONFIG[level];
                                const filled = selectedIndex >= i;
                                return (
                                    <div key={level} className="flex items-center">
                                        <div className={[
                                            'h-3 w-3 rounded-full transition-all duration-300',
                                            filled ? cfg?.dotColor : 'bg-[#E7E5E4] shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]',
                                        ].join(' ')} />
                                        {i < difficultyLevels.length - 1 && (
                                            <div className={`h-1 w-8 transition-all duration-300 ${filled ? cfg?.dotColor + ' opacity-40' : 'bg-[#E7E5E4] shadow-[inset_1px_1px_2px_#c8c6c5]'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Detail bullets */}
                        <div className={`${NEU_SURFACE_INSET} rounded-xl p-4 border-t ${NEU_DIVIDER} space-y-2`}>
                            {currentCfg.details.map((d, i) => (
                                <p key={i} className={`${NEU_MUTED} flex items-center gap-2`}>
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentCfg.dotColor}`} />
                                    {d}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!values.difficulty && (
                    <div className={`${NEU_SURFACE_INSET} rounded-xl p-5 flex items-center gap-3`}>
                        <Mountain className="h-5 w-5 text-[#1E2938]/30 flex-shrink-0" />
                        <div>
                            <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]/50">No difficulty level selected</p>
                            <p className={`${NEU_MUTED} mt-0.5`}>Select a difficulty level above to help travelers understand the physical requirements.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Step2Difficulty;