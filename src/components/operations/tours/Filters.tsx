"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { useCompanyDashboardStore } from "@/store/company-detail.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp, DollarSign, Clock, MapPin, Tag, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    TOUR_STATUS,
    TRAVEL_TYPE,
    DIFFICULTY_LEVEL,
    DIVISION,
    DISTRICT,
    AUDIENCE_TYPE,
    CONTENT_CATEGORY,
    MODERATION_STATUS,
    CURRENCY,
    Division,
    District,
    TravelType,
    DifficultyLevel,
    AudienceType,
    ContentCategory,
    Currency,
    TourStatus,
    ModerationStatus,
} from "@/constants/tour.const";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { TourFilterOptions } from "@/types/tour.types";
import { Badge } from "@/components/ui/badge";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { motion, AnimatePresence } from "framer-motion";

const safeGetArray = <T,>(arr: T[] | undefined): T[] => arr || [];

type ItemPerPage = 10 | 20 | 50 | 100;
const ITEMS_PER_PAGE_OPTIONS: ItemPerPage[] = [10, 20, 50, 100];

export const Filters: React.FC = () => {
    const { fetchTours, tourFilters: initialFilters } = useCompanyDashboardStore();

    // Initialize all filter states with proper types
    const [search, setSearch] = useState<string>(initialFilters?.search || "");
    const [division, setDivision] = useState<Division[]>(safeGetArray(initialFilters?.division));
    const [district, setDistrict] = useState<District[]>(safeGetArray(initialFilters?.district));
    const [tourType, setTourType] = useState<TravelType[]>(safeGetArray(initialFilters?.tourType));
    const [difficulty, setDifficulty] = useState<DifficultyLevel[]>(safeGetArray(initialFilters?.difficulty));
    const [audience, setAudience] = useState<AudienceType[]>(safeGetArray(initialFilters?.audience));
    const [categories, setCategories] = useState<ContentCategory[]>(safeGetArray(initialFilters?.categories));
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

    // Initialize numeric values from initial filters
    useEffect(() => {
        if (initialFilters?.minPrice !== undefined) {
            setMinPrice(initialFilters.minPrice.toString());
        }
        if (initialFilters?.maxPrice !== undefined) {
            setMaxPrice(initialFilters.maxPrice.toString());
        }
        if (initialFilters?.durationMin !== undefined) {
            setDurationMin(initialFilters.durationMin.toString());
        }
        if (initialFilters?.durationMax !== undefined) {
            setDurationMax(initialFilters.durationMax.toString());
        }
    }, [initialFilters]);

    const debouncedApply = useDebouncedCallback(
        (filters: TourFilterOptions) => {
            const itemsPerPageNum = itemsPerPage ?? 20;
            fetchTours({ page: 1, limit: Number(itemsPerPageNum) }, filters).catch(() => { });
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
    }, [search, division, district, tourType, difficulty, audience, categories, minPrice, maxPrice, currency, startDate, endDate, durationMin, durationMax, guideIncluded, transportIncluded, featured, status, moderationStatus, tags, debouncedApply]);

    const addTag = () => {
        const trimmedTag = newTag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const resetFilters = () => {
        setSearch("");
        setDivision([]);
        setDistrict([]);
        setTourType([]);
        setDifficulty([]);
        setAudience([]);
        setCategories([]);
        setMinPrice("");
        setMaxPrice("");
        setCurrency("");
        setStartDate(undefined);
        setEndDate(undefined);
        setDurationMin("");
        setDurationMax("");
        setGuideIncluded(undefined);
        setTransportIncluded(undefined);
        setFeatured(undefined);
        setStatus([]);
        setModerationStatus([]);
        setTags([]);
    };

    // Apply filters when any filter changes
    useEffect(() => {
        applyFilters();
    }, [
        division, district, tourType, difficulty, audience, categories,
        status, moderationStatus, tags, itemsPerPage, applyFilters
    ]);

    // Convert enums to MultiSelectOption format
    const tourTypeOptions: MultiSelectOption<TravelType>[] = Object.values(TRAVEL_TYPE).map(value => ({
        value,
        label: value,
    }));

    const statusOptions: MultiSelectOption<TourStatus>[] = Object.values(TOUR_STATUS).map(value => ({
        value,
        label: value,
    }));

    const difficultyOptions: MultiSelectOption<DifficultyLevel>[] = Object.values(DIFFICULTY_LEVEL).map(value => ({
        value,
        label: value,
    }));

    const divisionOptions: MultiSelectOption<Division>[] = Object.values(DIVISION).map(value => ({
        value,
        label: value,
    }));

    const districtOptions: MultiSelectOption<District>[] = Object.values(DISTRICT).map(value => ({
        value,
        label: value,
    }));

    const audienceOptions: MultiSelectOption<AudienceType>[] = Object.values(AUDIENCE_TYPE).map(value => ({
        value,
        label: value,
    }));

    const categoryOptions: MultiSelectOption<ContentCategory>[] = Object.values(CONTENT_CATEGORY).map(value => ({
        value,
        label: value,
    }));

    const moderationStatusOptions: MultiSelectOption<ModerationStatus>[] = Object.values(MODERATION_STATUS).map(value => ({
        value,
        label: value,
    }));

    const currencyOptions: MultiSelectOption<Currency>[] = Object.values(CURRENCY).map(value => ({
        value,
        label: value,
    }));

    // Count active filters
    const activeFilterCount = [
        division.length > 0,
        district.length > 0,
        tourType.length > 0,
        difficulty.length > 0,
        audience.length > 0,
        categories.length > 0,
        status.length > 0,
        moderationStatus.length > 0,
        tags.length > 0,
        minPrice,
        maxPrice,
        startDate,
        endDate,
        durationMin,
        durationMax,
        guideIncluded !== undefined,
        transportIncluded !== undefined,
        featured !== undefined,
    ].filter(Boolean).length;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <FiFilter className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Filter Tours</h3>
                        <p className="text-xs text-muted-foreground">
                            {activeFilterCount > 0 
                                ? `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`
                                : 'No filters applied'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <FiX className="h-4 w-4 mr-1" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {/* Search and Primary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search */}
                <div className="md:col-span-5">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FiSearch className="h-3 w-3" />
                        Search Tours
                    </Label>
                    <div className="relative">
                        <Input
                            placeholder="Search by title, slug, or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pr-10"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tour Type */}
                <div className="md:col-span-2">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        Tour Type
                    </Label>
                    <MultiSelect
                        options={tourTypeOptions}
                        selected={tourType}
                        onChange={setTourType}
                        placeholder="Select types"
                    />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Status
                    </Label>
                    <MultiSelect
                        options={statusOptions}
                        selected={status}
                        onChange={setStatus}
                        placeholder="Select status"
                    />
                </div>

                {/* Difficulty */}
                <div className="md:col-span-2">
                    <Label className="text-sm font-medium mb-2 block">Difficulty</Label>
                    <MultiSelect
                        options={difficultyOptions}
                        selected={difficulty}
                        onChange={setDifficulty}
                        placeholder="Select difficulty"
                    />
                </div>

                {/* Items Per Page */}
                <div className="md:col-span-1">
                    <Label className="text-sm font-medium mb-2 block">Per Page</Label>
                    <Select
                        value={itemsPerPage}
                        onValueChange={(value) => setItemsPerPage(value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                                <SelectItem key={num} value={String(num)}>
                                    {num}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full group hover:bg-primary/5 transition-colors"
            >
                <FiFilter className="h-4 w-4 mr-2" />
                <span className="font-medium">Advanced Filters</span>
                {showAdvancedFilters ? (
                    <ChevronUp className="h-4 w-4 ml-auto group-hover:text-primary transition-colors" />
                ) : (
                    <ChevronDown className="h-4 w-4 ml-auto group-hover:text-primary transition-colors" />
                )}
            </Button>

            {/* Advanced Filters */}
            <AnimatePresence>
                {showAdvancedFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 border border-border/50 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10">
                            {/* Division */}
                            <div>
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    Division
                                </Label>
                                <MultiSelect
                                    options={divisionOptions}
                                    selected={division}
                                    onChange={setDivision}
                                    placeholder="Select division"
                                />
                            </div>

                            {/* District */}
                            <div>
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    District
                                </Label>
                                <MultiSelect
                                    options={districtOptions}
                                    selected={district}
                                    onChange={setDistrict}
                                    placeholder="Select district"
                                />
                            </div>

                            {/* Audience */}
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Audience</Label>
                                <MultiSelect
                                    options={audienceOptions}
                                    selected={audience}
                                    onChange={setAudience}
                                    placeholder="Select audience"
                                />
                            </div>

                            {/* Categories */}
                            <div>
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    Categories
                                </Label>
                                <MultiSelect
                                    options={categoryOptions}
                                    selected={categories}
                                    onChange={setCategories}
                                    placeholder="Select categories"
                                />
                            </div>

                            {/* Price Range */}
                            <div>
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" />
                                    Price Range
                                </Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Select
                                        value={currency}
                                        onValueChange={(value) => setCurrency(value as Currency)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencyOptions.map((curr) => (
                                                <SelectItem key={curr.value} value={curr.value}>
                                                    {curr.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <CalendarIcon className="h-3 w-3" />
                                    Date Range
                                </Label>
                                <div className="space-y-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : "Start date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : "End date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Duration Range */}
                            <div>
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    Duration (days)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={durationMin}
                                        onChange={(e) => setDurationMin(e.target.value)}
                                        className="w-full"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={durationMax}
                                        onChange={(e) => setDurationMax(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Boolean Filters */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium block mb-3">Features</Label>
                                <div className="space-y-3 bg-background/50 rounded-lg p-3 border border-border/50">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="guideIncluded"
                                            checked={guideIncluded === true}
                                            onCheckedChange={(checked) => setGuideIncluded(checked === true ? true : undefined)}
                                        />
                                        <Label htmlFor="guideIncluded" className="cursor-pointer">
                                            Guide Included
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="transportIncluded"
                                            checked={transportIncluded === true}
                                            onCheckedChange={(checked) => setTransportIncluded(checked === true ? true : undefined)}
                                        />
                                        <Label htmlFor="transportIncluded" className="cursor-pointer">
                                            Transport Included
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="featured"
                                            checked={featured === true}
                                            onCheckedChange={(checked) => setFeatured(checked === true ? true : undefined)}
                                        />
                                        <Label htmlFor="featured" className="cursor-pointer flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" />
                                            Featured Tours
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Moderation Status */}
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Moderation Status</Label>
                                <MultiSelect
                                    options={moderationStatusOptions}
                                    selected={moderationStatus}
                                    onChange={setModerationStatus}
                                    placeholder="Select status"
                                />
                            </div>

                            {/* Tags */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    Tags
                                </Label>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Add a tag and press Enter"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button 
                                        onClick={addTag}
                                        disabled={!newTag.trim()}
                                        className="px-6"
                                    >
                                        Add
                                    </Button>
                                </div>
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <motion.div
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                            >
                                                <Badge 
                                                    variant="secondary" 
                                                    className="flex items-center gap-2 px-3 py-1 hover:bg-primary/10 transition-colors"
                                                >
                                                    <Tag className="h-3 w-3" />
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-1 hover:text-destructive transition-colors"
                                                    >
                                                        <FiX size={14} />
                                                    </button>
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t pt-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Active Filters ({activeFilterCount})
                        </Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <FiX className="h-3 w-3 mr-1" />
                            Clear All
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {search && (
                            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                                <FiSearch className="h-3 w-3" />
                                {search}
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {tourType.map((type) => (
                            <Badge key={type} variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Type: {type}
                                <button
                                    type="button"
                                    onClick={() => setTourType(tourType.filter(t => t !== type))}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        ))}

                        {division.map((div) => (
                            <Badge key={div} variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <MapPin className="h-3 w-3" />
                                {div}
                                <button
                                    type="button"
                                    onClick={() => setDivision(division.filter(d => d !== div))}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        ))}

                        {minPrice && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <DollarSign className="h-3 w-3" />
                                Min: {minPrice}
                                <button
                                    type="button"
                                    onClick={() => setMinPrice("")}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {maxPrice && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <DollarSign className="h-3 w-3" />
                                Max: {maxPrice}
                                <button
                                    type="button"
                                    onClick={() => setMaxPrice("")}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {startDate && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <CalendarIcon className="h-3 w-3" />
                                From: {format(startDate, "PP")}
                                <button
                                    type="button"
                                    onClick={() => setStartDate(undefined)}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {endDate && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <CalendarIcon className="h-3 w-3" />
                                To: {format(endDate, "PP")}
                                <button
                                    type="button"
                                    onClick={() => setEndDate(undefined)}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {durationMin && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <Clock className="h-3 w-3" />
                                Min: {durationMin}d
                                <button
                                    type="button"
                                    onClick={() => setDurationMin("")}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {durationMax && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <Clock className="h-3 w-3" />
                                Max: {durationMax}d
                                <button
                                    type="button"
                                    onClick={() => setDurationMax("")}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {guideIncluded !== undefined && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Guide Included
                                <button
                                    type="button"
                                    onClick={() => setGuideIncluded(undefined)}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {transportIncluded !== undefined && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Transport Included
                                <button
                                    type="button"
                                    onClick={() => setTransportIncluded(undefined)}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {featured !== undefined && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <Sparkles className="h-3 w-3" />
                                Featured
                                <button
                                    type="button"
                                    onClick={() => setFeatured(undefined)}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        )}

                        {difficulty.map((diff) => (
                            <Badge key={diff} variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Difficulty: {diff}
                                <button
                                    type="button"
                                    onClick={() => setDifficulty(difficulty.filter(d => d !== diff))}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        ))}

                        {status.map((stat) => (
                            <Badge key={stat} variant="outline" className="flex items-center gap-1 px-3 py-1">
                                Status: {stat}
                                <button
                                    type="button"
                                    onClick={() => setStatus(status.filter(s => s !== stat))}
                                    className="ml-1 hover:text-destructive transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};