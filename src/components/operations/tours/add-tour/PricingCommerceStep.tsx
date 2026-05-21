"use client";

import { Field, FieldArray, useFormikContext, getIn } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CreateTourDTO } from "@/types/tour/tour.types";
import {
  CURRENCY,
  PAYMENT_METHOD,
  TOUR_DISCOUNT,
  TOUR_DISCOUNT_TYPE,
} from "@/constants/tour/tour.const";
import { useState } from "react";
import {
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Plane,
  TrendingDown,
} from "lucide-react";
import { MapPickerDialog } from "@/components/global/MapPickerDialog";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism style tokens (from neu.styles.ts) ──────────────
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 w-full " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-3 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_SELECT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] w-full " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-3 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 appearance-none cursor-pointer";

const NEU_BADGE_PRIMARY =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

// ── Section header component ────────────────────────────────────
function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={NEU_ICON_WELL_PRIMARY + " text-[#006666]"}>{icon}</div>
      <div>
        <h3 className={`${NEU_HEADING} text-base`}>{title}</h3>
        {subtitle && <p className={NEU_MUTED + " mt-0.5"}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Animation variants ─────────────────────────────────────────
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

export default function PricingCommerceStep() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<CreateTourDTO>();

  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [editingDepartureIndex, setEditingDepartureIndex] = useState<
    number | null
  >(null);

  const getError = (fieldName: string) => {
    const error = getIn(errors, fieldName);
    const touch = getIn(touched, fieldName);
    return touch && error ? (error as string) : undefined;
  };

  const handleMapSelect = (lat: number, lng: number) => {
    if (editingDepartureIndex !== null) {
      setFieldValue(`departures[${editingDepartureIndex}].meetingCoordinates`, {
        lat,
        lng,
      });
    }
  };

  const openMapPicker = (index: number) => {
    setEditingDepartureIndex(index);
    setMapPickerOpen(true);
  };

  const closeMapPicker = () => {
    setMapPickerOpen(false);
    setEditingDepartureIndex(null);
  };

  const getInitialPosition = (): [number, number] | undefined => {
    if (editingDepartureIndex === null) return undefined;
    const departure = values.departures?.[editingDepartureIndex];
    if (departure?.meetingCoordinates) {
      return [departure.meetingCoordinates.lat, departure.meetingCoordinates.lng];
    }
    return undefined;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={NEU_PAGE_BG + " p-4 sm:p-6 lg:p-8"}
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-4">
            <div className={NEU_CARD_SM + " p-3 text-[#006666]"}>
              <FaBangladeshiTakaSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`${NEU_HEADING} text-xl sm:text-2xl`}>
                Pricing & Commerce
              </h2>
              <p className={NEU_MUTED + " mt-1"}>
                Configure pricing, discounts, and payment options
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* ── Base Price ─────────────────────────────────────── */}
          <motion.section variants={itemVariants}>
            <SectionHeader
              icon={<FaBangladeshiTakaSign className="w-4 h-4" />}
              title="Base Price"
              subtitle="Set the base price for this tour"
            />
            <div className={`${NEU_CARD} p-5 ${NEU_CARD_HOVER}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={NEU_LABEL + " mb-2 block"}>Amount *</label>
                  <Field
                    name="basePrice.amount"
                    type="number"
                    min={0}
                    className={NEU_INPUT}
                    placeholder="0.00"
                  />
                  {touched.basePrice?.amount && errors.basePrice?.amount && (
                    <p className="mt-1.5 text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">
                      {errors.basePrice.amount as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className={NEU_LABEL + " mb-2 block"}>Currency *</label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="basePrice.currency"
                      className={NEU_SELECT}
                    >
                      {Object.values([CURRENCY.BDT]).map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </Field>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#1E2938]/50">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Discounts ───────────────────────────────────────── */}
          <motion.section variants={itemVariants}>
            <SectionHeader
              icon={<TrendingDown className="w-4 h-4" />}
              title="Discounts"
              subtitle="Add promotional or seasonal discounts"
            />
            <FieldArray name="discounts">
              {({ push, remove }) => (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {values.discounts?.map((discount, index) => (
                      <motion.div
                        key={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`${NEU_CARD_SM} p-4`}
                      >
                        {/* Row 1: type, value, discount type */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block"}>Value Type</label>
                            <div className="relative">
                              <select
                                value={
                                  Object.values(TOUR_DISCOUNT_TYPE).includes(
                                    discount.type as (typeof TOUR_DISCOUNT_TYPE)[keyof typeof TOUR_DISCOUNT_TYPE]
                                  )
                                    ? discount.type
                                    : TOUR_DISCOUNT_TYPE.PERCENTAGE
                                }
                                onChange={(e) =>
                                  setFieldValue(
                                    `discounts[${index}].type`,
                                    e.target.value
                                  )
                                }
                                className={NEU_SELECT}
                              >
                                {Object.values(TOUR_DISCOUNT_TYPE).map((type) => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#1E2938]/50">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block"}>
                              {discount.type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT
                                ? `Value (${values.basePrice.currency})`
                                : "Value %"}
                            </label>
                            <input
                              type="number"
                              value={discount.value}
                              min={0}
                              max={discount.type === TOUR_DISCOUNT_TYPE.PERCENTAGE ? 100 : undefined}
                              step={0.1}
                              onChange={(e) =>
                                setFieldValue(
                                  `discounts[${index}].value`,
                                  parseFloat(e.target.value)
                                )
                              }
                              className={NEU_INPUT}
                            />
                          </div>
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block"}>Discount</label>
                            <div className="relative">
                              <select
                                value={
                                  Object.values(TOUR_DISCOUNT).includes(
                                    discount.discount as (typeof TOUR_DISCOUNT)[keyof typeof TOUR_DISCOUNT]
                                  )
                                    ? discount.discount
                                    : TOUR_DISCOUNT.SEASONAL
                                }
                                onChange={(e) =>
                                  setFieldValue(
                                    `discounts[${index}].discount`,
                                    e.target.value
                                  )
                                }
                                className={NEU_SELECT}
                              >
                                {Object.values(TOUR_DISCOUNT).map((discountType) => (
                                  <option key={discountType} value={discountType}>{discountType}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#1E2938]/50">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Row 2: code, dates, delete */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block"}>Promo Code</label>
                            <input
                              type="text"
                              value={discount.code || ""}
                              onChange={(e) =>
                                setFieldValue(`discounts[${index}].code`, e.target.value)
                              }
                              disabled={discount.discount !== TOUR_DISCOUNT.PROMO}
                              placeholder={
                                discount.discount !== TOUR_DISCOUNT.PROMO ? "N/A" : "CODE2025"
                              }
                              className={
                                NEU_INPUT +
                                (discount.discount !== TOUR_DISCOUNT.PROMO
                                  ? " opacity-40 cursor-not-allowed"
                                  : "")
                              }
                            />
                          </div>
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block"}>Valid From</label>
                            <DatePicker
                              value={discount.validFrom ? new Date(discount.validFrom) : null}
                              onChange={(date) =>
                                setFieldValue(`discounts[${index}].validFrom`, date)
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "0.75rem",
                                      background: "#E7E5E4",
                                      boxShadow:
                                        "inset 3px 3px 7px #c8c6c5, inset -3px -3px 7px #ffffff",
                                      border: "none",
                                      fontFamily: "var(--font-jetbrains-mono)",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      border: "none",
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block"}>Valid Until</label>
                            <DatePicker
                              value={discount.validUntil ? new Date(discount.validUntil) : null}
                              onChange={(date) =>
                                setFieldValue(`discounts[${index}].validUntil`, date)
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "0.75rem",
                                      background: "#E7E5E4",
                                      boxShadow:
                                        "inset 3px 3px 7px #c8c6c5, inset -3px -3px 7px #ffffff",
                                      border: "none",
                                      fontFamily: "var(--font-jetbrains-mono)",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      border: "none",
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className={NEU_BTN_ICON + " shrink-0"}
                            aria-label="Remove discount"
                          >
                            <Trash2 className="w-4 h-4 text-[#FF2157]" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() =>
                      push({
                        type: TOUR_DISCOUNT_TYPE.PERCENTAGE,
                        discount: TOUR_DISCOUNT.SEASONAL,
                        value: 0,
                      })
                    }
                    className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2.5 text-sm`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Discount
                  </button>
                </div>
              )}
            </FieldArray>
          </motion.section>

          {/* ── Duration ─────────────────────────────────────────── */}
          <motion.section variants={itemVariants}>
            <SectionHeader
              icon={<Clock className="w-4 h-4" />}
              title="Duration"
              subtitle="How long does this tour last?"
            />
            <div className={`${NEU_CARD} p-5 ${NEU_CARD_HOVER}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={NEU_LABEL + " mb-2 block"}>Days *</label>
                  <Field
                    name="duration.days"
                    type="number"
                    min={1}
                    className={NEU_INPUT}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className={NEU_LABEL + " mb-2 block"}>
                    Nights{" "}
                    <span className="normal-case text-[#1E2938]/40 font-normal tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <Field
                    name="duration.nights"
                    type="number"
                    min={0}
                    className={NEU_INPUT}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Operating Windows ────────────────────────────────── */}
          <motion.section variants={itemVariants}>
            <SectionHeader
              icon={<Calendar className="w-4 h-4" />}
              title="Operating Windows"
              subtitle="Define date ranges when this tour runs"
            />
            <FieldArray name="operatingWindows">
              {({ push, remove }) => (
                <div className="space-y-3">
                  {/* Table header – desktop only */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_120px_48px] gap-3 px-4">
                    <span className={NEU_LABEL}>Start Date *</span>
                    <span className={NEU_LABEL}>End Date *</span>
                    <span className={NEU_LABEL}>Total Seats</span>
                    <span />
                  </div>

                  <AnimatePresence mode="popLayout">
                    {values.operatingWindows?.map((window, index) => (
                      <motion.div
                        key={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`${NEU_CARD_SM} p-4`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_48px] gap-3 items-end">
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block sm:hidden"}>Start Date *</label>
                            <DatePicker
                              value={new Date(window.startDate)}
                              onChange={(date) =>
                                setFieldValue(
                                  `operatingWindows[${index}].startDate`,
                                  date
                                )
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  error: Boolean(getError(`operatingWindows[${index}].startDate`)),
                                  helperText: getError(`operatingWindows[${index}].startDate`),
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "0.75rem",
                                      background: "#E7E5E4",
                                      boxShadow: "inset 3px 3px 7px #c8c6c5, inset -3px -3px 7px #ffffff",
                                      border: "none",
                                      fontFamily: "var(--font-jetbrains-mono)",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                  },
                                },
                              }}
                            />
                          </div>
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block sm:hidden"}>End Date *</label>
                            <DatePicker
                              value={new Date(window.endDate)}
                              onChange={(date) =>
                                setFieldValue(
                                  `operatingWindows[${index}].endDate`,
                                  date
                                )
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  error: Boolean(getError(`operatingWindows[${index}].endDate`)),
                                  helperText: getError(`operatingWindows[${index}].endDate`),
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "0.75rem",
                                      background: "#E7E5E4",
                                      boxShadow: "inset 3px 3px 7px #c8c6c5, inset -3px -3px 7px #ffffff",
                                      border: "none",
                                      fontFamily: "var(--font-jetbrains-mono)",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                  },
                                },
                              }}
                            />
                          </div>
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block sm:hidden"}>Total Seats</label>
                            <input
                              type="number"
                              value={window.seatsTotal || ""}
                              min={0}
                              placeholder="∞"
                              onChange={(e) =>
                                setFieldValue(
                                  `operatingWindows[${index}].seatsTotal`,
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : undefined
                                )
                              }
                              className={NEU_INPUT}
                            />
                          </div>
                          <div className="flex sm:justify-center">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className={NEU_BTN_ICON}
                              aria-label="Remove operating window"
                            >
                              <Trash2 className="w-4 h-4 text-[#FF2157]" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() =>
                      push({
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        seatsTotal: undefined,
                      })
                    }
                    className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2.5 text-sm`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Operating Window
                  </button>
                </div>
              )}
            </FieldArray>
          </motion.section>

          {/* ── Payment Methods ──────────────────────────────────── */}
          <motion.section variants={itemVariants}>
            <SectionHeader
              icon={<CreditCard className="w-4 h-4" />}
              title="Payment Methods"
              subtitle="Select accepted payment options"
            />
            <div className={`${NEU_CARD} p-5 ${NEU_CARD_HOVER}`}>
              <div className="flex flex-wrap gap-3">
                {Object.values([PAYMENT_METHOD.CARD]).map((method) => {
                  const isActive = values.paymentMethods.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        const newMethods = !isActive
                          ? [...values.paymentMethods, method]
                          : values.paymentMethods.filter((m) => m !== method);
                        setFieldValue("paymentMethods", newMethods);
                      }}
                      className={
                        isActive
                          ? `${NEU_BTN_PRIMARY} px-4 py-2 text-sm flex items-center gap-2`
                          : `${NEU_BTN_GHOST} px-4 py-2 text-sm flex items-center gap-2`
                      }
                    >
                      <CreditCard className="w-4 h-4" />
                      {method}
                      {isActive && (
                        <span className="ml-1 w-1.5 h-1.5 rounded-full bg-white/80" />
                      )}
                    </button>
                  );
                })}
              </div>
              {values.paymentMethods.length === 0 && (
                <p className={NEU_MUTED + " mt-3 text-xs"}>
                  Select at least one payment method.
                </p>
              )}
            </div>
          </motion.section>

          {/* ── Departures ───────────────────────────────────────── */}
          <motion.section variants={itemVariants}>
            <SectionHeader
              icon={<Plane className="w-4 h-4" />}
              title="Departures Schedule"
              subtitle="Manage individual departure dates and meeting points"
            />
            <FieldArray name="departures">
              {({ push, remove }) => (
                <div className="space-y-3">
                  {/* Column headers – desktop */}
                  <div className="hidden lg:grid lg:grid-cols-[160px_100px_1fr_200px_48px] gap-3 px-4">
                    <span className={NEU_LABEL}>Date</span>
                    <span className={NEU_LABEL}>Seats</span>
                    <span className={NEU_LABEL}>Meeting Point</span>
                    <span className={NEU_LABEL}>Coordinates</span>
                    <span />
                  </div>

                  <AnimatePresence mode="popLayout">
                    {values.departures?.map((departure, index) => (
                      <motion.div
                        key={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`${NEU_CARD_SM} p-4`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[160px_100px_1fr_200px_48px] gap-3 items-end">
                          {/* Date */}
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block lg:hidden"}>Date</label>
                            <DatePicker
                              value={new Date(departure.date)}
                              onChange={(date) =>
                                setFieldValue(`departures[${index}].date`, date)
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "0.75rem",
                                      background: "#E7E5E4",
                                      boxShadow: "inset 3px 3px 7px #c8c6c5, inset -3px -3px 7px #ffffff",
                                      border: "none",
                                      fontFamily: "var(--font-jetbrains-mono)",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                  },
                                },
                              }}
                            />
                          </div>

                          {/* Seats */}
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block lg:hidden"}>Total Seats</label>
                            <input
                              type="number"
                              value={departure.seatsTotal}
                              min={1}
                              onChange={(e) =>
                                setFieldValue(
                                  `departures[${index}].seatsTotal`,
                                  parseInt(e.target.value, 10)
                                )
                              }
                              className={NEU_INPUT}
                            />
                          </div>

                          {/* Meeting Point */}
                          <div>
                            <label className={NEU_LABEL + " mb-1.5 block lg:hidden"}>Meeting Point</label>
                            <input
                              type="text"
                              value={departure.meetingPoint || ""}
                              placeholder="e.g. Dhaka Airport Gate 3"
                              onChange={(e) =>
                                setFieldValue(
                                  `departures[${index}].meetingPoint`,
                                  e.target.value
                                )
                              }
                              className={NEU_INPUT}
                            />
                          </div>

                          {/* Coordinates */}
                          <div className="space-y-1.5">
                            <label className={NEU_LABEL + " block lg:hidden"}>Coordinates</label>
                            <button
                              type="button"
                              onClick={() => openMapPicker(index)}
                              className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-3 py-2 text-xs w-full justify-center`}
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#006666]" />
                              Set Location
                            </button>
                            {departure.meetingCoordinates && (
                              <div className={NEU_BADGE_PRIMARY + " w-full justify-between"}>
                                <span className="truncate text-[10px]">
                                  {departure.meetingCoordinates.lat.toFixed(4)},{" "}
                                  {departure.meetingCoordinates.lng.toFixed(4)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFieldValue(
                                      `departures[${index}].meetingCoordinates`,
                                      undefined
                                    )
                                  }
                                  className="ml-1 hover:text-[#FF2157] transition-colors"
                                  aria-label="Clear coordinates"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Delete */}
                          <div className="flex lg:justify-center">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className={NEU_BTN_ICON}
                              aria-label="Remove departure"
                            >
                              <Trash2 className="w-4 h-4 text-[#FF2157]" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {values.departures?.length === 0 && (
                    <div className={`${NEU_SURFACE_INSET} rounded-2xl p-8 flex flex-col items-center gap-3`}>
                      <div className={NEU_ICON_WELL + " text-[#1E2938]/30"}>
                        <Plane className="w-5 h-5" />
                      </div>
                      <p className={NEU_MUTED}>No departures added yet</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      push({
                        date: new Date(),
                        seatsTotal: 10,
                        meetingPoint: "",
                      })
                    }
                    className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2.5 text-sm`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Departure
                  </button>
                </div>
              )}
            </FieldArray>
          </motion.section>
        </div>
      </motion.div>

      {/* Map Picker Dialog */}
      <MapPickerDialog
        open={mapPickerOpen}
        onClose={closeMapPicker}
        onSelect={handleMapSelect}
        initialPosition={getInitialPosition()}
      />
    </LocalizationProvider>
  );
}