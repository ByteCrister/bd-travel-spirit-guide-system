"use client";

import { useFormikContext } from "formik";
import { UpdateTourContentItineraryDTO } from "@/types/tour/tour.types";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Sun,
    Cloud,
    Snowflake,
    Leaf,
    Calendar,
    Check,
    X,
    CloudRain,
    Wind,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Season, SEASON } from "@/constants/tour/tour.const";

// Season configuration matching your enum
const SEASON_CONFIG = {
    [SEASON.SPRING]: {
        label: "Spring",
        icon: Leaf,
        color: "bg-green-500",
        lightBg: "bg-green-50 dark:bg-green-950/30",
        borderColor: "border-green-500",
        textColor: "text-green-700 dark:text-green-400",
        description: "Blooming season",
    },
    [SEASON.SUMMER]: {
        label: "Summer",
        icon: Sun,
        color: "bg-yellow-500",
        lightBg: "bg-yellow-50 dark:bg-yellow-950/30",
        borderColor: "border-yellow-500",
        textColor: "text-yellow-700 dark:text-yellow-400",
        description: "Hot and dry season",
    },
    [SEASON.MONSOON]: {
        label: "Monsoon",
        icon: CloudRain,
        color: "bg-sky-500",
        lightBg: "bg-sky-50 dark:bg-sky-950/30",
        borderColor: "border-sky-500",
        textColor: "text-sky-700 dark:text-sky-400",
        description: "Rainy season",
    },
    [SEASON.AUTUMN]: {
        label: "Autumn",
        icon: Wind,
        color: "bg-orange-500",
        lightBg: "bg-orange-50 dark:bg-orange-950/30",
        borderColor: "border-orange-500",
        textColor: "text-orange-700 dark:text-orange-400",
        description: "After monsoon",
    },
    [SEASON.LATE_AUTUMN]: {
        label: "Late Autumn",
        icon: Cloud,
        color: "bg-amber-500",
        lightBg: "bg-amber-50 dark:bg-amber-950/30",
        borderColor: "border-amber-500",
        textColor: "text-amber-700 dark:text-amber-400",
        description: "Dry transition",
    },
    [SEASON.WINTER]: {
        label: "Winter",
        icon: Snowflake,
        color: "bg-blue-500",
        lightBg: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-500",
        textColor: "text-blue-700 dark:text-blue-400",
        description: "Cool season",
    },
    [SEASON.YEAR_ROUND]: {
        label: "Year Round",
        icon: Sparkles,
        color: "bg-purple-500",
        lightBg: "bg-purple-50 dark:bg-purple-950/30",
        borderColor: "border-purple-500",
        textColor: "text-purple-700 dark:text-purple-400",
        description: "All seasons suitable",
    },
};

function Step2BestSeason() {
    const { values, setFieldValue, touched, errors } =
        useFormikContext<UpdateTourContentItineraryDTO>();

    const toggleSeason = (season: Season) => {
        const currentSeasons = values.bestSeason || [];

        if (currentSeasons.includes(season)) {
            setFieldValue(
                "bestSeason",
                currentSeasons.filter((s: string) => s !== season)
            );
        } else {
            setFieldValue("bestSeason", [...currentSeasons, season]);
        }
    };

    const clearAll = () => {
        setFieldValue("bestSeason", []);
    };

    const selectedSeasons = values.bestSeason || [];
    const hasError = touched.bestSeason && errors.bestSeason;

    return (
        <Card
            className={cn(
                "border-2 transition-colors",
                hasError ? "border-destructive" : "hover:border-primary/50"
            )}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Best Season to Visit</CardTitle>
                    </div>
                    {selectedSeasons.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {selectedSeasons.length} selected
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Select the ideal seasons for this tour
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selected Seasons Summary */}
                {selectedSeasons.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Selected Seasons</Label>
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
                            {selectedSeasons.map((season: string) => {
                                const config =
                                    SEASON_CONFIG[season as keyof typeof SEASON_CONFIG];
                                if (!config) return null;
                                const Icon = config.icon;
                                return (
                                    <Badge
                                        key={season}
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

                {/* Season Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(SEASON_CONFIG).map(([seasonValue, config]) => {
                        const Icon = config.icon;
                        const isSelected = selectedSeasons.includes(seasonValue as Season);

                        return (
                            <button
                                key={seasonValue}
                                type="button"
                                onClick={() => toggleSeason(seasonValue as Season)}
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

                                {/* Season Content */}
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                            isSelected ? config.color : "bg-muted"
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-5 w-5",
                                                isSelected ? "text-white" : "text-muted-foreground"
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div
                                            className={cn(
                                                "font-semibold mb-0.5",
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
                        {errors.bestSeason}
                    </p>
                )}

                {/* Helper Text */}
                {selectedSeasons.length === 0 && !hasError && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                        Select one or more seasons when this tour is best to visit
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default Step2BestSeason;
