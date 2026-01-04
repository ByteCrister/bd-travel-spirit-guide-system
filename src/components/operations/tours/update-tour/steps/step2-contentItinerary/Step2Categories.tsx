"use client";

import { TOUR_CATEGORIES, TourCategories } from '@/constants/tour.const';
import { useFormikContext } from 'formik';
import { UpdateTourContentItineraryDTO } from '@/types/tour.types';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Palmtree,
    Landmark,
    UtensilsCrossed,
    Trees,
    Squirrel,
    Building2,
    Church,
    Castle,
    Ship,
    Check,
    X,
    FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; color?: string; strokeWidth?: number }>;

// Category configuration with icons matching TOUR_CATEGORIES enum
const CATEGORY_CONFIG: Record<string, {
    label: string;
    icon: IconType;
    color: string;
    lightBg: string;
    borderColor: string;
    textColor: string;
    description: string;
}> = {
    [TOUR_CATEGORIES.BEACHES]: {
        label: 'Beaches',
        icon: Palmtree,
        color: 'bg-cyan-500',
        lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',
        borderColor: 'border-cyan-500',
        textColor: 'text-cyan-700 dark:text-cyan-400',
        description: 'Coastal destinations'
    },
    [TOUR_CATEGORIES.CULTURE_HISTORY]: {
        label: 'Culture & History',
        icon: Landmark,
        color: 'bg-amber-500',
        lightBg: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-500',
        textColor: 'text-amber-700 dark:text-amber-400',
        description: 'Historical sites & museums'
    },
    [TOUR_CATEGORIES.FOOD_DRINK]: {
        label: 'Food & Drink',
        icon: UtensilsCrossed,
        color: 'bg-orange-500',
        lightBg: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-700 dark:text-orange-400',
        description: 'Culinary experiences'
    },
    [TOUR_CATEGORIES.NATURE]: {
        label: 'Nature',
        icon: Trees,
        color: 'bg-green-500',
        lightBg: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-500',
        textColor: 'text-green-700 dark:text-green-400',
        description: 'Outdoor activities'
    },
    [TOUR_CATEGORIES.WILDLIFE]: {
        label: 'Wildlife',
        icon: Squirrel,
        color: 'bg-emerald-500',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        description: 'Safari & animal watching'
    },
    [TOUR_CATEGORIES.CITY]: {
        label: 'City',
        icon: Building2,
        color: 'bg-slate-500',
        lightBg: 'bg-slate-50 dark:bg-slate-950/30',
        borderColor: 'border-slate-500',
        textColor: 'text-slate-700 dark:text-slate-400',
        description: 'Urban exploration'
    },
    [TOUR_CATEGORIES.RELIGIOUS]: {
        label: 'Religious',
        icon: Church,
        color: 'bg-purple-500',
        lightBg: 'bg-purple-50 dark:bg-purple-950/30',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-700 dark:text-purple-400',
        description: 'Spiritual destinations'
    },
    [TOUR_CATEGORIES.HERITAGE]: {
        label: 'Heritage',
        icon: Castle,
        color: 'bg-rose-500',
        lightBg: 'bg-rose-50 dark:bg-rose-950/30',
        borderColor: 'border-rose-500',
        textColor: 'text-rose-700 dark:text-rose-400',
        description: 'UNESCO & heritage sites'
    },
    [TOUR_CATEGORIES.CRUISE]: {
        label: 'Cruise',
        icon: Ship,
        color: 'bg-blue-500',
        lightBg: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-700 dark:text-blue-400',
        description: 'Cruise-based travel'
    }
};

const Step2Categories = () => {
    const { values, setFieldValue, touched, errors } = useFormikContext<UpdateTourContentItineraryDTO>();

    const toggleCategory = (category: TourCategories) => {
        const currentCategories = values.categories || [];

        if (currentCategories.includes(category)) {
            setFieldValue('categories', currentCategories.filter((c: string) => c !== category));
        } else {
            setFieldValue('categories', [...currentCategories, category]);
        }
    };

    const clearAll = () => {
        setFieldValue('categories', []);
    };

    const selectedCategories = values.categories || [];
    const hasError = touched.categories && errors.categories;
    const categoryOptions = Object.values(TOUR_CATEGORIES);

    return (
        <Card className={cn(
            "border-2 transition-colors",
            hasError ? "border-destructive" : "hover:border-primary/50"
        )}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Content Categories</CardTitle>
                    </div>
                    {selectedCategories.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {selectedCategories.length} selected
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Choose categories that best describe this tour
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selected Categories Summary */}
                {selectedCategories.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Selected Categories</Label>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                            >
                                <X className="h-3 w-3" />
                                Clear all
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((category: string) => {
                                const config = CATEGORY_CONFIG[category] || {
                                    label: category,
                                    icon: FolderOpen,
                                    lightBg: 'bg-gray-50 dark:bg-gray-950/30',
                                    textColor: 'text-gray-700 dark:text-gray-400'
                                };
                                const Icon = config.icon;
                                return (
                                    <Badge
                                        key={category}
                                        variant="secondary"
                                        className={cn(
                                            "px-3 py-1.5 gap-1.5",
                                            config.lightBg,
                                            config.textColor
                                        )}
                                    >
                                        <Icon className="h-3 w-3" />
                                        {config.label}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Category Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryOptions.map((categoryValue) => {
                        const config = CATEGORY_CONFIG[categoryValue] || {
                            label: categoryValue,
                            icon: FolderOpen,
                            color: 'bg-gray-500',
                            lightBg: 'bg-gray-50 dark:bg-gray-950/30',
                            borderColor: 'border-gray-500',
                            textColor: 'text-gray-700 dark:text-gray-400',
                            description: 'Tour category'
                        };
                        const Icon = config.icon;
                        const isSelected = selectedCategories.includes(categoryValue);

                        return (
                            <button
                                key={categoryValue}
                                type="button"
                                onClick={() => toggleCategory(categoryValue)}
                                className={cn(
                                    "relative p-4 rounded-lg border-2 transition-all duration-200",
                                    "hover:scale-[1.02] active:scale-[0.98]",
                                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                    isSelected
                                        ? cn(config.borderColor, config.lightBg, "shadow-md")
                                        : "border-border hover:border-primary/50 bg-card"
                                )}
                            >
                                {/* Selection Indicator */}
                                <div
                                    className={cn(
                                        "absolute top-2 right-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        isSelected
                                            ? cn(config.color, "border-transparent")
                                            : "border-muted-foreground/30"
                                    )}
                                >
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                </div>

                                {/* Category Content */}
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div
                                        className={cn(
                                            "h-12 w-12 rounded-full flex items-center justify-center",
                                            isSelected ? config.color : "bg-muted"
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-6 w-6",
                                                isSelected ? "text-white" : "text-muted-foreground"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div
                                            className={cn(
                                                "font-semibold text-sm",
                                                isSelected ? config.textColor : "text-foreground"
                                            )}
                                        >
                                            {config.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {config.description}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Error Message */}
                {hasError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <X className="h-4 w-4" />
                        {errors.categories}
                    </p>
                )}

                {/* Helper Text */}
                {selectedCategories.length === 0 && !hasError && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                        Select one or more categories to classify this tour
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default Step2Categories;