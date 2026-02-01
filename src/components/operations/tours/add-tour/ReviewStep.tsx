"use client";

import { useState } from "react";
import { useFormikContext } from "formik";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    FileText,
    MapPin,
    Tag,
    Calendar,
    CreditCard,
    CheckCircle,
    XCircle,
    Navigation,
    Clock,
    Shield,
    Users,
    Bed,
    Mountain,
    Package,
    Phone,
    Home,
    Bus,
    Map,
    FileCheck,
    Eye,
    Flag,
    Layers,
    Target,
    BarChart,
    BookOpen,
    Globe2,
    Languages,
    Accessibility as AccessibilityIcon,
    Baby,
    ShieldAlert,
    CalendarDays,
    Timer,
    Percent,
    Info,
    ChevronDown,
    ChevronRight,
    ShieldCheck,
    MapPinned,
    Thermometer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateTourDTO } from "@/types/tour.types";
import {
    DestinationBlockDTO,
    ItineraryEntryDTO,
    DiscountDTO,
    InclusionDTO,
    ExclusionDTO,
    PackingListItemDTO,
    AddressDTO,
    CancellationPolicyDTO,
    RefundPolicyDTO,
    AccessibilityDTO,
    EmergencyContactsDTO,
    TranslationBlockDTO,
    PriceDTO,
} from "@/types/tour.types";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// Type definitions
type FieldType =
    | 'text'
    | 'boolean'
    | 'array'
    | 'tags'
    | 'payment'
    | 'count'
    | 'destinations'
    | 'itinerary'
    | 'inclusions'
    | 'exclusions'
    | 'discounts'
    | 'pickup'
    | 'packing'
    | 'windows'
    | 'departures'
    | 'cancellation'
    | 'refund'
    | 'emergency'
    | 'translations'
    | 'price'
    | 'address'
    | 'accessibility'
    | 'duration'
    | 'seo'
    | 'coordinates';

type FieldStatus = 'success' | 'warning' | 'default' | 'error';

interface BaseFieldConfig<T = unknown> {
    label: string;
    value?: string | number | boolean | null;
    type: FieldType;
    icon: React.ComponentType<{ className?: string }>;
    status?: FieldStatus;
    count?: number;
    data?: T;
    tooltip?: string;
    required?: boolean;
}

type FieldConfig<T = unknown> = BaseFieldConfig<T>;

interface SectionConfig {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: {
        bg: string;
        text: string;
        border: string;
    };
    fields: FieldConfig[];
}

interface RenderDetailedSectionProps {
    sectionId: string;
    data: unknown;
    formatDate: (dateString?: string) => string;
    formatCurrency: (amount: number, currency: string) => string;
}

