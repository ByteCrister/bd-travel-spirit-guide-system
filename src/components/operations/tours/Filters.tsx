"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp, DollarSign, Clock, MapPin, Tag, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    TOUR_STATUS, TRAVEL_TYPE, DIFFICULTY_LEVEL, DIVISION, DISTRICT,
    AUDIENCE_TYPE, TOUR_CATEGORIES, MODERATION_STATUS, CURRENCY,
    Division, District, TravelType, DifficultyLevel, AudienceType,
    TourCategories, Currency, TourStatus, ModerationStatus,
} from "@/constants/tour/tour.const";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { TourFilterOptions } from "@/types/tour/tour.types";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { motion, AnimatePresence } from "framer-motion";

// ─── Neumorphism Design Tokens ──────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SURFACE_INSET = "bg-[#E7E5E4] ";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    " " +
    "hover: hover:bg-[#007777] " +
    "active: " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover: " +
    "active: " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BADGE_PRIMARY =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] ";
const NEU_BADGE =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] ";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL_PRIMARY = "p-2 rounded-xl bg-[#006666]/10 ";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ─── Helpers ────────────────────────────────────────────────────────────────
const safeGetArray = <T,>(arr: T[] | undefined): T[] => arr || [];

type ItemPerPage = 10 | 20 | 50 | 100;
const ITEMS_PER_PAGE_OPTIONS: ItemPerPage[] = [10, 20, 50, 100];

export const Filters: React.FC = () => {
    const { fetchTours, tourFilters: initialFilters } = useTourDetailStore();

    const [search, setSearch] = useState<string>(initialFilters?.search || "");
    const [division, setDivision] = useState<Division[]>(safeGetArray(initialFilters?.division));
    const [district, setDistrict] = useState<District[]>(safeGetArray(initialFilters?.district));
    const [tourType, setTourType] = useState<TravelType[]>(safeGetArray(initialFilters?.tourType));
    const [difficulty, setDifficulty] = useState<DifficultyLevel[]>(safeGetArray(initialFilters?.difficulty));
    const [audience, setAudience] = useState<AudienceType[]>(safeGetArray(initialFilters?.audience));
    const [categories, setCategories] = useState<TourCategories[]>(safeGetArray(initialFilters?.categories));
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [currency, setCurrency] = useState<Currency | "">(initialFilters?.currency || "");
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialFilters?.startDate ? new Date(initialFilters.startDate) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialFilters?.endDate ? new Date(initialFilters.endDate) : undefined
    );
    const [durationMin, setDurationMin] = useState<string>("");
    const [durationMax, setDurationMax] = useState<string>("");
    const [guideIncluded, setGuideIncluded] = useState<boolean | undefined>(initialFilters?.guideIncluded);
    const [transportIncluded, setTransportIncluded] = useState<boolean | undefined>(initialFilters?.transportIncluded);
    const [featured, setFeatured] = useState<boolean | undefined>(initialFilters?.featured);
    const [status, setStatus] = useState<TourStatus[]>(safeGetArray(initialFilters?.status));
    const [moderationStatus, setModerationStatus] = useState<ModerationStatus[]>(safeGetArray(initialFilters?.moderationStatus));
    const [tags, setTags] = useState<string[]>(safeGetArray(initialFilters?.tags));
    const [newTag, setNewTag] = useState<string>("");
    const [itemsPerPage, setItemsPerPage] = useState<string>("20");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

    useEffect(() => {
        if (initialFilters?.minPrice !== undefined) setMinPrice(initialFilters.minPrice.toString());
        if (initialFilters?.maxPrice !== undefined) setMaxPrice(initialFilters.maxPrice.toString());
        if (initialFilters?.durationMin !== undefined) setDurationMin(initialFilters.durationMin.toString());
        if (initialFilters?.durationMax !== undefined) setDurationMax(initialFilters.durationMax.toString());
    }, [initialFilters]);

    const debouncedApply = useDebouncedCallback(
        (filters: TourFilterOptions) => {
            fetchTours({ page: 1, limit: Number(itemsPerPage ?? 20) }, filters).catch(() => { });
        },
        500
    );

    const applyFilters = useCallback(() => {
        const filters: TourFilterOptions = {
            search: search || undefined,
            division: division.length > 0 ? division : undefined,
            district: district.length > 0 ? district : undefined,
            tourType: tourType.length > 0 ? tourType : undefined,
            difficulty: difficulty.length > 0 ? difficulty : undefined,
            audience: audience.length > 0 ? audience : undefined,
            categories: categories.length > 0 ? categories : undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            currency: currency || undefined,
            startDate: startDate?.toISOString().split('T')[0],
            endDate: endDate?.toISOString().split('T')[0],
            durationMin: durationMin ? Number(durationMin) : undefined,
            durationMax: durationMax ? Number(durationMax) : undefined,
            guideIncluded,
            transportIncluded,
            featured,
            status: status.length > 0 ? status : undefined,
            moderationStatus: moderationStatus.length > 0 ? moderationStatus : undefined,
            tags: tags.length > 0 ? tags : undefined,
        };
        debouncedApply(filters);
    }, [search, division, district, tourType, difficulty, audience, categories, minPrice, maxPrice, currency,
        startDate, endDate, durationMin, durationMax, guideIncluded, transportIncluded, featured,
        status, moderationStatus, tags, debouncedApply]);

    const addTag = () => {
        const trimmedTag = newTag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => setTags(tags.filter(t => t !== tagToRemove));

    const resetFilters = () => {
        setSearch(""); setDivision([]); setDistrict([]); setTourType([]);
        setDifficulty([]); setAudience([]); setCategories([]);
        setMinPrice(""); setMaxPrice(""); setCurrency("");
        setStartDate(undefined); setEndDate(undefined);
        setDurationMin(""); setDurationMax("");
        setGuideIncluded(undefined); setTransportIncluded(undefined);
        setFeatured(undefined); setStatus([]); setModerationStatus([]); setTags([]);
    };

    useEffect(() => {
        applyFilters();
    }, [division, district, tourType, difficulty, audience, categories, status, moderationStatus, tags, itemsPerPage, applyFilters]);

    // Options
    const tourTypeOptions: MultiSelectOption<TravelType>[] = Object.values(TRAVEL_TYPE).map(v => ({ value: v, label: v }));
    const statusOptions: MultiSelectOption<TourStatus>[] = Object.values(TOUR_STATUS).map(v => ({ value: v, label: v }));
    const difficultyOptions: MultiSelectOption<DifficultyLevel>[] = Object.values(DIFFICULTY_LEVEL).map(v => ({ value: v, label: v }));
    const divisionOptions: MultiSelectOption<Division>[] = Object.values(DIVISION).map(v => ({ value: v, label: v }));
    const districtOptions: MultiSelectOption<District>[] = Object.values(DISTRICT).map(v => ({ value: v, label: v }));
    const audienceOptions: MultiSelectOption<AudienceType>[] = Object.values(AUDIENCE_TYPE).map(v => ({ value: v, label: v }));
    const categoryOptions: MultiSelectOption<TourCategories>[] = Object.values(TOUR_CATEGORIES).map(v => ({ value: v, label: v }));
    const moderationStatusOptions: MultiSelectOption<ModerationStatus>[] = Object.values(MODERATION_STATUS).map(v => ({ value: v, label: v }));
    const currencyOptions: MultiSelectOption<Currency>[] = Object.values(CURRENCY).map(v => ({ value: v, label: v }));

    const activeFilterCount = [
        division.length > 0, district.length > 0, tourType.length > 0, difficulty.length > 0,
        audience.length > 0, categories.length > 0, status.length > 0, moderationStatus.length > 0,
        tags.length > 0, minPrice, maxPrice, startDate, endDate, durationMin, durationMax,
        guideIncluded !== undefined, transportIncluded !== undefined, featured !== undefined,
    ].filter(Boolean).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${NEU_SURFACE} rounded-2xl p-5 space-y-5`}
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <FiFilter className="h-4 w-4 text-[#006666]" />
                    </div>
                    <div>
                        <h3 className={`${NEU_HEADING} text-base`}>Filter Tours</h3>
                        <p className={NEU_MUTED}>
                            {activeFilterCount > 0
                                ? `${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} applied`
                                : "No filters applied"}
                        </p>
                    </div>
                </div>

                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#FF2157]`}
                    >
                        <FiX className="h-3.5 w-3.5" />
                        Clear All
                    </button>
                )}
            </div>

            {/* ── Primary Filters ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
                {/* Search */}
                <div className="sm:col-span-2 md:col-span-5 space-y-1.5">
                    <Label className={NEU_LABEL}>
                        <span className="flex items-center gap-1.5">
                            <FiSearch className="h-3 w-3" />
                            Search Tours
                        </span>
                    </Label>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
                        <input
                            placeholder="Search by title, slug, or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${NEU_INPUT} w-full pl-9 pr-9 py-2.5`}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 hover:text-[#FF2157] transition-colors"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tour Type */}
                <div className="md:col-span-2 space-y-1.5">
                    <Label className={NEU_LABEL}>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            Tour Type
                        </span>
                    </Label>
                    <MultiSelect
                        options={tourTypeOptions}
                        selected={tourType}
                        onChange={setTourType}
                        placeholder="Select types"
                    />
                </div>

                {/* Status */}
                <div className="md:col-span-2 space-y-1.5">
                    <Label className={NEU_LABEL}>
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" />
                            Status
                        </span>
                    </Label>
                    <MultiSelect
                        options={statusOptions}
                        selected={status}
                        onChange={setStatus}
                        placeholder="Select status"
                    />
                </div>

                {/* Difficulty */}
                <div className="md:col-span-2 space-y-1.5">
                    <Label className={NEU_LABEL}>Difficulty</Label>
                    <MultiSelect
                        options={difficultyOptions}
                        selected={difficulty}
                        onChange={setDifficulty}
                        placeholder="Select difficulty"
                    />
                </div>

                {/* Items Per Page */}
                <div className="md:col-span-1 space-y-1.5">
                    <Label className={NEU_LABEL}>Per Page</Label>
                    <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                        <SelectTrigger className={`${NEU_INPUT} px-3 py-2.5 h-auto`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                                <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Advanced Filters Toggle ── */}
            <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`${NEU_BTN_GHOST} w-full flex items-center justify-between px-4 py-3 text-sm`}
            >
                <span className="flex items-center gap-2 text-[#1E2938]/70">
                    <FiFilter className="h-4 w-4" />
                    <span className={`${NEU_HEADING} text-sm`}>Advanced Filters</span>
                </span>
                <span className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <span className={`${NEU_BADGE_PRIMARY} text-[10px] px-2 py-0.5`}>
                            {activeFilterCount}
                        </span>
                    )}
                    {showAdvancedFilters
                        ? <ChevronUp className="h-4 w-4 text-[#006666]" />
                        : <ChevronDown className="h-4 w-4 text-[#1E2938]/50" />
                    }
                </span>
            </button>

            {/* ── Advanced Filters Panel ── */}
            <AnimatePresence>
                {showAdvancedFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className={`${NEU_SURFACE_INSET} rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`}>
                            {/* Division */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3" />Division
                                    </span>
                                </Label>
                                <MultiSelect options={divisionOptions} selected={division} onChange={setDivision} placeholder="Select division" />
                            </div>

                            {/* District */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3" />District
                                    </span>
                                </Label>
                                <MultiSelect options={districtOptions} selected={district} onChange={setDistrict} placeholder="Select district" />
                            </div>

                            {/* Audience */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>Audience</Label>
                                <MultiSelect options={audienceOptions} selected={audience} onChange={setAudience} placeholder="Select audience" />
                            </div>

                            {/* Categories */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>
                                    <span className="flex items-center gap-1.5">
                                        <Tag className="h-3 w-3" />Categories
                                    </span>
                                </Label>
                                <MultiSelect options={categoryOptions} selected={categories} onChange={setCategories} placeholder="Select categories" />
                            </div>

                            {/* Price Range */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>
                                    <span className="flex items-center gap-1.5">
                                        <DollarSign className="h-3 w-3" />Price Range
                                    </span>
                                </Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className={`${NEU_INPUT} w-full px-3 py-2`}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className={`${NEU_INPUT} w-full px-3 py-2`}
                                        />
                                    </div>
                                    <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                                        <SelectTrigger className={`${NEU_INPUT} px-3 py-2.5 h-auto`}>
                                            <SelectValue placeholder="Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencyOptions.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3 w-3" />Date Range
                                    </span>
                                </Label>
                                <div className="space-y-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    `${NEU_BTN_GHOST} w-full flex items-center gap-2 px-3 py-2.5 text-sm`,
                                                    !startDate && "text-[#1E2938]/40"
                                                )}
                                            >
                                                <CalendarIcon className="h-4 w-4 shrink-0" />
                                                {startDate ? format(startDate, "PPP") : "Start date"}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    `${NEU_BTN_GHOST} w-full flex items-center gap-2 px-3 py-2.5 text-sm`,
                                                    !endDate && "text-[#1E2938]/40"
                                                )}
                                            >
                                                <CalendarIcon className="h-4 w-4 shrink-0" />
                                                {endDate ? format(endDate, "PPP") : "End date"}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Duration Range */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />Duration (days)
                                    </span>
                                </Label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={durationMin}
                                        onChange={(e) => setDurationMin(e.target.value)}
                                        className={`${NEU_INPUT} w-full px-3 py-2`}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={durationMax}
                                        onChange={(e) => setDurationMax(e.target.value)}
                                        className={`${NEU_INPUT} w-full px-3 py-2`}
                                    />
                                </div>
                            </div>

                            {/* Boolean Filters */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>Features</Label>
                                <div className={`${NEU_SURFACE_INSET} rounded-xl p-3 space-y-3`}>
                                    {[
                                        { id: "guideIncluded", label: "Guide Included", value: guideIncluded, setter: setGuideIncluded },
                                        { id: "transportIncluded", label: "Transport Included", value: transportIncluded, setter: setTransportIncluded },
                                    ].map(({ id, label, value, setter }) => (
                                        <div key={id} className="flex items-center gap-2.5">
                                            <Checkbox
                                                id={id}
                                                checked={value === true}
                                                onCheckedChange={(c) => setter(c === true ? true : undefined)}
                                                className="border-[#006666]/40 data-[state=checked]:bg-[#006666] data-[state=checked]:border-[#006666]"
                                            />
                                            <Label htmlFor={id} className={`${NEU_MUTED} cursor-pointer`}>{label}</Label>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2.5">
                                        <Checkbox
                                            id="featured"
                                            checked={featured === true}
                                            onCheckedChange={(c) => setFeatured(c === true ? true : undefined)}
                                            className="border-[#006666]/40 data-[state=checked]:bg-[#006666] data-[state=checked]:border-[#006666]"
                                        />
                                        <Label htmlFor="featured" className={`${NEU_MUTED} cursor-pointer flex items-center gap-1.5`}>
                                            <Sparkles className="h-3 w-3 text-[#FE9900]" />
                                            Featured Tours
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Moderation Status */}
                            <div className="space-y-1.5">
                                <Label className={NEU_LABEL}>Moderation Status</Label>
                                <MultiSelect
                                    options={moderationStatusOptions}
                                    selected={moderationStatus}
                                    onChange={setModerationStatus}
                                    placeholder="Select status"
                                />
                            </div>

                            {/* Tags */}
                            <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                                <Label className={NEU_LABEL}>
                                    <span className="flex items-center gap-1.5">
                                        <Tag className="h-3 w-3" />Tags
                                    </span>
                                </Label>
                                <div className="flex gap-2">
                                    <input
                                        placeholder="Add a tag and press Enter"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                        className={`${NEU_INPUT} flex-1 px-3 py-2.5`}
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        disabled={!newTag.trim()}
                                        className={`${NEU_BTN_PRIMARY} px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
                                    >
                                        Add
                                    </button>
                                </div>
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <AnimatePresence>
                                            {tags.map((tag) => (
                                                <motion.span
                                                    key={tag}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className={`${NEU_BADGE_PRIMARY} group`}
                                                >
                                                    <Tag className="h-3 w-3" />
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-0.5 hover:text-[#FF2157] transition-colors"
                                                    >
                                                        <FiX size={12} />
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Active Filters Summary ── */}
            <AnimatePresence>
                {activeFilterCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`border-t ${NEU_DIVIDER} pt-4 space-y-3`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`${NEU_LABEL} flex items-center gap-1.5`}>
                                <Sparkles className="h-3.5 w-3.5 text-[#006666]" />
                                Active Filters ({activeFilterCount})
                            </span>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-xs text-[#FF2157] hover:text-[#FF2157]/80 font-[family-name:var(--font-space-mono)] flex items-center gap-1 transition-colors"
                            >
                                <FiX className="h-3 w-3" />Clear All
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {search && (
                                <span className={NEU_BADGE_PRIMARY}>
                                    <FiSearch className="h-3 w-3" />
                                    {search}
                                    <button type="button" onClick={() => setSearch("")} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}

                            {tourType.map((type) => (
                                <span key={type} className={NEU_BADGE}>
                                    Type: {type}
                                    <button type="button" onClick={() => setTourType(tourType.filter(t => t !== type))} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            ))}

                            {division.map((div) => (
                                <span key={div} className={NEU_BADGE}>
                                    <MapPin className="h-3 w-3" />
                                    {div}
                                    <button type="button" onClick={() => setDivision(division.filter(d => d !== div))} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            ))}

                            {minPrice && (
                                <span className={NEU_BADGE}>
                                    <DollarSign className="h-3 w-3" />Min: {minPrice}
                                    <button type="button" onClick={() => setMinPrice("")} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}
                            {maxPrice && (
                                <span className={NEU_BADGE}>
                                    <DollarSign className="h-3 w-3" />Max: {maxPrice}
                                    <button type="button" onClick={() => setMaxPrice("")} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}

                            {startDate && (
                                <span className={NEU_BADGE}>
                                    <CalendarIcon className="h-3 w-3" />From: {format(startDate, "PP")}
                                    <button type="button" onClick={() => setStartDate(undefined)} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}
                            {endDate && (
                                <span className={NEU_BADGE}>
                                    <CalendarIcon className="h-3 w-3" />To: {format(endDate, "PP")}
                                    <button type="button" onClick={() => setEndDate(undefined)} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}

                            {durationMin && (
                                <span className={NEU_BADGE}>
                                    <Clock className="h-3 w-3" />Min: {durationMin}d
                                    <button type="button" onClick={() => setDurationMin("")} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}
                            {durationMax && (
                                <span className={NEU_BADGE}>
                                    <Clock className="h-3 w-3" />Max: {durationMax}d
                                    <button type="button" onClick={() => setDurationMax("")} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}

                            {guideIncluded !== undefined && (
                                <span className={NEU_BADGE}>
                                    Guide Included
                                    <button type="button" onClick={() => setGuideIncluded(undefined)} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}
                            {transportIncluded !== undefined && (
                                <span className={NEU_BADGE}>
                                    Transport Included
                                    <button type="button" onClick={() => setTransportIncluded(undefined)} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}
                            {featured !== undefined && (
                                <span className={NEU_BADGE}>
                                    <Sparkles className="h-3 w-3 text-[#FE9900]" />Featured
                                    <button type="button" onClick={() => setFeatured(undefined)} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            )}

                            {difficulty.map((diff) => (
                                <span key={diff} className={NEU_BADGE}>
                                    Difficulty: {diff}
                                    <button type="button" onClick={() => setDifficulty(difficulty.filter(d => d !== diff))} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            ))}
                            {status.map((stat) => (
                                <span key={stat} className={NEU_BADGE}>
                                    Status: {stat}
                                    <button type="button" onClick={() => setStatus(status.filter(s => s !== stat))} className="ml-0.5 hover:text-[#FF2157] transition-colors"><FiX size={12} /></button>
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};