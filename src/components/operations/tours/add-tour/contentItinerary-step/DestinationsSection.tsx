"use client";

import { FieldArray, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO, ActivityDTO, AttractionDTO } from "@/types/tour/tour.types";
import { CURRENCY } from "@/constants/tour/tour.const";
import {
  MapPin,
  Plus,
  Trash2,
  ChevronDown,
  Map,
  Activity,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { MapPickerDialog } from "@/components/global/MapPickerDialog";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_SELECT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 appearance-none";
const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006666] text-white text-sm " +
  "font-[family-name:var(--font-space-mono)] font-600 tracking-wide " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none";
const NEU_BTN_GHOST =
  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";
const NEU_BTN_DANGER =
  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E7E5E4] text-[#FF2157] text-sm " +
  "font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";
const NEU_BTN_ICON =
  "rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";
const NEU_BTN_MAP =
  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#006666]/10 text-[#006666] text-xs " +
  "font-[family-name:var(--font-space-mono)] font-600 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_BADGE =
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-600 " +
  "bg-[#E7E5E4] text-[#1E2938]/70 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ── Sub-section: Highlights ───────────────────────────────────
function HighlightsSubSection({ destIndex }: { destIndex: number }) {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();
  const destination = values.destinations?.[destIndex];

  return (
    <div className={`${NEU_CARD_SM} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#006666]" />
        <span className={NEU_LABEL}>Highlights</span>
      </div>
      <FieldArray name={`destinations[${destIndex}].highlights`}>
        {({ push, remove }) => (
          <div>
            <AnimatePresence mode="popLayout">
              {destination?.highlights?.map((highlight: string, idx: number) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="flex items-center gap-2 mb-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00A63D]/60 flex-shrink-0" />
                  <input
                    type="text"
                    className={NEU_INPUT}
                    placeholder="Enter highlight..."
                    value={highlight}
                    onChange={(e) =>
                      setFieldValue(
                        `destinations[${destIndex}].highlights[${idx}]`,
                        e.target.value
                      )
                    }
                  />
                  <button type="button" className={NEU_BTN_ICON} onClick={() => remove(idx)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              type="button"
              className={`${NEU_BTN_GHOST} text-xs mt-1`}
              onClick={() => push("")}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Highlight
            </button>
          </div>
        )}
      </FieldArray>
    </div>
  );
}

// ── Sub-section: Attractions ──────────────────────────────────
function AttractionsSubSection({
  destIndex,
  onOpenMapPicker,
}: {
  destIndex: number;
  onOpenMapPicker: (dIdx: number, aIdx: number) => void;
}) {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();
  const destination = values.destinations?.[destIndex];
  const [expandedAttr, setExpandedAttr] = useState<number | null>(null);

  return (
    <div className={`${NEU_CARD_SM} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-[#006666]" />
        <span className={NEU_LABEL}>Attractions</span>
      </div>
      <FieldArray name={`destinations[${destIndex}].attractions`}>
        {({ push, remove }) => (
          <div>
            <AnimatePresence mode="popLayout">
              {destination?.attractions?.map((attr: AttractionDTO, attrIdx: number) => (
                <motion.div
                  key={attrIdx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="mb-2"
                >
                  <div className={`${NEU_CARD_SM} overflow-hidden`}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#1E2938]/3 transition-colors"
                      onClick={() => setExpandedAttr(expandedAttr === attrIdx ? null : attrIdx)}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#006666]/60" />
                      <span className="flex-1 text-left text-sm font-[family-name:var(--font-space-mono)] font-500 text-[#1E2938]">
                        {attr.title || `Attraction ${attrIdx + 1}`}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#1E2938]/40 transition-transform duration-200 ${expandedAttr === attrIdx ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expandedAttr === attrIdx && (
                      <div className="px-3 pb-3 border-t border-[#1E2938]/10 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className={`${NEU_LABEL} block mb-1`}>Title</label>
                          <input type="text" className={NEU_INPUT} placeholder="Attraction name" value={attr.title || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].attractions[${attrIdx}].title`, e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={`${NEU_LABEL} block mb-1`}>Description</label>
                          <textarea rows={2} className={`${NEU_INPUT} resize-none`} value={attr.description || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].attractions[${attrIdx}].description`, e.target.value)} />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Address</label>
                          <input type="text" className={NEU_INPUT} value={attr.address || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].attractions[${attrIdx}].address`, e.target.value)} />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Opening Hours</label>
                          <input type="text" className={NEU_INPUT} placeholder="e.g. 9am–6pm" value={attr.openingHours || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].attractions[${attrIdx}].openingHours`, e.target.value)} />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Latitude</label>
                          <input type="number" className={NEU_INPUT} value={attr.coordinates?.lat || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].attractions[${attrIdx}].coordinates.lat`, parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Longitude</label>
                          <input type="number" className={NEU_INPUT} value={attr.coordinates?.lng || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].attractions[${attrIdx}].coordinates.lng`, parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-2 flex-wrap">
                          <button type="button" className={NEU_BTN_MAP} onClick={() => onOpenMapPicker(destIndex, attrIdx)}>
                            <MapPin className="w-3.5 h-3.5" />
                            Pick on Map
                          </button>
                          <button type="button" className={NEU_BTN_DANGER} onClick={() => remove(attrIdx)}>
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              type="button"
              className={`${NEU_BTN_GHOST} text-xs mt-1`}
              onClick={() => push({ title: "", coordinates: { lat: 0, lng: 0 } })}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Attraction
            </button>
          </div>
        )}
      </FieldArray>
    </div>
  );
}

// ── Sub-section: Activities ───────────────────────────────────
function ActivitiesSubSection({ destIndex }: { destIndex: number }) {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();
  const destination = values.destinations?.[destIndex];
  const [expandedAct, setExpandedAct] = useState<number | null>(null);

  return (
    <div className={`${NEU_CARD_SM} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-[#006666]" />
        <span className={NEU_LABEL}>Activities</span>
      </div>
      <FieldArray name={`destinations[${destIndex}].activities`}>
        {({ push, remove }) => (
          <div>
            <AnimatePresence mode="popLayout">
              {destination?.activities?.map((activity: ActivityDTO, actIdx: number) => (
                <motion.div key={actIdx} variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout className="mb-2">
                  <div className={`${NEU_CARD_SM} overflow-hidden`}>
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#1E2938]/3 transition-colors" onClick={() => setExpandedAct(expandedAct === actIdx ? null : actIdx)}>
                      <Activity className="w-3.5 h-3.5 text-[#006666]/60" />
                      <span className="flex-1 text-left text-sm font-[family-name:var(--font-space-mono)] font-500 text-[#1E2938]">
                        {activity.title || `Activity ${actIdx + 1}`}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#1E2938]/40 transition-transform duration-200 ${expandedAct === actIdx ? "rotate-180" : ""}`} />
                    </button>
                    {expandedAct === actIdx && (
                      <div className="px-3 pb-3 border-t border-[#1E2938]/10 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className={`${NEU_LABEL} block mb-1`}>Title</label>
                          <input type="text" className={NEU_INPUT} value={activity.title || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].activities[${actIdx}].title`, e.target.value)} />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Provider</label>
                          <input type="text" className={NEU_INPUT} value={activity.provider || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].activities[${actIdx}].provider`, e.target.value)} />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Duration</label>
                          <input type="text" className={NEU_INPUT} placeholder="e.g. 2 hours" value={activity.duration || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].activities[${actIdx}].duration`, e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={`${NEU_LABEL} block mb-1`}>URL</label>
                          <input type="text" className={NEU_INPUT} placeholder="https://..." value={activity.url || ""} onChange={(e) => setFieldValue(`destinations[${destIndex}].activities[${actIdx}].url`, e.target.value)} />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Price Amount</label>
                          <input
                            type="number"
                            className={NEU_INPUT}
                            value={activity.price?.amount || ""}
                            onChange={(e) => {
                              const amount = parseFloat(e.target.value);
                              const curr = activity.price || { amount: 0, currency: CURRENCY.BDT };
                              setFieldValue(`destinations[${destIndex}].activities[${actIdx}].price`, { ...curr, amount: isNaN(amount) ? 0 : amount });
                            }}
                          />
                        </div>
                        <div>
                          <label className={`${NEU_LABEL} block mb-1`}>Currency</label>
                          <div className="relative">
                            <select
                              className={NEU_SELECT}
                              value={activity.price?.currency || CURRENCY.BDT}
                              onChange={(e) => {
                                const curr = activity.price || { amount: 0, currency: CURRENCY.BDT };
                                setFieldValue(`destinations[${destIndex}].activities[${actIdx}].price`, { ...curr, currency: e.target.value });
                              }}
                            >
                              <option value={CURRENCY.USD}>USD ($)</option>
                              <option value={CURRENCY.INR}>INR (₹)</option>
                              <option value={CURRENCY.BDT}>BDT (৳)</option>
                              <option value="CNY">CNY (¥)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E2938]/40 pointer-events-none" />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <button type="button" className={NEU_BTN_DANGER} onClick={() => remove(actIdx)}>
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Activity
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button type="button" className={`${NEU_BTN_GHOST} text-xs mt-1`} onClick={() => push({ title: "" })}>
              <Plus className="w-3.5 h-3.5" />
              Add Activity
            </button>
          </div>
        )}
      </FieldArray>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function DestinationsSection() {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();

  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState<number | null>(null);
  const [currentAttractionIndex, setCurrentAttractionIndex] = useState<{ destinationIndex: number; attractionIndex: number } | null>(null);
  const [mapPickerType, setMapPickerType] = useState<"destination" | "attraction">("destination");
  const [expandedDest, setExpandedDest] = useState<number | null>(null);

  const getInitialPosition = (): [number, number] | undefined => {
    if (mapPickerType === "destination" && currentDestinationIndex !== null) {
      const d = values.destinations?.[currentDestinationIndex];
      const lat = d?.coordinates?.lat;
      const lng = d?.coordinates?.lng;
      if (typeof lat !== "number" || isNaN(lat) || lat < -90 || lat > 90) return undefined;
      if (typeof lng !== "number" || isNaN(lng) || lng < -180 || lng > 180) return undefined;
      return [lat, lng];
    }
    if (mapPickerType === "attraction" && currentAttractionIndex !== null) {
      const { destinationIndex, attractionIndex } = currentAttractionIndex;
      const a = values.destinations?.[destinationIndex]?.attractions?.[attractionIndex];
      const lat = a?.coordinates?.lat;
      const lng = a?.coordinates?.lng;
      if (typeof lat !== "number" || isNaN(lat) || lat < -90 || lat > 90) return undefined;
      if (typeof lng !== "number" || isNaN(lng) || lng < -180 || lng > 180) return undefined;
      return [lat, lng];
    }
    return undefined;
  };

  const handleMapSelect = (lat: number, lng: number) => {
    if (mapPickerType === "destination" && currentDestinationIndex !== null) {
      setFieldValue(`destinations[${currentDestinationIndex}].coordinates.lat`, lat);
      setFieldValue(`destinations[${currentDestinationIndex}].coordinates.lng`, lng);
    } else if (mapPickerType === "attraction" && currentAttractionIndex !== null) {
      const { destinationIndex, attractionIndex } = currentAttractionIndex;
      setFieldValue(`destinations[${destinationIndex}].attractions[${attractionIndex}].coordinates.lat`, lat);
      setFieldValue(`destinations[${destinationIndex}].attractions[${attractionIndex}].coordinates.lng`, lng);
    }
    setMapPickerOpen(false);
  };

  const openDestinationMapPicker = (index: number) => {
    setCurrentDestinationIndex(index);
    setCurrentAttractionIndex(null);
    setMapPickerType("destination");
    setMapPickerOpen(true);
  };

  const openAttractionMapPicker = (destinationIndex: number, attractionIndex: number) => {
    setCurrentDestinationIndex(null);
    setCurrentAttractionIndex({ destinationIndex, attractionIndex });
    setMapPickerType("attraction");
    setMapPickerOpen(true);
  };

  return (
    <>
      <div className="col-span-12">
        <motion.div variants={itemVariants}>
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={NEU_ICON_WELL_PRIMARY}>
              <MapPin className="w-5 h-5 text-[#006666]" />
            </div>
            <div>
              <h3 className={`${NEU_HEADING} text-base`}>Destinations</h3>
              <p className={NEU_LABEL}>Add all stops on this tour route</p>
            </div>
          </div>

          {/* Destinations list */}
          <FieldArray name="destinations">
            {({ push, remove }) => (
              <div>
                <AnimatePresence mode="popLayout">
                  {values.destinations?.map((destination, index) => (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="mb-4"
                    >
                      <div className={`${NEU_CARD} overflow-hidden`}>
                        {/* Destination header */}
                        <button
                          type="button"
                          onClick={() => setExpandedDest(expandedDest === index ? null : index)}
                          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#1E2938]/3 transition-colors duration-150"
                        >
                          <div className="min-w-[36px] h-9 flex items-center justify-center rounded-xl bg-[#006666] text-white text-sm font-[family-name:var(--font-space-mono)] font-700 shadow-[inset_2px_2px_5px_#004d4d]">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-[family-name:var(--font-space-mono)] font-600 text-[#1E2938] text-sm">
                              {destination.description || `Destination ${index + 1}`}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {destination.highlights && destination.highlights.length > 0 && (
                                <span className={NEU_BADGE}>
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {destination.highlights.length} Highlights
                                </span>
                              )}
                              {destination.attractions && destination.attractions.length > 0 && (
                                <span className={NEU_BADGE}>
                                  <Building2 className="w-2.5 h-2.5" />
                                  {destination.attractions.length} Attractions
                                </span>
                              )}
                              {destination.activities && destination.activities.length > 0 && (
                                <span className={NEU_BADGE}>
                                  <Activity className="w-2.5 h-2.5" />
                                  {destination.activities.length} Activities
                                </span>
                              )}
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedDest === index ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-[#1E2938]/50" />
                          </motion.div>
                        </button>

                        {/* Destination body */}
                        <AnimatePresence>
                          {expandedDest === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 border-t border-[#1E2938]/10 pt-4 grid grid-cols-1 gap-4">
                                {/* Description */}
                                <div>
                                  <label className={`${NEU_LABEL} block mb-2`}>Description</label>
                                  <textarea
                                    rows={3}
                                    className={`${NEU_INPUT} resize-none`}
                                    placeholder="Describe this destination..."
                                    value={destination.description || ""}
                                    onChange={(e) =>
                                      setFieldValue(`destinations[${index}].description`, e.target.value)
                                    }
                                  />
                                </div>

                                {/* Highlights */}
                                <HighlightsSubSection destIndex={index} />

                                {/* Attractions */}
                                <AttractionsSubSection
                                  destIndex={index}
                                  onOpenMapPicker={openAttractionMapPicker}
                                />

                                {/* Activities */}
                                <ActivitiesSubSection destIndex={index} />

                                {/* Coordinates */}
                                <div className={`${NEU_CARD_SM} p-4`}>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Map className="w-4 h-4 text-[#006666]" />
                                    <span className={NEU_LABEL}>Location Coordinates</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                      <label className={`${NEU_LABEL} block mb-1`}>Latitude</label>
                                      <input
                                        type="number"
                                        className={NEU_INPUT}
                                        value={destination.coordinates?.lat || ""}
                                        onChange={(e) =>
                                          setFieldValue(`destinations[${index}].coordinates.lat`, parseFloat(e.target.value) || 0)
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className={`${NEU_LABEL} block mb-1`}>Longitude</label>
                                      <input
                                        type="number"
                                        className={NEU_INPUT}
                                        value={destination.coordinates?.lng || ""}
                                        onChange={(e) =>
                                          setFieldValue(`destinations[${index}].coordinates.lng`, parseFloat(e.target.value) || 0)
                                        }
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className={NEU_BTN_MAP}
                                    onClick={() => openDestinationMapPicker(index)}
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    Pick Destination on Map
                                  </button>
                                </div>

                                {/* Remove destination */}
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    className={NEU_BTN_DANGER}
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove Destination
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add destination */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    type="button"
                    className={`${NEU_BTN_PRIMARY} mt-2`}
                    onClick={() =>
                      push({
                        country: "",
                        city: "",
                        district: "",
                        description: "",
                        highlights: [],
                        attractions: [],
                        activities: [],
                        imageIds: [],
                        coordinates: { lat: 0, lng: 0 },
                      })
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Add Destination
                  </button>
                </motion.div>
              </div>
            )}
          </FieldArray>
        </motion.div>
      </div>

      {/* Map picker dialog (unchanged) */}
      <MapPickerDialog
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onSelect={handleMapSelect}
        initialPosition={getInitialPosition()}
      />
    </>
  );
}