// Helper functions with proper types
const getStatusColor = (status?: FieldStatus): string => {
    switch (status) {
        case "success": return "text-emerald-600 bg-emerald-50 border-emerald-200";
        case "warning": return "text-amber-600 bg-amber-50 border-amber-200";
        case "error": return "text-red-600 bg-red-50 border-red-200";
        default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
};

const formatAddress = (address?: AddressDTO): string => {
    if (!address) return "Not set";
    const parts = [
        address.line1,
        address.line2,
        address.city,
        address.district,
        address.region,
        address.postalCode
    ].filter(Boolean);
    return parts.join(", ") || "Address not specified";
};

const formatCoordinates = (coords?: { lat: number; lng: number }): string => {
    if (!coords) return "Not set";
    return `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`;
};

const formatSeo = (seo?: { metaTitle?: string; metaDescription?: string }): string => {
    if (!seo?.metaTitle && !seo?.metaDescription) return "Not set";
    const parts = [];
    if (seo.metaTitle) parts.push(`Title: ${seo.metaTitle.substring(0, 30)}...`);
    if (seo.metaDescription) parts.push(`Desc: ${seo.metaDescription.substring(0, 40)}...`);
    return parts.join(" | ");
};

const formatDuration = (duration?: { days: number; nights?: number }): string => {
    if (!duration?.days) return "Not set";
    return `${duration.days} days${duration.nights ? `, ${duration.nights} nights` : ""}`;
};

const formatAccessibility = (accessibility?: AccessibilityDTO): string => {
    if (!accessibility) return "Not set";
    const features = [];
    if (accessibility.wheelchair) features.push("Wheelchair");
    if (accessibility.familyFriendly) features.push("Family");
    if (accessibility.petFriendly) features.push("Pet");
    return features.length > 0 ? features.join(", ") : "No special features";
};

const formatEmergencyContacts = (contacts?: EmergencyContactsDTO): string => {
    if (!contacts) return "Not set";
    const numbers = [];
    if (contacts.policeNumber) numbers.push("Police");
    if (contacts.ambulanceNumber) numbers.push("Ambulance");
    if (contacts.fireServiceNumber) numbers.push("Fire");
    if (contacts.localEmergency) numbers.push("Local");
    return numbers.length > 0 ? `${numbers.length} contacts set` : "No contacts set";
};

const formatTranslations = (translations?: TranslationBlockDTO): string => {
    if (!translations) return "Not set";
    const languages = [];
    if (translations.bn?.title || translations.bn?.summary) languages.push("BN");
    if (translations.en?.title || translations.en?.summary) languages.push("EN");
    return languages.length > 0 ? `${languages.length} languages` : "No translations";
};

// Render detailed sections with proper typing
const renderDetailedSection = ({
    sectionId,
    data,
    formatDate,
}: RenderDetailedSectionProps): React.ReactNode => {
    switch (sectionId) {
        case "destinations": {
            const destinations = data as DestinationBlockDTO[];
            if (!destinations?.length) return null;

            return (
                <div className="space-y-4">
                    {destinations.map((dest, idx) => (
                        <div key={idx} className="border-l-2 border-amber-200 pl-4">
                            <h4 className="font-medium text-gray-900">Destination {idx + 1}</h4>
                            {dest.description && (
                                <p className="text-sm text-gray-600">{dest.description}</p>
                            )}
                            {dest.highlights && dest.highlights.length > 0 && (
                                <div className="mt-2">
                                    <span className="text-xs font-medium text-gray-500">Highlights:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {dest.highlights.map((h, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {h}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        case "itinerary": {
            const itinerary = data as ItineraryEntryDTO[];
            if (!itinerary?.length) return null;

            return (
                <div className="space-y-3">
                    {itinerary.map((day, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Day {day.day}: {day.title || `Day ${day.day}`}</h4>
                                <Badge variant="outline">Day {day.day}</Badge>
                            </div>
                            {day.description && (
                                <p className="text-sm text-gray-600 mt-1">{day.description}</p>
                            )}
                            {day.activities && day.activities.length > 0 && (
                                <div className="mt-2">
                                    <span className="text-xs font-medium text-gray-500">Activities:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {day.activities.map((a, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {a}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        case "discounts": {
            const discounts = data as DiscountDTO[];
            if (!discounts?.length) return null;

            return (
                <div className="space-y-3">
                    {discounts.map((discount, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{discount.type}</h4>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                    {discount.value}%
                                </Badge>
                            </div>
                            {discount.code && (
                                <p className="text-sm text-gray-600 mt-1">Code: {discount.code}</p>
                            )}
                            {discount.validFrom && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Valid: {formatDate(discount.validFrom)} - {formatDate(discount.validUntil)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        case "inclusions": {
            const inclusions = data as InclusionDTO[];
            if (!inclusions?.length) return null;

            return (
                <div className="space-y-2">
                    {inclusions.map((inclusion, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                            <div>
                                <span className="font-medium text-gray-900">{inclusion.label}</span>
                                {inclusion.description && (
                                    <p className="text-sm text-gray-600">{inclusion.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        case "exclusions": {
            const exclusions = data as ExclusionDTO[];
            if (!exclusions?.length) return null;

            return (
                <div className="space-y-2">
                    {exclusions.map((exclusion, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                                <span className="font-medium text-gray-900">{exclusion.label}</span>
                                {exclusion.description && (
                                    <p className="text-sm text-gray-600">{exclusion.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        case "packing": {
            const packingList = data as PackingListItemDTO[];
            if (!packingList?.length) return null;

            return (
                <div className="space-y-2">
                    {packingList.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            {item.required ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                            ) : (
                                <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                            )}
                            <div>
                                <span className="font-medium text-gray-900">{item.item}</span>
                                {item.notes && (
                                    <p className="text-sm text-gray-600">{item.notes}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        case "cancellation": {
            const policy = data as CancellationPolicyDTO;
            if (!policy) return null;

            return (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant={policy.refundable ? "default" : "destructive"}>
                            {policy.refundable ? "Refundable" : "Non-refundable"}
                        </Badge>
                    </div>
                    {policy.rules && policy.rules.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700">Cancellation Rules:</span>
                            {policy.rules.map((rule, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                    {rule.daysBefore} days before: {rule.refundPercent}% refund
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        case "refund": {
            const policy = data as RefundPolicyDTO;
            if (!policy) return null;

            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Processing Time:</span>
                        <span className="text-sm text-gray-600">{policy.processingDays} days</span>
                    </div>
                    {policy.method && policy.method.length > 0 && (
                        <div>
                            <span className="text-sm font-medium text-gray-700">Refund Methods:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {policy.method.map((method, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {method}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        default:
            return null;
    }
};

// Render field value with proper typing
const renderFieldValue = (
    field: FieldConfig,
    formatCurrency: (amount: number, currency: string) => string,
): React.ReactNode => {
    const { type, value, data, count } = field;

    switch (type) {
        case "tags":
            if (Array.isArray(data)) {
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {data.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                );
            }
            break;

        case "boolean": {
            const boolValue = typeof value === 'boolean' ? value : false;
            return (
                <div className="flex items-center gap-2">
                    {boolValue ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                        <XCircle className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={boolValue ? "text-emerald-700" : "text-gray-500"}>
                        {boolValue ? "Yes" : "No"}
                    </span>
                </div>
            );
        }

        case "array":
            if (Array.isArray(data)) {
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {data.map((item: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                                {item}
                            </Badge>
                        ))}
                    </div>
                );
            }
            break;

        case "payment":
            if (Array.isArray(data)) {
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {data.map((method: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {method}
                            </Badge>
                        ))}
                    </div>
                );
            }
            break;

        case "count":
            return (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{count ?? 0}</span>
                    <span className="text-sm text-gray-500">items</span>
                </div>
            );

        case "price": {
            const price = data as PriceDTO;
            if (price) {
                return (
                    <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(price.amount, price.currency)}
                    </span>
                );
            }
            break;
        }

        case "address": {
            const address = data as AddressDTO;
            return (
                <span className="text-sm text-gray-800 font-medium break-words">
                    {formatAddress(address)}
                </span>
            );
        }

        case "seo": {
            const seo = data as { metaTitle?: string; metaDescription?: string };
            return (
                <span className="text-sm text-gray-800 font-medium break-words">
                    {formatSeo(seo)}
                </span>
            );
        }

        case "duration": {
            const duration = data as { days: number; nights?: number };
            return (
                <span className="text-sm text-gray-800 font-medium">
                    {formatDuration(duration)}
                </span>
            );
        }

        case "accessibility": {
            const accessibility = data as AccessibilityDTO;
            return (
                <span className="text-sm text-gray-800 font-medium">
                    {formatAccessibility(accessibility)}
                </span>
            );
        }

        case "emergency": {
            const contacts = data as EmergencyContactsDTO;
            return (
                <span className="text-sm text-gray-800 font-medium">
                    {formatEmergencyContacts(contacts)}
                </span>
            );
        }

        case "translations": {
            const translations = data as TranslationBlockDTO;
            return (
                <span className="text-sm text-gray-800 font-medium">
                    {formatTranslations(translations)}
                </span>
            );
        }

        case "coordinates": {
            const coords = data as { lat: number; lng: number };
            return (
                <span className="text-sm text-gray-800 font-mono">
                    {formatCoordinates(coords)}
                </span>
            );
        }

        default:
            return (
                <span className="text-sm text-gray-800 font-medium break-words">
                    {value?.toString() || <span className="text-gray-400 italic">Not set</span>}
                </span>
            );
    }

    return null;
};

export default function ReviewStep() {
    const { values } = useFormikContext<CreateTourDTO>();

    const formatCurrency = (amount: number, currency: string): string =>
        new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateString?: string): string => {
        if (!dateString) return "Not set";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Invalid date";
        }
    };

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        basic: true,
        bangladesh: true,
        content: false,
        logistics: false,
        pricing: false,
        compliance: false,
        policies: false,
        emergency: false,
        translations: false,
    });

    const toggleSection = (section: string): void => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 10, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };

    // Calculate completion status based on required fields from validators
    const calculateCompletionStatus = (): number => {
        const requiredFields = [
            'title',
            'summary',
            'tourType',
            'division',
            'district',
            'difficulty',
            'bestSeason',
            'basePrice',
            'paymentMethods',
            'ageSuitability',
            'cancellationPolicy',
            'refundPolicy',
            'terms'
        ];

        const completed = requiredFields.filter(field => {
            const value = values[field as keyof CreateTourDTO];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
            return !!value;
        }).length;

        return Math.round((completed / requiredFields.length) * 100);
    };

    const sections: SectionConfig[] = [
        {
            id: "basic",
            title: "Basic Information",
            icon: FileText,
            color: {
                bg: "bg-emerald-50",
                text: "text-emerald-600",
                border: "border-emerald-200"
            },
            fields: [
                {
                    label: "Title",
                    value: values.title,
                    icon: FileText,
                    type: 'text',
                    status: values.title ? "success" : "error",
                    required: true,
                    tooltip: "Required: 10-200 characters"
                },
                {
                    label: "Summary",
                    value: values.summary,
                    icon: BookOpen,
                    type: 'text',
                    status: values.summary ? "success" : "error",
                    required: true,
                    tooltip: "Required: 50-500 characters"
                },
                {
                    label: "SEO Settings",
                    value: values.seo ? "Configured" : "Not set",
                    icon: Globe2,
                    type: 'seo',
                    data: values.seo,
                    status: values.seo?.metaTitle || values.seo?.metaDescription ? "success" : "default"
                },
                {
                    label: "Tags",
                    value: values.tags?.join(', '),
                    icon: Tag,
                    type: 'tags',
                    data: values.tags,
                    status: values.tags?.length ? "success" : "default"
                },
            ],
        },
        {
            id: "bangladesh",
            title: "Bangladesh Specific",
            icon: MapPin,
            color: {
                bg: "bg-blue-50",
                text: "text-blue-600",
                border: "border-blue-200"
            },
            fields: [
                {
                    label: "Tour Type",
                    value: values.tourType,
                    icon: Flag,
                    type: 'text',
                    status: values.tourType ? "success" : "error",
                    required: true
                },
                {
                    label: "Division",
                    value: values.division,
                    icon: Map,
                    type: 'text',
                    status: values.division ? "success" : "error",
                    required: true
                },
                {
                    label: "District",
                    value: values.district,
                    icon: MapPin,
                    type: 'text',
                    status: values.district ? "success" : "error",
                    required: true
                },
                {
                    label: "Accommodation Types",
                    value: values.accommodationType?.join(', '),
                    icon: Bed,
                    type: 'array',
                    data: values.accommodationType,
                    status: values.accommodationType?.length ? "success" : "default"
                },
                {
                    label: "Guide Included",
                    value: values.guideIncluded ?? true,
                    icon: Users,
                    type: 'boolean',
                    status: "default"
                },
                {
                    label: "Transport Included",
                    value: values.transportIncluded ?? true,
                    icon: Bus,
                    type: 'boolean',
                    status: "default"
                },
            ],
        },
        {
            id: "content",
            title: "Content & Itinerary",
            icon: BookOpen,
            color: {
                bg: "bg-amber-50",
                text: "text-amber-600",
                border: "border-amber-200"
            },
            fields: [
                {
                    label: "Destinations",
                    value: values.destinations?.length ? `${values.destinations.length} destinations` : "No destinations",
                    icon: MapPinned,
                    type: 'destinations',
                    count: values.destinations?.length,
                    data: values.destinations,
                    status: values.destinations?.length ? "success" : "default"
                },
                {
                    label: "Itinerary Days",
                    value: values.itinerary?.length ? `${values.itinerary.length} days` : "No itinerary",
                    icon: CalendarDays,
                    type: 'itinerary',
                    count: values.itinerary?.length,
                    data: values.itinerary,
                    status: values.itinerary?.length ? "success" : "default"
                },
                {
                    label: "Inclusions",
                    value: values.inclusions?.length ? `${values.inclusions.length} inclusions` : "No inclusions",
                    icon: CheckCircle,
                    type: 'inclusions',
                    count: values.inclusions?.length,
                    data: values.inclusions,
                    status: values.inclusions?.length ? "success" : "default"
                },
                {
                    label: "Exclusions",
                    value: values.exclusions?.length ? `${values.exclusions.length} exclusions` : "No exclusions",
                    icon: XCircle,
                    type: 'exclusions',
                    count: values.exclusions?.length,
                    data: values.exclusions,
                    status: values.exclusions?.length ? "success" : "default"
                },
                {
                    label: "Difficulty Level",
                    value: values.difficulty,
                    icon: Mountain,
                    type: 'text',
                    status: values.difficulty ? "success" : "error",
                    required: true
                },
                {
                    label: "Best Seasons",
                    value: values.bestSeason?.join(', '),
                    icon: Thermometer,
                    type: 'array',
                    data: values.bestSeason,
                    status: values.bestSeason?.length ? "success" : "error",
                    required: true,
                    tooltip: "Required: At least one season"
                },
                {
                    label: "Target Audience",
                    value: values.audience?.join(', '),
                    icon: Target,
                    type: 'array',
                    data: values.audience,
                    status: values.audience?.length ? "success" : "default"
                },
                {
                    label: "Content Categories",
                    value: values.categories?.join(', '),
                    icon: Layers,
                    type: 'array',
                    data: values.categories,
                    status: values.categories?.length ? "success" : "default"
                },
            ],
        },
        {
            id: "logistics",
            title: "Logistics & Transport",
            icon: Navigation,
            color: {
                bg: "bg-purple-50",
                text: "text-purple-600",
                border: "border-purple-200"
            },
            fields: [
                {
                    label: "Main Location",
                    value: values.mainLocation?.address ? "Address set" : "Not set",
                    icon: Home,
                    type: 'address',
                    data: values.mainLocation?.address,
                    status: values.mainLocation?.address ? "success" : "default"
                },
                {
                    label: "Location Coordinates",
                    value: values.mainLocation?.coordinates ? "Set" : "Not set",
                    icon: MapPin,
                    type: 'coordinates',
                    data: values.mainLocation?.coordinates,
                    status: values.mainLocation?.coordinates ? "success" : "default"
                },
                {
                    label: "Transport Modes",
                    value: values.transportModes?.join(', '),
                    icon: Bus,
                    type: 'array',
                    data: values.transportModes,
                    status: values.transportModes?.length ? "success" : "default"
                },
                {
                    label: "Pickup Options",
                    value: values.pickupOptions?.length ? `${values.pickupOptions.length} options` : "No pickup options",
                    icon: Navigation,
                    type: 'pickup',
                    count: values.pickupOptions?.length,
                    data: values.pickupOptions,
                    status: values.pickupOptions?.length ? "success" : "default"
                },
                {
                    label: "Meeting Point",
                    value: values.meetingPoint || "Not set",
                    icon: Map,
                    type: 'text'
                },
                {
                    label: "Packing List",
                    value: values.packingList?.length ? `${values.packingList.length} items` : "No packing list",
                    icon: Package,
                    type: 'packing',
                    count: values.packingList?.length,
                    data: values.packingList,
                    status: values.packingList?.length ? "success" : "default"
                },
            ],
        },
        {
            id: "pricing",
            title: "Pricing & Commerce",
            icon: FaBangladeshiTakaSign,
            color: {
                bg: "bg-green-50",
                text: "text-green-600",
                border: "border-green-200"
            },
            fields: [
                {
                    label: "Base Price",
                    value: formatCurrency(values.basePrice.amount, values.basePrice.currency),
                    icon: FaBangladeshiTakaSign,
                    type: 'price',
                    data: values.basePrice,
                    status: "success",
                    required: true
                },
                {
                    label: "Discounts",
                    value: values.discounts?.length ? `${values.discounts.length} discounts` : "No discounts",
                    icon: Percent,
                    type: 'discounts',
                    count: values.discounts?.length,
                    data: values.discounts,
                    status: values.discounts?.length ? "success" : "default"
                },
                {
                    label: "Duration",
                    value: formatDuration(values.duration),
                    icon: Clock,
                    type: 'duration',
                    data: values.duration,
                    status: values.duration?.days ? "success" : "default"
                },
                {
                    label: "Operating Windows",
                    value: values.operatingWindows?.length ? `${values.operatingWindows.length} windows` : "No operating windows",
                    icon: Calendar,
                    type: 'windows',
                    count: values.operatingWindows?.length,
                    data: values.operatingWindows,
                    status: values.operatingWindows?.length ? "success" : "default"
                },
                {
                    label: "Departures",
                    value: values.departures?.length ? `${values.departures.length} departures` : "No departures scheduled",
                    icon: CalendarDays,
                    type: 'departures',
                    count: values.departures?.length,
                    data: values.departures,
                    status: values.departures?.length ? "success" : "default"
                },
                {
                    label: "Payment Methods",
                    value: values.paymentMethods?.join(', '),
                    icon: CreditCard,
                    type: 'payment',
                    data: values.paymentMethods,
                    status: values.paymentMethods?.length ? "success" : "error",
                    required: true,
                    tooltip: "Required: At least one payment method"
                },
            ],
        },
        {
            id: "compliance",
            title: "Compliance & Accessibility",
            icon: Shield,
            color: {
                bg: "bg-red-50",
                text: "text-red-600",
                border: "border-red-200"
            },
            fields: [
                {
                    label: "License Required",
                    value: values.licenseRequired ?? false,
                    icon: ShieldAlert,
                    type: 'boolean'
                },
                {
                    label: "Age Suitability",
                    value: values.ageSuitability,
                    icon: Baby,
                    type: 'text',
                    status: values.ageSuitability ? "success" : "error",
                    required: true
                },
                {
                    label: "Accessibility Features",
                    value: formatAccessibility(values.accessibility),
                    icon: AccessibilityIcon,
                    type: 'accessibility',
                    data: values.accessibility,
                    status: values.accessibility ? "success" : "default"
                },
            ],
        },
        {
            id: "policies",
            title: "Policies & Terms",
            icon: FileCheck,
            color: {
                bg: "bg-slate-50",
                text: "text-slate-600",
                border: "border-slate-200"
            },
            fields: [
                {
                    label: "Cancellation Policy",
                    value: values.cancellationPolicy ? "Configured" : "Not set",
                    icon: Timer,
                    type: 'cancellation',
                    data: values.cancellationPolicy,
                    status: values.cancellationPolicy ? "success" : "error",
                    required: true,
                    tooltip: "Required: Cancellation rules must be defined"
                },
                {
                    label: "Refund Policy",
                    value: values.refundPolicy ? "Configured" : "Not set",
                    icon: FaBangladeshiTakaSign,
                    type: 'refund',
                    data: values.refundPolicy,
                    status: values.refundPolicy ? "success" : "error",
                    required: true
                },
                {
                    label: "Terms & Conditions",
                    value: values.terms ? "Set" : "Not set",
                    icon: FileText,
                    type: 'text',
                    status: values.terms ? "success" : "error",
                    required: true
                },
            ],
        },
        {
            id: "emergency",
            title: "Emergency Contacts",
            icon: Phone,
            color: {
                bg: "bg-orange-50",
                text: "text-orange-600",
                border: "border-orange-200"
            },
            fields: [
                {
                    label: "Emergency Contacts",
                    value: formatEmergencyContacts(values.emergencyContacts),
                    icon: Shield,
                    type: 'emergency',
                    data: values.emergencyContacts,
                    status: values.emergencyContacts ? "success" : "default"
                },
            ],
        },
        {
            id: "translations",
            title: "Translations",
            icon: Languages,
            color: {
                bg: "bg-indigo-50",
                text: "text-indigo-600",
                border: "border-indigo-200"
            },
            fields: [
                {
                    label: "Translations",
                    value: formatTranslations(values.translations),
                    icon: Languages,
                    type: 'translations',
                    data: values.translations,
                    status: values.translations ? "success" : "default"
                },
            ],
        },
    ];

    const complexSections = ['destinations', 'itinerary', 'discounts', 'inclusions', 'exclusions', 'packing', 'cancellation', 'refund'];

    const hasComplexData = (sectionId: string, data: unknown): boolean => {
        return !!(complexSections.includes(sectionId) && data && Array.isArray(data) && (data as unknown[]).length > 0);
    };

    const completionPercentage = calculateCompletionStatus();

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-7xl mx-auto"
                >
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Tour Review & Submission</h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Review all information before final submission. All {sections.reduce((acc, section) => acc + section.fields.length, 0)} fields from the form are displayed below.
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total Sections</div>
                                <div className="text-2xl font-bold text-gray-900">{sections.length}</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Validation Status</span>
                                <span className={`text-sm font-semibold px-2 py-1 rounded ${completionPercentage === 100
                                    ? "bg-emerald-100 text-emerald-800"
                                    : completionPercentage >= 80
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                    {completionPercentage}% Valid
                                </span>
                            </div>
                            <Progress value={completionPercentage} className="h-2 bg-gray-200" />
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{values.duration?.days || 0}</div>
                                    <div className="text-xs text-gray-500">Tour Days</div>
                                </div>
                                <Calendar className="h-8 w-8 text-emerald-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(values.basePrice.amount, values.basePrice.currency)}
                                    </div>
                                    <div className="text-xs text-gray-500">Base Price</div>
                                </div>
                                <FaBangladeshiTakaSign className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{values.paymentMethods.length}</div>
                                    <div className="text-xs text-gray-500">Payment Methods</div>
                                </div>
                                <CreditCard className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{values.tags?.length || 0}</div>
                                    <div className="text-xs text-gray-500">Tags</div>
                                </div>
                                <Tag className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {sections.map((section) => (
                            <motion.div
                                key={section.id}
                                variants={itemVariants}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                {/* Section Header */}
                                <div className="border-b border-gray-100">
                                    <div
                                        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${section.color.bg}`}>
                                                <section.icon className={`h-5 w-5 ${section.color.text}`} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    {section.title}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                    {section.fields.length} fields • {expandedSections[section.id] ? "Expanded" : "Collapsed"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant="outline"
                                                className={`${section.color.border} ${section.color.text} ${section.color.bg}`}
                                            >
                                                {section.id}
                                            </Badge>
                                            {expandedSections[section.id] ? (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section Content */}
                                <AnimatePresence>
                                    {expandedSections[section.id] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {section.fields.map((field, fieldIndex) => {
                                                        return (
                                                            <motion.div
                                                                key={field.label}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: fieldIndex * 0.03 }}
                                                                className="group"
                                                            >
                                                                <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 border border-gray-100">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="p-2 rounded-md bg-gray-100">
                                                                            <field.icon className="h-4 w-4 text-gray-600" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        {field.label}
                                                                                        {field.required && (
                                                                                            <span className="text-red-500 ml-1">*</span>
                                                                                        )}
                                                                                    </span>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <Info className="h-3 w-3 text-gray-400" />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p className="text-xs">
                                                                                                {field.tooltip || `Field from ${section.title} section`}
                                                                                            </p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </div>
                                                                                {field.status && (
                                                                                    <Badge variant="outline" className={`text-xs ${getStatusColor(field.status)}`}>
                                                                                        {field.status === "error" ? "Required" : field.status}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>

                                                                            <div className="mt-1">
                                                                                {renderFieldValue(field, formatCurrency)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Detailed Content for Complex Fields */}
                                                {complexSections.includes(section.id) && hasComplexData(section.id, section.fields.find(f => f.type === section.id)?.data) && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                        className="mt-6 pt-6 border-t border-gray-100"
                                                    >
                                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed View</h3>
                                                        {renderDetailedSection({
                                                            sectionId: section.id,
                                                            data: section.fields.find(f => f.type === section.id)?.data,
                                                            formatDate,
                                                            formatCurrency
                                                        })}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}

                        {/* Validation Summary */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <BarChart className="h-5 w-5 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Validation Summary</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Total Fields</div>
                                    <div className="text-xl font-bold text-gray-900 mt-1">
                                        {sections.reduce((acc, section) => acc + section.fields.length, 0)}
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Required Fields</div>
                                    <div className="text-xl font-bold text-gray-900 mt-1">
                                        {sections.flatMap(s => s.fields).filter(f => f.required).length}
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Optional Fields</div>
                                    <div className="text-xl font-bold text-gray-900 mt-1">
                                        {sections.flatMap(s => s.fields).filter(f => !f.required).length}
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Complex Objects</div>
                                    <div className="text-xl font-bold text-gray-900 mt-1">
                                        {["destinations", "itinerary", "discounts"].filter(id =>
                                            sections.find(s => s.id === id)?.fields.some(f => f.type === id && f.count && f.count > 0)
                                        ).length}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Final Verification */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white border border-gray-200 rounded-xl p-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="p-3 bg-emerald-50 rounded-full">
                                        <ShieldCheck className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-900 mb-2">Final Verification & Submission</h4>
                                        <Badge variant="outline" className={`border-emerald-200 text-emerald-700 bg-emerald-50 ${completionPercentage === 100 ? "" : "border-amber-200 text-amber-700 bg-amber-50"
                                            }`}>
                                            {completionPercentage === 100 ? "Ready to Submit" : "Review Required"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        By submitting, you confirm that all information provided is accurate and complies with our terms of service.
                                        Please ensure all details are correct before proceeding.
                                        {completionPercentage < 100 && (
                                            <span className="block mt-2 text-amber-600">
                                                ⚠️ Some required fields are missing or incomplete. Please review the sections marked with errors.
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>Last updated: {new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            <span>Preview available before submission</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Spacer for fixed bottom bar */}
                    <div className="h-24" />
                </motion.div>
            </div>
        </TooltipProvider>
    );
}