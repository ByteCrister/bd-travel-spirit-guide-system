"use client";

import { useFormikContext } from "formik";
import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  Calendar,
  MapPin,
  Utensils,
  Hotel,
  Activity,
  Navigation,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItineraryEntryDTO, UpdateTourContentItineraryDTO } from "@/types/tour/tour.types";
import { MealsProvided, TransportMode } from "@/constants/tour/tour.const";

// ─── Constants ────────────────────────────────────────────────────────────────

const MEALS_PROVIDED = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACKS: "Snacks",
};

const TRANSPORT_MODE = {
  BUS: "Bus",
  FLIGHT: "Flight",
  TRAIN: "Train",
  BOAT: "Boat",
  WALKING: "Walking",
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const NEU = {
  surface: "bg-[#E7E5E4] dark:bg-[#1a1918]",
  surfaceDeep: "bg-[#dedad8] dark:bg-[#141312]",

  raised:
    " dark:",
  raisedSm:
    " dark:",
  raisedXs:
    " dark:",

  inset:
    " dark:",
  insetSm:
    " dark:",

  radius: "rounded-2xl",
  radiusMd: "rounded-xl",
  radiusSm: "rounded-lg",
  radiusFull: "rounded-full",

  border: "border border-[#d4d2d0] dark:border-[#2a2926]",
  borderLight: "border border-[#e0dedd] dark:border-[#232120]",

  text: {
    primary: "text-[#1E2938] dark:text-[#e8e6e4]",
    secondary: "text-[#4a5568] dark:text-[#9a9896]",
    muted: "text-[#8a8886] dark:text-[#6a6866]",
    accent: "text-[#006666]",
    danger: "text-red-600 dark:text-red-400",
    amber: "text-amber-700 dark:text-amber-400",
    teal: "text-[#006666] dark:text-[#00aaaa]",
  },

  iconBg: {
    teal: "bg-[#006666]/10 dark:bg-[#006666]/20",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    danger: "bg-red-100 dark:bg-red-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    slate: "bg-slate-100 dark:bg-slate-800/50",
  },

  divider: "border-t border-[#d4d2d0] dark:border-[#2a2926]",

  font: 'font-["Space_Mono",monospace]',
  fontSans: "font-sans",
} as const;

// ─── Shared input class ───────────────────────────────────────────────────────

const inputCls = [
  "w-full",
  NEU.surface,
  NEU.inset,
  NEU.radiusMd,
  NEU.border,
  NEU.text.primary,
  "placeholder:text-[#9a9896] dark:placeholder:text-[#6a6866]",
  "px-4 py-2.5 text-sm transition-all duration-200 outline-none",
  "focus:ring-2 focus:ring-[#006666]/25 focus:ring-offset-0",
  NEU.font,
].join(" ");

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NeuLabelProps {
  htmlFor?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  iconColor?: string;
}
const NeuLabel = ({ htmlFor, icon, children, iconColor = NEU.text.secondary }: NeuLabelProps) => (
  <label
    htmlFor={htmlFor}
    className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${NEU.text.secondary} ${NEU.font} mb-2`}
  >
    <span className={iconColor}>{icon}</span>
    {children}
  </label>
);

// Meal toggle pill
interface MealPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}
const MealPill = ({ label, active, onClick }: MealPillProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "px-3 py-1.5 text-xs font-semibold transition-all duration-200",
      NEU.radiusSm,
      NEU.font,
      active
        ? [
          "bg-[#006666]/15 dark:bg-[#006666]/30",
          "text-[#006666] dark:text-[#00cccc]",
          NEU.insetSm,
          NEU.border,
        ].join(" ")
        : [
          NEU.surface,
          NEU.text.secondary,
          NEU.raisedXs,
          NEU.border,
          "hover: dark:hover:",
        ].join(" "),
    ].join(" ")}
  >
    {label}
  </button>
);

// Activity / Note chip
interface ChipProps {
  label: string;
  variant?: "default" | "danger";
}
const Chip = ({ label, variant = "default" }: ChipProps) => (
  <span
    className={[
      "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium",
      NEU.radiusSm,
      NEU.insetSm,
      NEU.border,
      NEU.font,
      variant === "danger"
        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
        : [NEU.surface, NEU.text.secondary].join(" "),
    ].join(" ")}
  >
    {variant === "danger" && <AlertCircle className="w-2.5 h-2.5" />}
    {label}
  </span>
);

// Day number badge
const DayBadge = ({ day }: { day: number }) => (
  <div
    className={[
      "flex items-center justify-center w-10 h-10 flex-shrink-0",
      NEU.radiusFull,
      NEU.surface,
      NEU.raisedSm,
      NEU.border,
      "text-sm font-bold",
      NEU.text.teal,
      NEU.font,
    ].join(" ")}
  >
    {day}
  </div>
);

// Section divider
const SectionDivider = ({ label }: { label: string }) => (
  <div className="relative my-1">
    <div className={`absolute inset-0 flex items-center`}>
      <div className={`w-full ${NEU.divider}`} />
    </div>
    <div className="relative flex justify-start pl-4">
      <span
        className={[
          "pr-3 text-[10px] font-semibold uppercase tracking-widest",
          NEU.text.muted,
          NEU.font,
          "bg-[#dedad8] dark:bg-[#141312]",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div
    className={[
      NEU.surface,
      NEU.raised,
      NEU.radius,
      NEU.border,
      "flex flex-col items-center justify-center py-16 px-8 text-center",
    ].join(" ")}
  >
    <div
      className={[
        "p-5 mb-5",
        NEU.radiusFull,
        NEU.surface,
        NEU.raisedSm,
        NEU.border,
        NEU.iconBg.teal,
      ].join(" ")}
    >
      <Calendar className={`w-10 h-10 ${NEU.text.teal}`} />
    </div>
    <p className={`text-base font-semibold mb-1 ${NEU.text.primary} ${NEU.font}`}>
      No itinerary days yet
    </p>
    <p className={`text-sm mb-6 ${NEU.text.secondary}`}>
      Start building your tour schedule by adding your first day
    </p>
    <button
      type="button"
      onClick={onAdd}
      className={[
        "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold",
        NEU.radius,
        NEU.surface,
        NEU.raisedSm,
        NEU.border,
        NEU.text.teal,
        NEU.font,
        "transition-all duration-200 hover: dark:hover:",
        "active: dark:active:",
      ].join(" ")}
    >
      <Plus className="w-4 h-4" />
      Add First Day
    </button>
  </div>
);

// ─── Day Card ─────────────────────────────────────────────────────────────────

interface DayCardProps {
  day: ItineraryEntryDTO;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onFieldChange: (field: keyof ItineraryEntryDTO, value: unknown) => void;
  onMealToggle: (meal: MealsProvided) => void;
}

const DayCard = ({
  day,
  index,
  isExpanded,
  onToggle,
  onRemove,
  onFieldChange,
  onMealToggle,
}: DayCardProps) => {
  return (
    <div
      className={[
        NEU.surface,
        NEU.raised,
        NEU.radius,
        NEU.border,
        "overflow-hidden transition-all duration-300",
      ].join(" ")}
    >
      {/* ── Card Header ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        className={[
          "flex items-center gap-3 px-5 py-4 cursor-pointer",
          "hover:bg-[#dedad8] dark:hover:bg-[#141312]",
          "transition-colors duration-150",
          isExpanded ? NEU.divider : "",
        ].join(" ")}
      >
        <DayBadge day={day.day} />

        {/* Title & description preview */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate ${NEU.text.primary} ${NEU.font}`}>
            {day.title || (
              <span className={NEU.text.muted}>Day {day.day} — Untitled</span>
            )}
          </h3>
          {day.description && (
            <p className={`text-xs truncate mt-0.5 ${NEU.text.secondary}`}>
              {day.description}
            </p>
          )}
        </div>

        {/* Meta chips */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {day.mealsProvided && day.mealsProvided.length > 0 && (
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold",
                NEU.radiusSm,
                NEU.insetSm,
                NEU.border,
                NEU.font,
                "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
              ].join(" ")}
            >
              <Utensils className="w-2.5 h-2.5" />
              {day.mealsProvided.length}
            </span>
          )}
          {day.activities && day.activities.length > 0 && (
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold",
                NEU.radiusSm,
                NEU.insetSm,
                NEU.border,
                NEU.font,
                "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
              ].join(" ")}
            >
              <Activity className="w-2.5 h-2.5" />
              {day.activities.length}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          <button
            type="button"
            onClick={onRemove}
            className={[
              "w-8 h-8 flex items-center justify-center",
              NEU.radiusSm,
              NEU.surface,
              NEU.raisedXs,
              NEU.border,
              "text-red-400 hover:text-red-600 dark:hover:text-red-400",
              "transition-all duration-150",
              "hover:bg-red-50 dark:hover:bg-red-900/20",
            ].join(" ")}
            aria-label={`Remove Day ${day.day}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div
            className={[
              "w-8 h-8 flex items-center justify-center",
              NEU.radiusSm,
              NEU.surface,
              NEU.raisedXs,
              NEU.border,
              "transition-all duration-200",
            ].join(" ")}
          >
            <ChevronDown
              className={`w-4 h-4 ${NEU.text.secondary} transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                }`}
            />
          </div>
        </div>
      </div>

      {/* ── Expanded Body ── */}
      {isExpanded && (
        <div className={["px-5 py-6", NEU.surfaceDeep].join(" ")}>
          <div className="space-y-6">

            {/* — Basics — */}
            <SectionDivider label="Basics" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Day Title */}
              <div className="md:col-span-2 space-y-1">
                <NeuLabel htmlFor={`title-${index}`} icon={<MapPin className="w-3.5 h-3.5" />}>
                  Day Title
                </NeuLabel>
                <input
                  id={`title-${index}`}
                  type="text"
                  placeholder="e.g., Arrival in Dhaka"
                  value={day.title || ""}
                  onChange={(e) => onFieldChange("title", e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-1">
                <NeuLabel htmlFor={`description-${index}`} icon={<Activity className="w-3.5 h-3.5" />}>
                  Description
                </NeuLabel>
                <textarea
                  id={`description-${index}`}
                  placeholder="Describe the day's activities and highlights..."
                  rows={4}
                  value={day.description || ""}
                  onChange={(e) => onFieldChange("description", e.target.value)}
                  className={`${inputCls} resize-none leading-relaxed`}
                />
              </div>
            </div>

            {/* — Meals — */}
            <SectionDivider label="Meals Provided" />
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.values(MEALS_PROVIDED).map((meal) => (
                <MealPill
                  key={meal}
                  label={meal}
                  active={(day.mealsProvided || []).includes(meal as MealsProvided)}
                  onClick={() => onMealToggle(meal as MealsProvided)}
                />
              ))}
            </div>

            {/* — Accommodation — */}
            <SectionDivider label="Accommodation" />
            <div className="space-y-1">
              <NeuLabel
                htmlFor={`accommodation-${index}`}
                icon={<Hotel className="w-3.5 h-3.5" />}
              >
                Hotel / Stay
              </NeuLabel>
              <input
                id={`accommodation-${index}`}
                type="text"
                placeholder="e.g., 4-star Hotel in City Center"
                value={day.accommodation || ""}
                onChange={(e) => onFieldChange("accommodation", e.target.value)}
                className={inputCls}
              />
            </div>

            {/* — Activities — */}
            <SectionDivider label="Activities" />
            <div className="space-y-2">
              <NeuLabel
                htmlFor={`activities-${index}`}
                icon={<Activity className="w-3.5 h-3.5" />}
                iconColor="text-purple-600 dark:text-purple-400"
              >
                Activities
              </NeuLabel>
              <input
                id={`activities-${index}`}
                type="text"
                placeholder="Comma-separated (e.g., Museum tour, City walk)"
                value={day.activities?.join(", ") || ""}
                onChange={(e) =>
                  onFieldChange(
                    "activities",
                    e.target.value.split(",").map((a) => a.trim()).filter(Boolean)
                  )
                }
                className={inputCls}
              />
              {day.activities && day.activities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {day.activities.map((activity, i) => (
                    <Chip key={i} label={activity} />
                  ))}
                </div>
              )}
            </div>

            {/* — Travel — */}
            <SectionDivider label="Travel" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Distance */}
              <div className="space-y-1">
                <NeuLabel
                  htmlFor={`distance-${index}`}
                  icon={<Navigation className="w-3.5 h-3.5" />}
                >
                  Distance
                </NeuLabel>
                <input
                  id={`distance-${index}`}
                  type="text"
                  placeholder="e.g., 150 km"
                  value={day.travelDistance || ""}
                  onChange={(e) => onFieldChange("travelDistance", e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Mode */}
              <div className="space-y-1">
                <NeuLabel
                  htmlFor={`mode-${index}`}
                  icon={<Navigation className="w-3.5 h-3.5" />}
                >
                  Mode
                </NeuLabel>
                <Select
                  value={day.travelMode || ""}
                  onValueChange={(value) => onFieldChange("travelMode", value)}
                >
                  <SelectTrigger
                    id={`mode-${index}`}
                    className={[
                      inputCls,
                      "flex items-center justify-between",
                      "[&>svg]:text-[#4a5568] [&>svg]:dark:text-[#9a9896]",
                    ].join(" ")}
                  >
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent
                    className={[
                      NEU.surface,
                      NEU.raised,
                      NEU.radiusMd,
                      NEU.border,
                      NEU.font,
                    ].join(" ")}
                  >
                    {Object.values(TRANSPORT_MODE).map((mode) => (
                      <SelectItem
                        key={mode}
                        value={mode}
                        className={`${NEU.text.primary} ${NEU.font} text-sm cursor-pointer`}
                      >
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div className="space-y-1">
                <NeuLabel
                  htmlFor={`time-${index}`}
                  icon={<Clock className="w-3.5 h-3.5" />}
                >
                  Est. Time
                </NeuLabel>
                <input
                  id={`time-${index}`}
                  type="text"
                  placeholder="e.g., 3 hours"
                  value={day.estimatedTime || ""}
                  onChange={(e) => onFieldChange("estimatedTime", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* — Notes — */}
            <SectionDivider label="Important Notes" />
            <div className="space-y-2">
              <NeuLabel
                htmlFor={`notes-${index}`}
                icon={<AlertCircle className="w-3.5 h-3.5" />}
                iconColor={NEU.text.danger}
              >
                Notes
              </NeuLabel>
              <textarea
                id={`notes-${index}`}
                placeholder="Comma-separated (e.g., Passport required, Dress code: formal)"
                rows={2}
                value={day.importantNotes?.join(", ") || ""}
                onChange={(e) =>
                  onFieldChange(
                    "importantNotes",
                    e.target.value.split(",").map((n) => n.trim()).filter(Boolean)
                  )
                }
                className={`${inputCls} resize-none`}
              />
              {day.importantNotes && day.importantNotes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {day.importantNotes.map((note, i) => (
                    <Chip key={i} label={note} variant="danger" />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Step2Itinerary() {
  const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const addItineraryDay = () => {
    const newDay: ItineraryEntryDTO = {
      day: (values.itinerary ?? []).length + 1,
      title: "",
      description: "",
      mealsProvided: [],
      accommodation: "",
      activities: [],
      travelDistance: "",
      travelMode: TRANSPORT_MODE.BUS as TransportMode,
      estimatedTime: "",
      importantNotes: [],
    };
    const newIndex = (values.itinerary ?? []).length;
    setFieldValue("itinerary", [...(values.itinerary ?? []), newDay]);
    setTimeout(() => setExpandedDays((prev) => [...prev, newIndex]), 50);
  };

  const removeItineraryDay = (index: number) => {
    const itinerary = [...(values.itinerary ?? [])];
    itinerary.splice(index, 1);
    const renumbered = itinerary.map((day, idx) => ({ ...day, day: idx + 1 }));
    setFieldValue("itinerary", renumbered);
    setExpandedDays((prev) =>
      prev.filter((dayIdx) => dayIdx !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  const updateItineraryField = (
    index: number,
    field: keyof ItineraryEntryDTO,
    value: unknown
  ) => {
    const itinerary = [...(values.itinerary ?? [])];
    itinerary[index] = { ...itinerary[index], [field]: value };
    setFieldValue("itinerary", itinerary);
  };

  const toggleDay = (index: number) => {
    setExpandedDays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleMeal = (index: number, meal: MealsProvided) => {
    const currentMeals = values.itinerary?.[index]?.mealsProvided || [];
    const newMeals = currentMeals.includes(meal)
      ? currentMeals.filter((m) => m !== meal)
      : [...currentMeals, meal];
    updateItineraryField(index, "mealsProvided", newMeals);
  };

  const itinerary = values.itinerary ?? [];

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={[
              "p-2.5",
              NEU.radiusMd,
              NEU.surface,
              NEU.raisedSm,
              NEU.border,
              NEU.iconBg.teal,
            ].join(" ")}
          >
            <Calendar className={`w-4 h-4 ${NEU.text.teal}`} />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${NEU.text.primary} ${NEU.font}`}>
              Tour Itinerary
            </h2>
            <p className={`text-xs mt-0.5 ${NEU.text.secondary}`}>
              Plan your day-by-day schedule
            </p>
          </div>
        </div>

        {/* Add Day Button */}
        <button
          type="button"
          onClick={addItineraryDay}
          className={[
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold",
            NEU.radiusMd,
            NEU.surface,
            NEU.raisedSm,
            NEU.border,
            NEU.text.teal,
            NEU.font,
            "transition-all duration-200",
            "hover: dark:hover:",
            "active: dark:active:",
            "whitespace-nowrap",
          ].join(" ")}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Day
        </button>
      </div>

      {/* ── Progress strip ── */}
      {itinerary.length > 0 && (
        <div className="flex items-center gap-1.5 px-1">
          {itinerary.map((_, i) => (
            <div
              key={i}
              onClick={() => toggleDay(i)}
              className={[
                "h-1.5 flex-1 cursor-pointer transition-all duration-200",
                NEU.radiusFull,
                expandedDays.includes(i)
                  ? "bg-[#006666]"
                  : "bg-[#c8c6c4] dark:bg-[#3a3836]",
              ].join(" ")}
              title={`Day ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {itinerary.length === 0 ? (
        <EmptyState onAdd={addItineraryDay} />
      ) : (
        <div className="space-y-4">
          {itinerary.map((day, index) => (
            <DayCard
              key={index}
              day={day}
              index={index}
              isExpanded={expandedDays.includes(index)}
              onToggle={() => toggleDay(index)}
              onRemove={(e) => {
                e.stopPropagation();
                removeItineraryDay(index);
              }}
              onFieldChange={(field, value) => updateItineraryField(index, field, value)}
              onMealToggle={(meal) => toggleMeal(index, meal)}
            />
          ))}
        </div>
      )}

    </div>
  );
}