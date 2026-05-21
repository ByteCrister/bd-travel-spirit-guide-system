'use client';

import { InclusionDTO, UpdateTourContentItineraryDTO } from '@/types/tour/tour.types';
import { useFormikContext } from 'formik';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE_INSET = 'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_INPUT = 'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] text-sm shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 px-3 h-11';
const NEU_TEXTAREA = 'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] text-sm shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 px-3 py-2.5 resize-none';
const NEU_BTN_PRIMARY = 'w-full rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] transition-all duration-200 h-12 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50';
const NEU_BTN_ICON_DANGER = 'h-8 w-8 rounded-xl flex items-center justify-center bg-[#E7E5E4] text-[#FF2157]/60 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] hover:text-[#FF2157] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] opacity-0 group-hover:opacity-100 transition-all duration-200';
const NEU_HEADING = 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL = 'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED = 'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_BADGE_PRIMARY = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';
// ─────────────────────────────────────────────────────────────

export default function Step2Inclusions() {
    const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();

    const addInclusion = () => {
        const newInclusion: InclusionDTO = { label: '', description: '' };
        setFieldValue('inclusions', [...(values.inclusions || []), newInclusion]);
    };

    const removeInclusion = (index: number) => {
        const updated = [...(values.inclusions || [])];
        updated.splice(index, 1);
        setFieldValue('inclusions', updated);
    };

    const updateInclusion = (index: number, field: keyof InclusionDTO, value: string) => {
        const updated = [...(values.inclusions || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFieldValue('inclusions', updated);
    };

    const inclusions = values.inclusions || [];

    return (
        <div className="space-y-5">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                        <CheckCircle2 className="h-4 w-4 text-[#00A63D]" />
                    </div>
                    <div>
                        <h3 className={`${NEU_HEADING} text-base`}>Inclusions</h3>
                        <p className={`${NEU_MUTED} mt-0.5`}>Add what&apos;s included in the tour package</p>
                    </div>
                </div>
                <span className={NEU_BADGE_PRIMARY}>
                    {inclusions.length} {inclusions.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Empty state */}
            {inclusions.length === 0 && (
                <div className={`${NEU_SURFACE_INSET} rounded-2xl flex flex-col items-center justify-center py-14 border-2 border-dashed border-[#1E2938]/10`}>
                    <div className="p-4 rounded-2xl bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] mb-4">
                        <CheckCircle2 className="h-7 w-7 text-[#00A63D]/50" />
                    </div>
                    <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]/50">No inclusions added yet</p>
                    <p className={`${NEU_MUTED} mt-1`}>Start by adding what&apos;s included in your tour</p>
                </div>
            )}

            {/* Inclusion cards */}
            {inclusions.length > 0 && (
                <div className="space-y-3">
                    {inclusions.map((inclusion, index) => (
                        <div
                            key={index}
                            className="group relative rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60 overflow-hidden"
                        >
                            {/* Green left accent bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A63D] rounded-l-xl" />

                            <div className="pl-5 pr-5 pt-4 pb-5 space-y-4">
                                {/* Card header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-lg bg-[#00A63D]/10 flex items-center justify-center shadow-[inset_1px_1px_3px_#c8c6c5]">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-[#00A63D]" />
                                        </div>
                                        <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                                            Inclusion #{index + 1}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeInclusion(index)}
                                        className={NEU_BTN_ICON_DANGER}
                                        aria-label={`Remove inclusion ${index + 1}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Fields */}
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label htmlFor={`inclusion-${index}-label`} className={NEU_LABEL}>Label</label>
                                        <input
                                            id={`inclusion-${index}-label`}
                                            className={NEU_INPUT}
                                            placeholder="e.g., Hotel Accommodation, Airport Transfer"
                                            value={inclusion.label}
                                            onChange={(e) => updateInclusion(index, 'label', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor={`inclusion-${index}-description`} className={NEU_LABEL}>Description</label>
                                        <textarea
                                            id={`inclusion-${index}-description`}
                                            className={NEU_TEXTAREA}
                                            placeholder="Provide detailed information about this inclusion..."
                                            value={inclusion.description}
                                            onChange={(e) => updateInclusion(index, 'description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add button */}
            <button type="button" onClick={addInclusion} className={NEU_BTN_PRIMARY}>
                <Plus className="h-5 w-5" />
                Add Inclusion
            </button>
        </div>
    );
}