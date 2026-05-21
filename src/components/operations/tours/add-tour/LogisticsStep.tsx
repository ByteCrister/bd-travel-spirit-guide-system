"use client";

import { FieldArray, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { TRANSPORT_MODE, CURRENCY, DISTRICT } from "@/constants/tour/tour.const";
import { useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Map,
  Navigation,
  Package,
  Users,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
} from "lucide-react";
import { MapPickerDialog } from "@/components/global/MapPickerDialog";
import { ComboBox } from "@/components/ui/combobox";

// ─── Neumorphic Design Tokens ──────────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_DANGER =
  "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";
const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_SELECT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 appearance-none cursor-pointer";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_CHECKBOX =
  "w-4 h-4 rounded appearance-none bg-[#E7E5E4] border-none " +
  "shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "checked:bg-[#006666] checked:shadow-[inset_2px_2px_4px_#004d4d,inset_-1px_-1px_3px_#008080] " +
  "transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006666]/40";
const SECTION_HEADER = "flex items-center gap-3 mb-4";

// ─── Animation Variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};

// ─── Reusable Sub-components ──────────────────────────────────────────────────
function SectionIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      className={`p-2.5 rounded-xl flex items-center justify-center text-white flex-shrink-0`}
      style={{ background: color }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, color, title, subtitle }: {
  icon: React.ReactNode; color: string; title: string; subtitle?: string;
}) {
  return (
    <div className={SECTION_HEADER}>
      <SectionIcon color={color}>{icon}</SectionIcon>
      <div>
        <h3 className={`${NEU_HEADING} text-base`}>{title}</h3>
        {subtitle && <p className={NEU_MUTED}>{subtitle}</p>}
      </div>
    </div>
  );
}

function NeuLabel({ children }: { children: React.ReactNode }) {
  return <label className={`${NEU_LABEL} block mb-1.5`}>{children}</label>;
}

function NeuInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${NEU_INPUT} ${props.className ?? ""}`} />;
}

function NeuTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${NEU_INPUT} resize-none ${props.className ?? ""}`}
    />
  );
}

function NeuSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${NEU_SELECT} ${props.className ?? ""}`} />
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#1E2938]/40">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LogisticsStep() {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const validateCoordinates = (lat: number, lng: number): boolean => {
    if (isNaN(lat) || isNaN(lng)) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const handleMapSelect = (lat: number, lng: number) => {
    if (validateCoordinates(lat, lng)) {
      setFieldValue("mainLocation.coordinates.lat", lat);
      setFieldValue("mainLocation.coordinates.lng", lng);
    }
  };

  const currentCoordsValid = validateCoordinates(
    values.mainLocation?.coordinates?.lat || 0,
    values.mainLocation?.coordinates?.lng || 0
  );

  const getInitialPosition = (): [number, number] | undefined => {
    const lat = values.mainLocation?.coordinates?.lat;
    const lng = values.mainLocation?.coordinates?.lng;
    if (lat && lng && validateCoordinates(lat, lng)) return [lat, lng];
    return undefined;
  };

  const hasCoords =
    values.mainLocation?.coordinates?.lat !== undefined &&
    values.mainLocation?.coordinates?.lng !== undefined;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen ${NEU_SURFACE} p-4 sm:p-6 lg:p-8`}
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-4">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <Navigation className="w-6 h-6 text-[#006666]" />
          </div>
          <div>
            <h2 className={`${NEU_HEADING} text-2xl`}>Logistics</h2>
            <p className={NEU_MUTED}>Configure transport, location details, and packing requirements</p>
          </div>
        </div>
        {/* Decorative rule */}
        <div className={`mt-5 border-t ${NEU_DIVIDER}`} />
      </motion.div>

      <div className="space-y-8">
        {/* ── Main Location ─────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionTitle
            icon={<MapPin className="w-4 h-4" />}
            color="linear-gradient(135deg,#11998e,#38ef7d)"
            title="Main Location"
            subtitle="Primary address and optional map coordinates"
          />

          <div className={`${NEU_CARD} p-5 sm:p-6`}>
            {/* Address sub-section */}
            <div className="flex items-center gap-2 mb-4">
              <div className={NEU_ICON_WELL}>
                <Building2 className="w-3.5 h-3.5 text-[#006666]" />
              </div>
              <span className={`${NEU_LABEL}`}>Address</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <NeuLabel>Line 1</NeuLabel>
                <NeuInput
                  value={values.mainLocation?.address?.line1 || ""}
                  onChange={(e) => setFieldValue("mainLocation.address.line1", e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div>
                <NeuLabel>Line 2</NeuLabel>
                <NeuInput
                  value={values.mainLocation?.address?.line2 || ""}
                  onChange={(e) => setFieldValue("mainLocation.address.line2", e.target.value)}
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <NeuLabel>City</NeuLabel>
                  <NeuInput
                    value={values.mainLocation?.address?.city || ""}
                    onChange={(e) => setFieldValue("mainLocation.address.city", e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div>
                  <NeuLabel>District</NeuLabel>
                  <div className={NEU_SURFACE_INSET_SM + " rounded-xl"}>
                    <ComboBox
                      value={values.mainLocation?.address?.district || ""}
                      placeholder="Select District"
                      options={Object.values(DISTRICT).map((d) => ({ label: d, value: d }))}
                      onChange={(v) => setFieldValue("mainLocation.address.district", v)}
                    />
                  </div>
                </div>

                <div>
                  <NeuLabel>Region</NeuLabel>
                  <NeuInput
                    value={values.mainLocation?.address?.region || ""}
                    onChange={(e) => setFieldValue("mainLocation.address.region", e.target.value)}
                    placeholder="Region"
                  />
                </div>

                <div>
                  <NeuLabel>Postal Code</NeuLabel>
                  <NeuInput
                    value={values.mainLocation?.address?.postalCode || ""}
                    onChange={(e) => setFieldValue("mainLocation.address.postalCode", e.target.value)}
                    placeholder="e.g. 1207"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className={`my-6 border-t ${NEU_DIVIDER}`} />

            {/* Coordinates sub-section */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={NEU_ICON_WELL}>
                  <Map className="w-3.5 h-3.5 text-[#006666]" />
                </div>
                <span className={NEU_LABEL}>Coordinates (Optional)</span>
              </div>
              <button
                type="button"
                onClick={() => setMapDialogOpen(true)}
                className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-3 py-1.5 text-xs`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#006666]" />
                Pick on Map
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <NeuLabel>Latitude</NeuLabel>
                <NeuInput
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  value={values.mainLocation?.coordinates?.lat ?? ""}
                  onChange={(e) =>
                    setFieldValue(
                      "mainLocation.coordinates.lat",
                      e.target.value === "" ? undefined : parseFloat(e.target.value)
                    )
                  }
                  placeholder="e.g. 23.8103"
                />
              </div>
              <div>
                <NeuLabel>Longitude</NeuLabel>
                <NeuInput
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  value={values.mainLocation?.coordinates?.lng ?? ""}
                  onChange={(e) =>
                    setFieldValue(
                      "mainLocation.coordinates.lng",
                      e.target.value === "" ? undefined : parseFloat(e.target.value)
                    )
                  }
                  placeholder="e.g. 90.4125"
                />
              </div>
            </div>

            {/* Coordinate status */}
            <AnimatePresence>
              {hasCoords && currentCoordsValid && (
                <motion.div
                  key="valid"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4"
                >
                  <div className={`${NEU_CARD_SM} p-3 flex items-center gap-2.5 border-[#00A63D]/30`}>
                    <CheckCircle2 className="w-4 h-4 text-[#00A63D] flex-shrink-0" />
                    <div>
                      <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#00A63D]">
                        Valid coordinates
                      </span>
                      <p className={`${NEU_MONO} text-xs text-[#1E2938]/50 mt-0.5`}>
                        {values.mainLocation?.coordinates?.lat?.toFixed(6)},{" "}
                        {values.mainLocation?.coordinates?.lng?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {hasCoords && !currentCoordsValid && (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4"
                >
                  <div className={`${NEU_CARD_SM} p-3 flex items-center gap-2.5 border-[#FF2157]/30`}>
                    <AlertCircle className="w-4 h-4 text-[#FF2157] flex-shrink-0" />
                    <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FF2157]">
                      Invalid coordinates. Please enter valid values or use the map picker.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Transport Modes ───────────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionTitle
            icon={<Truck className="w-4 h-4" />}
            color="linear-gradient(135deg,#4facfe,#00f2fe)"
            title="Transport Modes"
          />

          <div className={`${NEU_CARD} p-5 sm:p-6`}>
            <NeuLabel>Select Transport Modes</NeuLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.values(TRANSPORT_MODE).map((mode) => {
                const selected = values.transportModes?.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      const current = values.transportModes || [];
                      setFieldValue(
                        "transportModes",
                        selected ? current.filter((m) => m !== mode) : [...current, mode]
                      );
                    }}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-bold
                      transition-all duration-200
                      ${selected
                        ? "bg-[#006666] text-white shadow-[inset_2px_2px_5px_#004d4d,inset_-1px_-1px_3px_#008080]"
                        : `${NEU_BTN_GHOST} text-[#1E2938]/70`
                      }
                    `}
                  >
                    {mode.replace("_", " ")}
                  </button>
                );
              })}
            </div>
            {(values.transportModes?.length ?? 0) > 0 && (
              <p className={`${NEU_MUTED} mt-3`}>
                {values.transportModes!.length} mode{values.transportModes!.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </motion.section>

        {/* ── Pickup Options ────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionTitle
            icon={<Users className="w-4 h-4" />}
            color="linear-gradient(135deg,#f093fb,#f5576c)"
            title="Pickup Options"
          />

          <div className={`${NEU_CARD} p-5 sm:p-6`}>
            <FieldArray name="pickupOptions">
              {({ push, remove }) => (
                <div className="space-y-3">
                  {/* Table header */}
                  {(values.pickupOptions?.length ?? 0) > 0 && (
                    <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr_40px] gap-3 px-3">
                      <span className={NEU_LABEL}>City</span>
                      <span className={NEU_LABEL}>Price</span>
                      <span className={NEU_LABEL}>Currency</span>
                      <span />
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {values.pickupOptions?.map((opt, i) => (
                      <motion.div
                        key={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`${NEU_CARD_SM} p-3`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_40px] gap-3 items-center">
                          <div>
                            <span className={`${NEU_LABEL} sm:hidden`}>City</span>
                            <NeuInput
                              value={opt.city}
                              onChange={(e) => setFieldValue(`pickupOptions[${i}].city`, e.target.value)}
                              placeholder="City name"
                            />
                          </div>
                          <div>
                            <span className={`${NEU_LABEL} sm:hidden`}>Price</span>
                            <NeuInput
                              type="number"
                              value={opt.price}
                              onChange={(e) =>
                                setFieldValue(`pickupOptions[${i}].price`, Number(e.target.value))
                              }
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <span className={`${NEU_LABEL} sm:hidden`}>Currency</span>
                            <NeuSelect
                              value={opt.currency}
                              onChange={(e) =>
                                setFieldValue(`pickupOptions[${i}].currency`, e.target.value)
                              }
                            >
                              {Object.values(CURRENCY).map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </NeuSelect>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className={`${NEU_BTN_DANGER} w-9 h-9 flex items-center justify-center mx-auto`}
                            aria-label="Remove pickup option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => push({ city: "", price: 0, currency: CURRENCY.BDT })}
                    className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2 text-sm mt-2`}
                  >
                    <Plus className="w-4 h-4 text-[#006666]" />
                    Add Pickup Option
                  </button>
                </div>
              )}
            </FieldArray>
          </div>
        </motion.section>

        {/* ── Meeting Point ─────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionTitle
            icon={<MapPin className="w-4 h-4" />}
            color="linear-gradient(135deg,#30cfd0,#330867)"
            title="Meeting Point"
          />

          <div className={`${NEU_CARD} p-5 sm:p-6`}>
            <NeuLabel>Meeting Point Description</NeuLabel>
            <NeuTextarea
              rows={4}
              value={values.meetingPoint || ""}
              onChange={(e) => setFieldValue("meetingPoint", e.target.value)}
              placeholder="Describe where participants should meet before the tour begins…"
            />
          </div>
        </motion.section>

        {/* ── Packing List ──────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionTitle
            icon={<Package className="w-4 h-4" />}
            color="linear-gradient(135deg,#ee0979,#ff6a00)"
            title="Packing List"
          />

          <FieldArray name="packingList">
            {({ push, remove }) => (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {values.packingList?.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className={`${NEU_CARD} p-4 sm:p-5`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
                        <div>
                          <NeuLabel>Item *</NeuLabel>
                          <NeuInput
                            value={item.item}
                            onChange={(e) =>
                              setFieldValue(`packingList[${i}].item`, e.target.value)
                            }
                            placeholder="e.g. Rain jacket"
                          />
                        </div>
                        <div>
                          <NeuLabel>Notes</NeuLabel>
                          <NeuInput
                            value={item.notes || ""}
                            onChange={(e) =>
                              setFieldValue(`packingList[${i}].notes`, e.target.value)
                            }
                            placeholder="Optional notes"
                          />
                        </div>

                        {/* Required toggle */}
                        <label className="flex items-center gap-2 cursor-pointer pb-0.5 self-end">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={item.required}
                              onChange={(e) =>
                                setFieldValue(`packingList[${i}].required`, e.target.checked)
                              }
                              className={NEU_CHECKBOX}
                            />
                            {item.required && (
                              <CheckCircle2 className="pointer-events-none absolute inset-0 m-auto w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={`${NEU_LABEL} normal-case tracking-normal`}>Required</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className={`${NEU_BTN_DANGER} w-9 h-9 flex items-center justify-center self-end`}
                          aria-label="Remove packing item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => push({ item: "", required: true, notes: "" })}
                  className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2 text-sm`}
                >
                  <Plus className="w-4 h-4 text-[#006666]" />
                  Add Packing Item
                </button>
              </div>
            )}
          </FieldArray>
        </motion.section>
      </div>

      {/* Map Picker Dialog */}
      <MapPickerDialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        onSelect={handleMapSelect}
        initialPosition={getInitialPosition()}
      />
    </motion.div>
  );
}