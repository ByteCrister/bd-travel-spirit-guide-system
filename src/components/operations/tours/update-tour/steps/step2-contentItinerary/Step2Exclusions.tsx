'use client';

import { ExclusionDTO, UpdateTourContentItineraryDTO } from '@/types/tour/tour.types';
import { useFormikContext } from 'formik';
import { Plus, Trash2, XCircle } from 'lucide-react';

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE_INSET = 'bg-[#E7E5E4] ';
const NEU_INPUT = 'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] text-sm  border-none focus:outline-none focus:ring-2 focus:ring-[#FF2157]/40 transition-all duration-200 px-3 h-11';
const NEU_TEXTAREA = 'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] text-sm  border-none focus:outline-none focus:ring-2 focus:ring-[#FF2157]/40 transition-all duration-200 px-3 py-2.5 resize-none';
const NEU_BTN_DANGER = 'w-full rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide  hover: hover:bg-[#e0001e] active: transition-all duration-200 h-12 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50';
const NEU_BTN_ICON_DANGER = 'h-8 w-8 rounded-xl flex items-center justify-center bg-[#E7E5E4] text-[#FF2157]/60  hover:text-[#FF2157] hover: opacity-0 group-hover:opacity-100 transition-all duration-200';
const NEU_HEADING = 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL = 'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED = 'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_BADGE_DANGER = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FF2157]/10 text-[#FF2157] ';
// ─────────────────────────────────────────────────────────────

export default function Step2Exclusions() {
    const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();

    const addExclusion = () => {
        const newExclusion: ExclusionDTO = { label: '', description: '' };
        setFieldValue('exclusions', [...(values.exclusions || []), newExclusion]);
    };

    const removeExclusion = (index: number) => {
        const updated = [...(values.exclusions || [])];
        updated.splice(index, 1);
        setFieldValue('exclusions', updated);
    };

    const updateExclusion = (index: number, field: keyof ExclusionDTO, value: string) => {
        const updated = [...(values.exclusions || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFieldValue('exclusions', updated);
    };

    const exclusions = values.exclusions || [];

    return (
        <div className="space-y-5">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#E7E5E4] ">
                        <XCircle className="h-4 w-4 text-[#FF2157]" />
                    </div>
                    <div>
                        <h3 className={`${NEU_HEADING} text-base`}>Exclusions</h3>
                        <p className={`${NEU_MUTED} mt-0.5`}>Specify what&apos;s not included in the tour package</p>
                    </div>
                </div>
                <span className={NEU_BADGE_DANGER}>
                    {exclusions.length} {exclusions.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Empty state */}
            {exclusions.length === 0 && (
                <div className={`${NEU_SURFACE_INSET} rounded-2xl flex flex-col items-center justify-center py-14 border-2 border-dashed border-[#1E2938]/10`}>
                    <div className="p-4 rounded-2xl bg-[#E7E5E4]  mb-4">
                        <XCircle className="h-7 w-7 text-[#FF2157]/50" />
                    </div>
                    <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]/50">No exclusions added yet</p>
                    <p className={`${NEU_MUTED} mt-1`}>Add items that are not covered in your tour</p>
                </div>
            )}

            {/* Exclusion cards */}
            {exclusions.length > 0 && (
                <div className="space-y-3">
                    {exclusions.map((exclusion, index) => (
                        <div
                            key={index}
                            className="group relative rounded-xl bg-[#E7E5E4]  border border-white/60 overflow-hidden"
                        >
                            {/* Red left accent bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF2157] rounded-l-xl" />

                            <div className="pl-5 pr-5 pt-4 pb-5 space-y-4">
                                {/* Card header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-lg bg-[#FF2157]/10 flex items-center justify-center ">
                                            <XCircle className="h-3.5 w-3.5 text-[#FF2157]" />
                                        </div>
                                        <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                                            Exclusion #{index + 1}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeExclusion(index)}
                                        className={NEU_BTN_ICON_DANGER}
                                        aria-label={`Remove exclusion ${index + 1}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Fields */}
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label htmlFor={`exclusion-${index}-label`} className={NEU_LABEL}>Label</label>
                                        <input
                                            id={`exclusion-${index}-label`}
                                            className={NEU_INPUT}
                                            placeholder="e.g., International Flights, Travel Insurance"
                                            value={exclusion.label}
                                            onChange={(e) => updateExclusion(index, 'label', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor={`exclusion-${index}-description`} className={NEU_LABEL}>Description</label>
                                        <textarea
                                            id={`exclusion-${index}-description`}
                                            className={NEU_TEXTAREA}
                                            placeholder="Explain what's not covered and why..."
                                            value={exclusion.description}
                                            onChange={(e) => updateExclusion(index, 'description', e.target.value)}
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
            <button type="button" onClick={addExclusion} className={NEU_BTN_DANGER}>
                <Plus className="h-5 w-5" />
                Add Exclusion
            </button>
        </div>
    );
}