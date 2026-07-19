"use client";

import { AUDIENCE_TYPE, AudienceType } from '@/constants/tour/tour.const';
import { UpdateTourContentItineraryDTO } from '@/types/tour/tour.types';
import { useFormikContext } from 'formik';
import {
    Users, Check, X, User, UserPlus, Heart, Briefcase, MapPin
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

const AUDIENCE_CONFIG: Record<string, {
    label: string; icon: IconType; accentBg: string;
    accentText: string; accentBorder: string; description: string;
}> = {
    [AUDIENCE_TYPE.FAMILIES]: { label: 'Families', icon: Users, accentBg: 'bg-blue-500', accentText: 'text-blue-600', accentBorder: 'border-blue-400', description: 'Perfect for family trips' },
    [AUDIENCE_TYPE.COUPLES]: { label: 'Couples', icon: Heart, accentBg: 'bg-pink-500', accentText: 'text-pink-600', accentBorder: 'border-pink-400', description: 'Romantic getaways' },
    [AUDIENCE_TYPE.SOLO]: { label: 'Solo Travelers', icon: User, accentBg: 'bg-purple-500', accentText: 'text-purple-600', accentBorder: 'border-purple-400', description: 'Individual adventurers' },
    [AUDIENCE_TYPE.GROUPS]: { label: 'Groups', icon: UserPlus, accentBg: 'bg-green-500', accentText: 'text-green-600', accentBorder: 'border-green-400', description: 'Group activities' },
    [AUDIENCE_TYPE.SENIORS]: { label: 'Seniors', icon: Users, accentBg: 'bg-amber-500', accentText: 'text-amber-600', accentBorder: 'border-amber-400', description: 'Comfort-focused tours' },
    [AUDIENCE_TYPE.BUSINESS]: { label: 'Business', icon: Briefcase, accentBg: 'bg-slate-600', accentText: 'text-slate-600', accentBorder: 'border-slate-400', description: 'Corporate & business travel' },
    [AUDIENCE_TYPE.ADVENTURE]: { label: 'Adventure', icon: MapPin, accentBg: 'bg-red-600', accentText: 'text-red-600', accentBorder: 'border-red-400', description: 'Thrill-seeking experiences' },
};

const Step2Audience = () => {
    const formik = useFormikContext<UpdateTourContentItineraryDTO>();

    const toggleAudience = (audience: AudienceType) => {
        const current = formik.values.audience || [];
        formik.setFieldValue('audience',
            current.includes(audience) ? current.filter((a: string) => a !== audience) : [...current, audience]
        );
    };

    const clearAll = () => formik.setFieldValue('audience', []);

    const selectedAudiences = formik.values.audience || [];
    const hasError = formik.touched.audience && formik.errors.audience;
    const audienceOptions = Object.values(AUDIENCE_TYPE);

    return (
        <div className={`${NEU_CARD} ${hasError ? 'ring-2 ring-[#FF2157]/50' : ''} overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-5 border-b ${NEU_DIVIDER}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={NEU_ICON_WELL}>
                            <Users className="w-4 h-4 text-[#006666]" />
                        </div>
                        <div>
                            <h3 className={`${NEU_HEADING} text-base`}>Target Audience</h3>
                            <p className={`${NEU_MUTED} mt-0.5`}>Select who this tour is designed for</p>
                        </div>
                    </div>
                    {selectedAudiences.length > 0 && (
                        <span className={NEU_BADGE_PRIMARY}>{selectedAudiences.length} selected</span>
                    )}
                </div>
            </div>

            <div className="px-6 py-5 space-y-5">
                {/* Selected summary strip */}
                {selectedAudiences.length > 0 && (
                    <div className={`${NEU_SURFACE_INSET} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={NEU_LABEL}>Selected</span>
                            <button type="button" onClick={clearAll} className={NEU_BTN_DANGER_SM}>
                                <X className="h-3 w-3" /> Clear all
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedAudiences.map((aud: string) => {
                                const cfg = AUDIENCE_CONFIG[aud] || { label: aud, icon: Users, accentBg: 'bg-gray-500', accentText: 'text-gray-600' };
                                const Icon = cfg.icon;
                                return (
                                    <span key={aud} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#E7E5E4]  text-[#1E2938]">
                                        <Icon className="h-3 w-3" /> {cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Selection grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {audienceOptions.map((val) => {
                        const cfg = AUDIENCE_CONFIG[val] || { label: val, icon: Users, accentBg: 'bg-gray-500', accentText: 'text-gray-600', accentBorder: 'border-gray-400', description: '' };
                        const Icon = cfg.icon;
                        const selected = selectedAudiences.includes(val);

                        return (
                            <button
                                key={val}
                                type="button"
                                onClick={() => toggleAudience(val)}
                                className={[
                                    'relative p-4 rounded-xl text-left transition-all duration-200',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50',
                                    selected
                                        ? `bg-[#E7E5E4]  border-2 ${cfg.accentBorder}`
                                        : 'bg-[#E7E5E4]  border-2 border-transparent hover: hover:-translate-y-0.5',
                                ].join(' ')}
                            >
                                {/* Checkmark indicator */}
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

                {/* Error */}
                {hasError && (
                    <p className="flex items-center gap-1.5 text-sm font-[family-name:var(--font-space-mono)] text-[#FF2157]">
                        <X className="h-4 w-4" /> {String(formik.errors.audience)}
                    </p>
                )}

                {/* Helper */}
                {selectedAudiences.length === 0 && !hasError && (
                    <p className={`${NEU_MUTED} text-center pt-1`}>Select one or more target audiences for this tour</p>
                )}
            </div>
        </div>
    );
};

export default Step2Audience;