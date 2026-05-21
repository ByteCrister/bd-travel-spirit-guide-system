"use client";

import { useFormikContext } from "formik";
import { motion } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { AUDIENCE_TYPE } from "@/constants/tour/tour.const";
import { Users } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_ICON_WELL_PRIMARY =
    "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_CHIP_DEFAULT =
    "inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-500 text-[#1E2938]/70 " +
    "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "cursor-pointer transition-all duration-200 select-none";
const NEU_CHIP_ACTIVE =
    "inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-600 text-white " +
    "bg-[#006666] shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] " +
    "cursor-pointer transition-all duration-200 select-none";

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AudienceSection() {
    const { values, setFieldValue } = useFormikContext<CreateTourDTO>();

    return (
        <div className="col-span-12">
            <motion.div variants={itemVariants}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Users className="w-4 h-4 text-[#006666]" />
                    </div>
                    <div>
                        <h3 className={`${NEU_HEADING} text-base`}>Target Audience</h3>
                        <p className={NEU_LABEL}>Who is this tour designed for?</p>
                    </div>
                </div>

                {/* Card */}
                <div className={`${NEU_CARD} p-5`}>
                    <div className="flex flex-wrap gap-2.5">
                        {Object.values(AUDIENCE_TYPE).map((audience) => {
                            const isActive = values.audience?.includes(audience);
                            return (
                                <motion.button
                                    key={audience}
                                    type="button"
                                    whileTap={{ scale: 0.96 }}
                                    className={isActive ? NEU_CHIP_ACTIVE : NEU_CHIP_DEFAULT}
                                    onClick={() => {
                                        const next = !isActive
                                            ? [...(values.audience || []), audience]
                                            : (values.audience || []).filter((a) => a !== audience);
                                        setFieldValue("audience", next);
                                    }}
                                >
                                    {audience}
                                </motion.button>
                            );
                        })}
                    </div>

                    {values.audience && values.audience.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 pt-3 border-t border-[#1E2938]/10"
                        >
                            <p className={`${NEU_LABEL} mb-0`}>
                                {values.audience.length} audience type
                                {values.audience.length > 1 ? "s" : ""} selected
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}