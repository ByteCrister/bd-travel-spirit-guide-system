"use client";

import { AUDIENCE_TYPE, AudienceType } from '@/constants/tour.const';
import { UpdateTourContentItineraryDTO } from '@/types/tour.types';
import { useFormikContext } from 'formik';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Check,
    X,
    User,
    UserPlus,
    Heart,
    Briefcase,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; color?: string; strokeWidth?: number }>;

// Audience configuration with icons
const AUDIENCE_CONFIG: Record<string, {
    label: string;
    icon: IconType;
    color: string;
    lightBg: string;
    borderColor: string;
    textColor: string;
    description: string;
}> = {
    [AUDIENCE_TYPE.FAMILIES]: {
        label: "Families",
        icon: Users, // import { Users } from 'lucide-react'
        color: "bg-blue-500",
        lightBg: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-500",
        textColor: "text-blue-700 dark:text-blue-400",
        description: "Perfect for family trips",
    },
    [AUDIENCE_TYPE.COUPLES]: {
        label: "Couples",
        icon: Heart, // import { Heart } from 'lucide-react'
        color: "bg-pink-500",
        lightBg: "bg-pink-50 dark:bg-pink-950/30",
        borderColor: "border-pink-500",
        textColor: "text-pink-700 dark:text-pink-400",
        description: "Romantic getaways",
    },
    [AUDIENCE_TYPE.SOLO]: {
        label: "Solo Travelers",
        icon: User, // import { User } from 'lucide-react'
        color: "bg-purple-500",
        lightBg: "bg-purple-50 dark:bg-purple-950/30",
        borderColor: "border-purple-500",
        textColor: "text-purple-700 dark:text-purple-400",
        description: "Individual adventurers",
    },
    [AUDIENCE_TYPE.GROUPS]: {
        label: "Groups",
        icon: UserPlus, // import { UserPlus } from 'lucide-react'
        color: "bg-green-500",
        lightBg: "bg-green-50 dark:bg-green-950/30",
        borderColor: "border-green-500",
        textColor: "text-green-700 dark:text-green-400",
        description: "Group activities",
    },
    [AUDIENCE_TYPE.SENIORS]: {
        label: "Seniors",
        icon: Users, // choose an appropriate icon
        color: "bg-amber-500",
        lightBg: "bg-amber-50 dark:bg-amber-950/30",
        borderColor: "border-amber-500",
        textColor: "text-amber-700 dark:text-amber-400",
        description: "Comfort-focused tours",
    },
    [AUDIENCE_TYPE.BUSINESS]: {
        label: "Business",
        icon: Briefcase, // import { Briefcase } from 'lucide-react'
        color: "bg-slate-600",
        lightBg: "bg-slate-50 dark:bg-slate-950/30",
        borderColor: "border-slate-600",
        textColor: "text-slate-700 dark:text-slate-400",
        description: "Corporate and business travel",
    },
    [AUDIENCE_TYPE.ADVENTURE]: {
        label: "Adventure",
        icon: MapPin, // import { MapPin } from 'lucide-react' or choose Mountain/Navigation
        color: "bg-red-600",
        lightBg: "bg-red-50 dark:bg-red-950/30",
        borderColor: "border-red-600",
        textColor: "text-red-700 dark:text-red-400",
        description: "Thrill-seeking experiences",
    },
};

const Step2Audience = () => {
    const formik = useFormikContext<UpdateTourContentItineraryDTO>();

    const toggleAudience = (audience: AudienceType) => {
        const currentAudiences = formik.values.audience || [];

        if (currentAudiences.includes(audience)) {
            formik.setFieldValue('audience', currentAudiences.filter((a: string) => a !== audience));
        } else {
            formik.setFieldValue('audience', [...currentAudiences, audience]);
        }
    };

    const clearAll = () => {
        formik.setFieldValue('audience', []);
    };

    const selectedAudiences = formik.values.audience || [];
    const hasError = formik.touched.audience && formik.errors.audience;
    const audienceOptions = Object.values(AUDIENCE_TYPE);

    return (
        <Card className={cn(
            "border-2 transition-colors",
            hasError ? "border-destructive" : "hover:border-primary/50"
        )}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Target Audience</CardTitle>
                    </div>
                    {selectedAudiences.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {selectedAudiences.length} selected
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Select who this tour is designed for
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selected Audiences Summary */}
                {selectedAudiences.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Selected Audiences</Label>
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
                            {selectedAudiences.map((audience: string) => {
                                const config = AUDIENCE_CONFIG[audience] || {
                                    label: audience,
                                    icon: Users,
                                    lightBg: 'bg-gray-50 dark:bg-gray-950/30',
                                    textColor: 'text-gray-700 dark:text-gray-400'
                                };
                                const Icon = config.icon;
                                return (
                                    <Badge
                                        key={audience}
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

                {/* Audience Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {audienceOptions.map((audienceValue) => {
                        const config = AUDIENCE_CONFIG[audienceValue] || {
                            label: audienceValue,
                            icon: Users,
                            color: 'bg-gray-500',
                            lightBg: 'bg-gray-50 dark:bg-gray-950/30',
                            borderColor: 'border-gray-500',
                            textColor: 'text-gray-700 dark:text-gray-400',
                            description: 'Target audience'
                        };
                        const Icon = config.icon;
                        const isSelected = selectedAudiences.includes(audienceValue);

                        return (
                            <button
                                key={audienceValue}
                                type="button"
                                onClick={() => toggleAudience(audienceValue)}
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

                                {/* Audience Content */}
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
                        {formik.errors.audience}
                    </p>
                )}

                {/* Helper Text */}
                {selectedAudiences.length === 0 && !hasError && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                        Select one or more target audiences for this tour
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default Step2Audience;