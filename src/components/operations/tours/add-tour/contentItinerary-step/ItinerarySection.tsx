"use client";

import { FieldArray, getIn, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO, ItineraryEntryDTO } from "@/types/tour/tour.types";
import { MEALS_PROVIDED, TRANSPORT_MODE } from "@/constants/tour/tour.const";
import {
    Plus,
    Trash2,
    ChevronDown,
    Calendar,
    UtensilsCrossed,
    Hotel,
    Navigation,
    Clock,
    Activity,
    AlertCircle,
    Plane,
} from "lucide-react";
import { useState } from "react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4]  border border-white/60";
const NEU_INPUT =
    "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BTN_PRIMARY =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006666] text-white text-sm " +
    "font-[family-name:var(--font-space-mono)] font-600 tracking-wide " +
    " " +
    "hover: hover:bg-[#007777] " +
    "active: " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
    "font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover: " +
    "active: " +
    "transition-all duration-200";
const NEU_BTN_DANGER =
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E7E5E4] text-[#FF2157] text-sm " +
    "font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover:bg-[#FF2157]/10 hover: " +
    "transition-all duration-200";
const NEU_BTN_ICON =
    "rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    " " +
    "hover:text-[#FF2157] hover: " +
    "transition-all duration-200";
const NEU_ICON_WELL_PRIMARY =
    "p-2.5 rounded-xl bg-[#006666]/10 ";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_CHIP_DEFAULT =
    "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-500 text-[#1E2938]/70 " +
    "bg-[#E7E5E4]  " +
    "hover: " +
    "cursor-pointer transition-all duration-200 select-none";
const NEU_CHIP_ACTIVE =
    "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-600 text-white " +
    "bg-[#006666]  " +
    "cursor-pointer transition-all duration-200 select-none";

const cardVariants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Collapsible day accordion
function DayAccordion({
    day,
    dayIndex,
    onRemove,
}: {
    day: ItineraryEntryDTO;
    dayIndex: number;
    onRemove: () => void;
}) {
    const { setFieldValue } = useFormikContext<CreateTourDTO>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { values, errors, touched } = useFormikContext<CreateTourDTO>();
    const [expanded, setExpanded] = useState(true);

    const getError = (fieldName: string) => {
        const error = getIn(errors, fieldName);
        const touch = getIn(touched, fieldName);
        return touch && error ? (error as string) : undefined;
    };

    return (
        <div className={`${NEU_CARD} overflow-hidden mb-4`}>
            {/* Accordion header */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-[#1E2938]/3 transition-colors duration-150`}
            >
                {/* Day badge */}
                <div className="min-w-[56px] px-2 py-1 rounded-xl bg-[#006666] text-white text-xs font-[family-name:var(--font-space-mono)] font-700 text-center ">
                    Day {day.day}
                </div>
                <div className="flex-1 text-left">
                    <p className="font-[family-name:var(--font-space-mono)] font-600 text-[#1E2938] text-sm">
                        {day.title || "Untitled Day"}
                    </p>
                    {day.description && (
                        <p className={`${NEU_MUTED} text-xs mt-0.5 truncate max-w-xs`}>
                            {day.description.substring(0, 60)}…
                        </p>
                    )}
                </div>
                {/* Stats chips */}
                <div className="hidden sm:flex items-center gap-2">
                    {day.activities && day.activities.length > 0 && (
                        <span className={NEU_CHIP_DEFAULT}>
                            {day.activities.length} act.
                        </span>
                    )}
                    {day.mealsProvided && day.mealsProvided.length > 0 && (
                        <span className={NEU_CHIP_DEFAULT}>
                            {day.mealsProvided.length} meals
                        </span>
                    )}
                </div>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-[#1E2938]/50" />
                </motion.div>
            </button>

            {/* Accordion body */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 border-t border-[#1E2938]/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Day number */}
                            <div>
                                <label className={`${NEU_LABEL} block mb-2`}>Day Number *</label>
                                <input
                                    type="number"
                                    className={NEU_INPUT}
                                    value={day.day || ""}
                                    onChange={(e) =>
                                        setFieldValue(`itinerary[${dayIndex}].day`, parseInt(e.target.value) || 1)
                                    }
                                />
                                {getError(`itinerary[${dayIndex}].day`) && (
                                    <p className="mt-1 text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">
                                        {getError(`itinerary[${dayIndex}].day`)}
                                    </p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className={`${NEU_LABEL} block mb-2`}>Day Title</label>
                                <input
                                    type="text"
                                    className={NEU_INPUT}
                                    placeholder="e.g. Arrival & City Tour"
                                    value={day.title || ""}
                                    onChange={(e) =>
                                        setFieldValue(`itinerary[${dayIndex}].title`, e.target.value)
                                    }
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className={`${NEU_LABEL} block mb-2`}>Description</label>
                                <textarea
                                    rows={3}
                                    className={`${NEU_INPUT} resize-none`}
                                    placeholder="Describe the day's plan..."
                                    value={day.description || ""}
                                    onChange={(e) =>
                                        setFieldValue(`itinerary[${dayIndex}].description`, e.target.value)
                                    }
                                />
                            </div>

                            {/* Meals */}
                            <div className={`${NEU_CARD_SM} p-4`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <UtensilsCrossed className="w-4 h-4 text-[#006666]" />
                                    <span className={NEU_LABEL}>Meals Provided</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(MEALS_PROVIDED).map((meal) => {
                                        const selected = day.mealsProvided?.includes(meal) ?? false;
                                        return (
                                            <button
                                                key={meal}
                                                type="button"
                                                className={selected ? NEU_CHIP_ACTIVE : NEU_CHIP_DEFAULT}
                                                onClick={() => {
                                                    const next = !selected
                                                        ? [...(day.mealsProvided ?? []), meal]
                                                        : (day.mealsProvided ?? []).filter((m: string) => m !== meal);
                                                    setFieldValue(`itinerary[${dayIndex}].mealsProvided`, next);
                                                }}
                                            >
                                                {meal}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Transport Mode */}
                            <div className={`${NEU_CARD_SM} p-4`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Plane className="w-4 h-4 text-[#006666]" />
                                    <span className={NEU_LABEL}>Transport Mode</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(TRANSPORT_MODE).map((mode) => {
                                        const selected = day.travelMode === mode;
                                        return (
                                            <button
                                                key={mode}
                                                type="button"
                                                className={selected ? NEU_CHIP_ACTIVE : NEU_CHIP_DEFAULT}
                                                onClick={() =>
                                                    setFieldValue(
                                                        `itinerary[${dayIndex}].travelMode`,
                                                        !selected ? mode : undefined
                                                    )
                                                }
                                            >
                                                {mode.replace("_", " ")}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Accommodation */}
                            <div>
                                <label className={`${NEU_LABEL} block mb-2`}>Accommodation</label>
                                <div className="relative">
                                    <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006666]/60" />
                                    <input
                                        type="text"
                                        className={`${NEU_INPUT} pl-9`}
                                        placeholder="Hotel / hostel name..."
                                        value={day.accommodation || ""}
                                        onChange={(e) =>
                                            setFieldValue(`itinerary[${dayIndex}].accommodation`, e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Travel Distance */}
                            <div>
                                <label className={`${NEU_LABEL} block mb-2`}>Travel Distance</label>
                                <div className="relative">
                                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006666]/60" />
                                    <input
                                        type="text"
                                        className={`${NEU_INPUT} pl-9`}
                                        placeholder="e.g. 120 km"
                                        value={day.travelDistance || ""}
                                        onChange={(e) =>
                                            setFieldValue(`itinerary[${dayIndex}].travelDistance`, e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Estimated Time */}
                            <div>
                                <label className={`${NEU_LABEL} block mb-2`}>Estimated Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006666]/60" />
                                    <input
                                        type="text"
                                        className={`${NEU_INPUT} pl-9`}
                                        placeholder="e.g. 8 hours"
                                        value={day.estimatedTime || ""}
                                        onChange={(e) =>
                                            setFieldValue(`itinerary[${dayIndex}].estimatedTime`, e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Activities */}
                            <div className="md:col-span-2">
                                <FieldArray name={`itinerary[${dayIndex}].activities`}>
                                    {({ push: pushActivity, remove: removeActivity }) => (
                                        <div className={`${NEU_CARD_SM} p-4`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Activity className="w-4 h-4 text-[#006666]" />
                                                <span className={NEU_LABEL}>Activities</span>
                                            </div>
                                            <AnimatePresence mode="popLayout">
                                                {day.activities?.map((activity: string, actIdx: number) => (
                                                    <motion.div
                                                        key={actIdx}
                                                        variants={cardVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        layout
                                                        className="flex items-center gap-2 mb-2"
                                                    >
                                                        <Activity className="w-4 h-4 text-[#006666]/50 flex-shrink-0" />
                                                        <input
                                                            type="text"
                                                            className={NEU_INPUT}
                                                            placeholder="Enter activity..."
                                                            value={activity}
                                                            onChange={(e) =>
                                                                setFieldValue(
                                                                    `itinerary[${dayIndex}].activities[${actIdx}]`,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <button
                                                            type="button"
                                                            className={NEU_BTN_ICON}
                                                            onClick={() => removeActivity(actIdx)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <button
                                                type="button"
                                                className={`${NEU_BTN_GHOST} mt-2 text-xs`}
                                                onClick={() => pushActivity("")}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Activity
                                            </button>
                                        </div>
                                    )}
                                </FieldArray>
                            </div>

                            {/* Important Notes */}
                            <div className="md:col-span-2">
                                <FieldArray name={`itinerary[${dayIndex}].importantNotes`}>
                                    {({ push: pushNote, remove: removeNote }) => (
                                        <div className={`${NEU_CARD_SM} p-4`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertCircle className="w-4 h-4 text-[#FE9900]" />
                                                <span className={NEU_LABEL}>Important Notes</span>
                                            </div>
                                            <AnimatePresence mode="popLayout">
                                                {day.importantNotes?.map((note: string, noteIdx: number) => (
                                                    <motion.div
                                                        key={noteIdx}
                                                        variants={cardVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        layout
                                                        className="flex items-start gap-2 mb-2"
                                                    >
                                                        <AlertCircle className="w-4 h-4 text-[#FE9900]/60 mt-2.5 flex-shrink-0" />
                                                        <textarea
                                                            rows={2}
                                                            className={`${NEU_INPUT} resize-none`}
                                                            placeholder="Important note..."
                                                            value={note}
                                                            onChange={(e) =>
                                                                setFieldValue(
                                                                    `itinerary[${dayIndex}].importantNotes[${noteIdx}]`,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <button
                                                            type="button"
                                                            className={NEU_BTN_ICON}
                                                            onClick={() => removeNote(noteIdx)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <button
                                                type="button"
                                                className={`${NEU_BTN_GHOST} mt-2 text-xs`}
                                                onClick={() => pushNote("")}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Note
                                            </button>
                                        </div>
                                    )}
                                </FieldArray>
                            </div>

                            {/* Remove day */}
                            <div className="md:col-span-2 flex justify-end">
                                <button type="button" className={NEU_BTN_DANGER} onClick={onRemove}>
                                    <Trash2 className="w-4 h-4" />
                                    Remove Day
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ItinerarySection() {
    const { values } = useFormikContext<CreateTourDTO>();

    return (
        <div className="col-span-12">
            <motion.div variants={itemVariants}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Calendar className="w-5 h-5 text-[#006666]" />
                    </div>
                    <div>
                        <h3 className={`${NEU_HEADING} text-base`}>Daily Itinerary</h3>
                        <p className={NEU_LABEL}>Plan each day of the tour</p>
                    </div>
                </div>

                {/* Days list */}
                <FieldArray name="itinerary">
                    {({ push, remove }) => (
                        <div>
                            <AnimatePresence mode="popLayout">
                                {values.itinerary?.map((day, dayIndex) => (
                                    <motion.div
                                        key={dayIndex}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        layout
                                    >
                                        <DayAccordion
                                            day={day}
                                            dayIndex={dayIndex}
                                            onRemove={() => remove(dayIndex)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add day */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <button
                                    type="button"
                                    className={`${NEU_BTN_PRIMARY} mt-2`}
                                    onClick={() =>
                                        push({
                                            day: (values.itinerary?.length || 0) + 1,
                                            title: "",
                                            description: "",
                                            mealsProvided: [],
                                            accommodation: "",
                                            activities: [],
                                            travelDistance: "",
                                            travelMode: undefined,
                                            estimatedTime: "",
                                            importantNotes: [],
                                        })
                                    }
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Day
                                </button>
                            </motion.div>
                        </div>
                    )}
                </FieldArray>
            </motion.div>
        </div>
    );
}