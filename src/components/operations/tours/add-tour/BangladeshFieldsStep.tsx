"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormikContext } from "formik";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown } from "lucide-react";
import { NeuCheckboxIndicator } from "@/components/operations/tours/shared/NeuCheckboxIndicator";
import {
    MdLocationOn,
    MdMap,
    MdTour,
    MdHotel,
    MdSupportAgent,
    MdDirectionsBus,
    MdLocalPolice,
    MdLocalHospital,
    MdFireTruck,
    MdPhone,
} from "react-icons/md";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { CreateTourDTO } from "@/types/tour/tour.types";
import {
    TRAVEL_TYPE,
    ACCOMMODATION_TYPE,
    DIVISION,
    DISTRICT,
} from "@/constants/tour/tour.const";
import { getDistrictsByDivision } from "@/utils/helpers/conversions.tour";

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm h-11 " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BTN_COMBOBOX =
    "w-full justify-between h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60 " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_COMBOBOX_ERROR =
    "w-full justify-between h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "ring-2 ring-[#FF2157]/40 transition-all duration-200";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_ICON_WELL =
    "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_BADGE_OUTLINE =
    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-[family-name:var(--font-space-mono)] font-bold " +
    "text-[#006666] bg-[#006666]/10 shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]";
const NEU_CHECKBOX_CARD_BASE =
    "rounded-xl p-4 cursor-pointer transition-all duration-200 border border-white/60 " +
    "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_CHECKBOX_CARD_ACTIVE =
    "rounded-xl p-4 cursor-pointer transition-all duration-200 border border-[#006666]/30 " +
    "bg-[#006666]/5 shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]";

// ── Animation Variants ────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const MotionDiv = motion.div;

export default function BangladeshFieldsStep() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

    const [openTourType, setOpenTourType] = useState(false);
    const [openDivision, setOpenDivision] = useState(false);
    const [openDistrict, setOpenDistrict] = useState(false);

    const filteredDistricts = useMemo(() => {
        if (!values.division) return [];
        return getDistrictsByDivision(values.division);
    }, [values.division]);

    useEffect(() => {
        if (
            values.district &&
            filteredDistricts.length > 0 &&
            !filteredDistricts.includes(values.district)
        ) {
            setFieldValue("district", "");
        }
    }, [filteredDistricts, values.district, setFieldValue]);

    const findLabel = (value: string, options: string[]): string =>
        options.find((o) => o === value) || "";

    const handleDivisionChange = (division: string) => {
        setFieldValue("division", division);
        setOpenDivision(false);
    };

    return (
        <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`space-y-8 max-w-7xl mx-auto ${NEU_SURFACE}`}
        >
            {/* Header */}
            <MotionDiv variants={itemVariants}>
                <div className="flex items-center gap-4">
                    <div className={NEU_ICON_WELL}>
                        <MdMap className="w-6 h-6 text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={`text-2xl ${NEU_HEADING}`}>Bangladesh Tour Configuration</h2>
                        <p className={`mt-0.5 ${NEU_MUTED}`}>
                            Configure location-specific details and services for your Bangladesh tour
                        </p>
                    </div>
                </div>
            </MotionDiv>

            <div className={`border-t ${NEU_DIVIDER}`} />

            {/* Location & Tour Details */}
            <MotionDiv variants={itemVariants}>
                <div className={`${NEU_CARD} overflow-hidden`}>
                    {/* Card Header */}
                    <div className="p-5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={NEU_ICON_WELL}>
                                <MdLocationOn className="w-5 h-5 text-[#006666]" />
                            </div>
                            <div>
                                <h3 className={`text-base ${NEU_HEADING}`}>Location & Tour Details</h3>
                                <p className={`text-xs ${NEU_MUTED}`}>Select tour type and destination information</p>
                            </div>
                        </div>
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* Tour Type */}
                            <div className="space-y-2">
                                <Label className={`flex items-center gap-2 ${NEU_LABEL}`}>
                                    <MdTour className="w-3.5 h-3.5 text-[#006666]" />
                                    Tour Type
                                    <span className={NEU_BADGE_OUTLINE}>Required</span>
                                </Label>
                                <Popover open={openTourType} onOpenChange={setOpenTourType}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                                            role="combobox"
                                            aria-expanded={openTourType}
                                            className={cn(
                                                "flex items-center",
                                                touched.tourType && errors.tourType
                                                    ? NEU_BTN_COMBOBOX_ERROR
                                                    : NEU_BTN_COMBOBOX
                                            )}
                                        >
                                            <span className={values.tourType ? "text-[#1E2938]" : "text-[#1E2938]/40"}>
                                                {values.tourType
                                                    ? findLabel(values.tourType, Object.values(TRAVEL_TYPE))
                                                    : "Select tour type"}
                                            </span>
                                            <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-40" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 rounded-xl shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 bg-[#E7E5E4]" align="start">
                                        <Command className="bg-[#E7E5E4]">
                                            <CommandInput placeholder="Search tour type..." className="font-[family-name:var(--font-jetbrains-mono)]" />
                                            <CommandList>
                                                <CommandEmpty className={NEU_MUTED}>No tour type found.</CommandEmpty>
                                                <CommandGroup>
                                                    {Object.values(TRAVEL_TYPE).map((type) => (
                                                        <CommandItem
                                                            key={type}
                                                            value={type}
                                                            onSelect={() => { setFieldValue("tourType", type); setOpenTourType(false); }}
                                                            className="font-[family-name:var(--font-jetbrains-mono)] rounded-lg cursor-pointer"
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4 text-[#006666]", values.tourType === type ? "opacity-100" : "opacity-0")} />
                                                            {type}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {touched.tourType && errors.tourType && (
                                    <p className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">{errors.tourType}</p>
                                )}
                            </div>

                            {/* Division */}
                            <div className="space-y-2">
                                <Label className={`flex items-center gap-2 ${NEU_LABEL}`}>
                                    <MdMap className="w-3.5 h-3.5 text-[#006666]" />
                                    Division
                                    <span className={NEU_BADGE_OUTLINE}>Required</span>
                                </Label>
                                <Popover open={openDivision} onOpenChange={setOpenDivision}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                                            role="combobox"
                                            aria-expanded={openDivision}
                                            className={cn(
                                                "flex items-center",
                                                touched.division && errors.division
                                                    ? NEU_BTN_COMBOBOX_ERROR
                                                    : NEU_BTN_COMBOBOX
                                            )}
                                        >
                                            <span className={values.division ? "text-[#1E2938]" : "text-[#1E2938]/40"}>
                                                {values.division
                                                    ? findLabel(values.division, Object.values(DIVISION))
                                                    : "Select division"}
                                            </span>
                                            <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-40" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 rounded-xl shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 bg-[#E7E5E4]" align="start">
                                        <Command className="bg-[#E7E5E4]">
                                            <CommandInput placeholder="Search division..." className="font-[family-name:var(--font-jetbrains-mono)]" />
                                            <CommandList>
                                                <CommandEmpty className={NEU_MUTED}>No division found.</CommandEmpty>
                                                <CommandGroup>
                                                    {Object.values(DIVISION).map((division) => (
                                                        <CommandItem
                                                            key={division}
                                                            value={division}
                                                            onSelect={() => handleDivisionChange(division)}
                                                            className="font-[family-name:var(--font-jetbrains-mono)] rounded-lg cursor-pointer"
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4 text-[#006666]", values.division === division ? "opacity-100" : "opacity-0")} />
                                                            {division}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {touched.division && errors.division && (
                                    <p className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">{errors.division}</p>
                                )}
                            </div>

                            {/* District */}
                            <div className="space-y-2">
                                <Label className={`flex items-center gap-2 ${NEU_LABEL}`}>
                                    <MdLocationOn className="w-3.5 h-3.5 text-[#006666]" />
                                    District
                                    <span className={NEU_BADGE_OUTLINE}>Required</span>
                                </Label>
                                <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                                            role="combobox"
                                            aria-expanded={openDistrict}
                                            disabled={!values.division}
                                            className={cn(
                                                "flex items-center disabled:opacity-40 disabled:cursor-not-allowed",
                                                touched.district && errors.district
                                                    ? NEU_BTN_COMBOBOX_ERROR
                                                    : NEU_BTN_COMBOBOX
                                            )}
                                        >
                                            <span className={values.district ? "text-[#1E2938]" : "text-[#1E2938]/40"}>
                                                {values.district
                                                    ? findLabel(values.district, Object.values(DISTRICT))
                                                    : values.division ? "Select district" : "Select division first"}
                                            </span>
                                            <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-40" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 rounded-xl shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 bg-[#E7E5E4]" align="start">
                                        <Command className="bg-[#E7E5E4]">
                                            <CommandInput placeholder="Search district..." className="font-[family-name:var(--font-jetbrains-mono)]" />
                                            <CommandList>
                                                <CommandEmpty className={NEU_MUTED}>No district found.</CommandEmpty>
                                                <CommandGroup>
                                                    {filteredDistricts.map((district) => (
                                                        <CommandItem
                                                            key={district}
                                                            value={district}
                                                            onSelect={() => { setFieldValue("district", district); setOpenDistrict(false); }}
                                                            className="font-[family-name:var(--font-jetbrains-mono)] rounded-lg cursor-pointer"
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4 text-[#006666]", values.district === district ? "opacity-100" : "opacity-0")} />
                                                            {district}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {touched.district && errors.district && (
                                    <p className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">{errors.district}</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </MotionDiv>

            {/* Accommodation Options */}
            <MotionDiv variants={itemVariants}>
                <div className={`${NEU_CARD} overflow-hidden`}>
                    <div className="p-5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={NEU_ICON_WELL}>
                                <MdHotel className="w-5 h-5 text-[#FE9900]" />
                            </div>
                            <div>
                                <h3 className={`text-base ${NEU_HEADING}`}>Accommodation Options</h3>
                                <p className={`text-xs ${NEU_MUTED}`}>Select available accommodation types for this tour</p>
                            </div>
                        </div>
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.values(ACCOMMODATION_TYPE).map((type) => {
                                const isActive = values.accommodationType?.includes(type);
                                return (
                                    <MotionDiv
                                        key={type}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={isActive ? NEU_CHECKBOX_CARD_ACTIVE : NEU_CHECKBOX_CARD_BASE}
                                        onClick={() => {
                                            const current = values.accommodationType || [];
                                            const next = isActive
                                                ? current.filter((t) => t !== type)
                                                : [...current, type];
                                            setFieldValue("accommodationType", next);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <NeuCheckboxIndicator checked={!!isActive} />
                                            <Label className={`text-sm cursor-pointer font-[family-name:var(--font-space-mono)] ${isActive ? "text-[#006666] font-bold" : "text-[#1E2938]"}`}>
                                                {type}
                                            </Label>
                                        </div>
                                    </MotionDiv>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </MotionDiv>

            {/* Included Services */}
            <MotionDiv variants={itemVariants}>
                <div className={`${NEU_CARD} overflow-hidden`}>
                    <div className="p-5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={NEU_ICON_WELL}>
                                <MdSupportAgent className="w-5 h-5 text-[#006666]" />
                            </div>
                            <div>
                                <h3 className={`text-base ${NEU_HEADING}`}>Included Services</h3>
                                <p className={`text-xs ${NEU_MUTED}`}>Select services included in the tour package</p>
                            </div>
                        </div>
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Guide */}
                            <MotionDiv
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={values.guideIncluded ? NEU_CHECKBOX_CARD_ACTIVE : NEU_CHECKBOX_CARD_BASE}
                                onClick={() => setFieldValue("guideIncluded", !values.guideIncluded)}
                            >
                                <div className="flex items-center gap-3">
                                    <NeuCheckboxIndicator checked={!!values.guideIncluded} />
                                    <MdSupportAgent className={`w-5 h-5 ${values.guideIncluded ? "text-[#006666]" : "text-[#1E2938]/50"}`} />
                                    <Label className={`font-[family-name:var(--font-space-mono)] font-medium cursor-pointer ${values.guideIncluded ? "text-[#006666]" : "text-[#1E2938]"}`}>
                                        Professional Guide
                                    </Label>
                                </div>
                            </MotionDiv>

                            {/* Transport */}
                            <MotionDiv
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={values.transportIncluded ? NEU_CHECKBOX_CARD_ACTIVE : NEU_CHECKBOX_CARD_BASE}
                                onClick={() => setFieldValue("transportIncluded", !values.transportIncluded)}
                            >
                                <div className="flex items-center gap-3">
                                    <NeuCheckboxIndicator checked={!!values.transportIncluded} />
                                    <MdDirectionsBus className={`w-5 h-5 ${values.transportIncluded ? "text-[#006666]" : "text-[#1E2938]/50"}`} />
                                    <Label className={`font-[family-name:var(--font-space-mono)] font-medium cursor-pointer ${values.transportIncluded ? "text-[#006666]" : "text-[#1E2938]"}`}>
                                        Transportation
                                    </Label>
                                </div>
                            </MotionDiv>
                        </div>
                    </div>
                </div>
            </MotionDiv>

            {/* Emergency Contacts */}
            <MotionDiv variants={itemVariants}>
                <div className={`${NEU_CARD} overflow-hidden`}>
                    <div className="p-5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                                <MdPhone className="w-5 h-5 text-[#FF2157]" />
                            </div>
                            <div>
                                <h3 className={`text-base ${NEU_HEADING}`}>Emergency Contact Information</h3>
                                <p className={`text-xs ${NEU_MUTED}`}>Provide essential emergency numbers for tour safety</p>
                            </div>
                        </div>
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                { icon: MdLocalPolice, label: "Police Number", field: "emergencyContacts.policeNumber", value: values.emergencyContacts?.policeNumber },
                                { icon: MdLocalHospital, label: "Ambulance Number", field: "emergencyContacts.ambulanceNumber", value: values.emergencyContacts?.ambulanceNumber },
                                { icon: MdFireTruck, label: "Fire Service Number", field: "emergencyContacts.fireServiceNumber", value: values.emergencyContacts?.fireServiceNumber },
                                { icon: MdPhone, label: "Local Emergency", field: "emergencyContacts.localEmergency", value: values.emergencyContacts?.localEmergency },
                            ].map(({ icon: Icon, label, field, value }) => (
                                <div key={field} className="space-y-2">
                                    <Label className={`flex items-center gap-1.5 ${NEU_LABEL}`}>
                                        <Icon className="w-3.5 h-3.5 text-[#FF2157]" />
                                        {label}
                                    </Label>
                                    <Input
                                        name={field}
                                        placeholder="e.g., +880-XXX-XXXX"
                                        value={value || ""}
                                        onChange={(e) => setFieldValue(field, e.target.value)}
                                        className={NEU_INPUT}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </MotionDiv>
        </MotionDiv>
    );
}