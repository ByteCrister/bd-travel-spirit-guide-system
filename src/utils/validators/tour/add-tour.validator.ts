import {
    ACCOMMODATION_TYPE,
    AGE_SUITABILITY,
    AUDIENCE_TYPE,
    TOUR_CATEGORIES,
    CURRENCY,
    DIFFICULTY_LEVEL,
    MEALS_PROVIDED,
    PAYMENT_METHOD,
    SEASON,
    TOUR_DISCOUNT,
    TRANSPORT_MODE,
    TRAVEL_TYPE,
} from "@/constants/tour.const";
import { OperatingWindowDTO } from "@/types/tour.types";
import * as Yup from "yup";

export const BD_PHONE_REGEX = /^(\+8801|01)[3-9][0-9]{8}$/;
export const BD_PHONE_OR_EMERGENCY_REGEX =
    /^((\+8801|01)[3-9][0-9]{8}|999|102|16263)$/;

// Utility to get date n days from today at 00:00
const minDateFromToday = (days: number = 10) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date;
};

export const BangladeshGeoPointSchema = Yup.object({
    lat: Yup.number()
        .typeError("Latitude must be a number")
        .required("Latitude is required")
        .min(20.34, "Latitude must be within Bangladesh")
        .max(26.63, "Latitude must be within Bangladesh"),
    lng: Yup.number()
        .typeError("Longitude must be a number")
        .required("Longitude is required")
        .min(88.01, "Longitude must be within Bangladesh")
        .max(92.67, "Longitude must be within Bangladesh"),
});

export const PriceSchema = Yup.object({
    amount: Yup.number()
        .transform((_, originalValue) => {
            if (originalValue === "" || originalValue === null) {
                return undefined;
            }
            return Number(originalValue);
        })
        .typeError("Amount must be a number")
        .required("Amount is required")
        .min(0, "Amount must be non-negative")
        .test(
            "decimal-precision",
            "Amount can have at most 2 decimal places",
            (value) =>
                value === undefined ||
                Number.isInteger(value * 100)
        ),


    currency: Yup.string()
        .oneOf(Object.values(CURRENCY), "Invalid currency")
        .required(),
});

export const ActivitySchema = Yup.object({
    title: Yup.string().required(),
    url: Yup.string().url().optional(),
    provider: Yup.string().optional(),
    duration: Yup.string().optional(),
    price: PriceSchema.optional(),
});

export const AttractionSchema = Yup.object({
    title: Yup.string().required(),
    description: Yup.string().optional(),
    bestFor: Yup.string().optional(),
    insiderTip: Yup.string().optional(),
    address: Yup.string().optional(),
    openingHours: Yup.string().optional(),
    imageIds: Yup.array().of(Yup.string()).optional(),
    coordinates: BangladeshGeoPointSchema.optional(),
});

export const Step0BasicInfoSchema = Yup.object().shape({
    title: Yup.string()
        .required("Title is required")
        .min(10, "Title must be at least 10 characters")
        .max(200, "Title must be less than 200 characters"),
    summary: Yup.string()
        .required("Summary is required")
        .min(50, "Summary must be at least 50 characters")
        .max(500, "Summary must be less than 500 characters"),
    // heroImage: Yup.string().required("Hero Image is required"),
    heroImage: Yup.string().optional(),
    // gallery: Yup.array().of(Yup.string()).required("Gallery image is required"),
    gallery: Yup.array().of(Yup.string()).optional(),
    seo: Yup.object()
        .shape({
            metaTitle: Yup.string().max(
                60,
                "Meta title must be less than 60 characters"
            ),
            metaDescription: Yup.string().max(
                160,
                "Meta description must be less than 160 characters"
            ),
        })
        .optional(),
    tags: Yup.array()
        .of(Yup.string().max(20, "Tag must be less than 20 characters"))
        .optional(),
});

export const Step1BangladeshSchema = Yup.object().shape({
    tourType: Yup.string()
        .oneOf(Object.values(TRAVEL_TYPE))
        .required("Tour type is required"),
    division: Yup.string().required("Division is required"),
    district: Yup.string().required("District is required"),
    accommodationType: Yup.array()
        .of(Yup.string().oneOf(Object.values(ACCOMMODATION_TYPE)))
        .optional(),
    guideIncluded: Yup.boolean().default(true),
    transportIncluded: Yup.boolean().default(true),
    emergencyContacts: Yup.object()
        .shape({
            policeNumber: Yup.string()
                .matches(
                    BD_PHONE_OR_EMERGENCY_REGEX,
                    "Enter a valid Bangladesh mobile number"
                )
                .optional(),
            ambulanceNumber: Yup.string()
                .matches(
                    BD_PHONE_OR_EMERGENCY_REGEX,
                    "Enter a valid Bangladesh mobile number"
                )
                .optional(),
            fireServiceNumber: Yup.string()
                .matches(
                    BD_PHONE_OR_EMERGENCY_REGEX,
                    "Enter a valid Bangladesh mobile number"
                )
                .optional(),
            localEmergency: Yup.string().optional(),
        })
        .optional(),
});

export const Step2ContentSchema = Yup.object().shape({
    destinations: Yup.array()
        .of(
            Yup.object({
                description: Yup.string().optional(),
                highlights: Yup.array().of(Yup.string()).optional(),
                attractions: Yup.array().of(AttractionSchema).optional(),
                activities: Yup.array().of(ActivitySchema).optional(),
                imageIds: Yup.array().of(Yup.string()).optional(),
                coordinates: BangladeshGeoPointSchema.optional(),
            })
        )
        .optional(),

    itinerary: Yup.array()
        .of(
            Yup.object().shape({
                day: Yup.number()
                    .required("Day number is required")
                    .min(1, "Day must be at least 1"),
                title: Yup.string().optional(),
                description: Yup.string().optional(),
                mealsProvided: Yup.array()
                    .of(Yup.string().oneOf(Object.values(MEALS_PROVIDED)))
                    .optional(),
                accommodation: Yup.string().optional(),
                activities: Yup.array().of(Yup.string()).optional(),
                travelDistance: Yup.string().optional(),
                travelMode: Yup.string()
                    .oneOf(Object.values(TRANSPORT_MODE))
                    .optional(),
                estimatedTime: Yup.string().optional(),
                importantNotes: Yup.array().of(Yup.string()).optional(),
            })
        )
        .optional(),

    inclusions: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string().required("Inclusion label is required"),
                description: Yup.string().optional(),
            })
        )
        .optional(),

    exclusions: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string().required("Exclusion label is required"),
                description: Yup.string().optional(),
            })
        )
        .optional(),

    difficulty: Yup.string()
        .oneOf(Object.values(DIFFICULTY_LEVEL))
        .required("Difficulty level is required"),

    bestSeason: Yup.array()
        .of(Yup.string().oneOf(Object.values(SEASON)))
        .required("At least one best season is required")
        .min(1, "At least one season must be selected"),

    audience: Yup.array()
        .of(Yup.string().oneOf(Object.values(AUDIENCE_TYPE)))
        .optional(),
    categories: Yup.array()
        .of(Yup.string().oneOf(Object.values(TOUR_CATEGORIES)))
        .optional(),

    translations: Yup.object()
        .shape({
            bn: Yup.object({
                title: Yup.string().optional(),
                summary: Yup.string().optional(),
                description: Yup.string().optional(),
            }).optional(),
            en: Yup.object({
                title: Yup.string().optional(),
                summary: Yup.string().optional(),
                description: Yup.string().optional(),
            }).optional(),
        })
        .optional(),
});

export const Step3LogisticsSchema = Yup.object().shape({
    mainLocation: Yup.object()
        .shape({
            address: Yup.object()
                .shape({
                    line1: Yup.string().optional(),
                    line2: Yup.string().optional(),
                    city: Yup.string().optional(),
                    district: Yup.string().optional(),
                    region: Yup.string().optional(),
                    postalCode: Yup.string().optional(),
                })
                .optional(),
            coordinates: BangladeshGeoPointSchema.optional(),
        })
        .optional(),

    transportModes: Yup.array()
        .of(Yup.string().oneOf(Object.values(TRANSPORT_MODE)))
        .optional(),

    pickupOptions: Yup.array()
        .of(
            Yup.object().shape({
                city: Yup.string().required("City is required"),
                price: Yup.number().min(0, "Price must be positive"),
                currency: Yup.string()
                    .oneOf(Object.values(CURRENCY))
                    .required("Currency is required"),
            })
        )
        .optional(),

    meetingPoint: Yup.string().optional(),

    packingList: Yup.array()
        .of(
            Yup.object().shape({
                item: Yup.string().required("Item name is required"),
                required: Yup.boolean().default(true),
                notes: Yup.string().optional(),
            })
        )
        .optional(),
});

export const Step4PricingSchema = Yup.object().shape({
    basePrice: PriceSchema.required("Base price is required"),

    discounts: Yup.array()
        .of(
            Yup.object().shape({
                type: Yup.string()
                    .oneOf(Object.values(TOUR_DISCOUNT))
                    .required("Discount type is required"),
                value: Yup.number()
                    .min(0, "Value must be positive")
                    .max(100, "Value cannot exceed 100%"),
                code: Yup.string().when("type", {
                    is: (type: string) => type === TOUR_DISCOUNT.PROMO,
                    then: () =>
                        Yup.string().required("Promo code is required for promo discounts"),
                    otherwise: () => Yup.string().optional(),
                }),
                validFrom: Yup.date()
                    .typeError("Valid from must be a valid date")
                    .optional()
                    .test(
                        "not-too-soon",
                        "Valid from must be at least 10 days from today",
                        function (value) {
                            if (!value) return true;
                            return new Date(value) >= minDateFromToday(10);
                        }
                    ),
                validUntil: Yup.date()
                    .typeError("Valid until must be a valid date")
                    .optional()
                    .test(
                        "is-after-valid-from",
                        "Valid until must be after valid from",
                        function (value) {
                            const { validFrom } = this.parent;
                            if (!validFrom || !value) return true;
                            return new Date(value) > new Date(validFrom);
                        }
                    )
                    .test(
                        "not-past-if-set",
                        "Valid until cannot be in the past",
                        function (value) {
                            // Allow empty/undefined values
                            if (!value) return true;
                            return (
                                new Date(value) >= new Date(new Date().setHours(0, 0, 0, 0))
                            );
                        }
                    ),
            })
        )
        .optional(),

    duration: Yup.object()
        .shape({
            days: Yup.number()
                .required("Days is required")
                .min(1, "At least 1 day is required"),
            nights: Yup.number().min(0, "Nights cannot be negative").optional(),
        })
        .optional(),

    operatingWindows: Yup.array()
        .of(
            Yup.object().shape({
                startDate: Yup.date()
                    .typeError("Start date must be a valid date")
                    .required("Start date is required")
                    .test(
                        "not-too-soon",
                        "Valid from must be at least 10 days from today",
                        function (value) {
                            if (!value) return true;
                            return new Date(value) >= minDateFromToday(10);
                        }
                    ),
                endDate: Yup.date()
                    .typeError("End date must be a valid date")
                    .required("End date is required")
                    .test(
                        "is-after-start",
                        "End date must be after start date",
                        function (value) {
                            const { startDate } = this.parent;
                            if (!startDate || !value) return true;
                            const start = new Date(startDate);
                            const end = new Date(value);
                            // Add one day buffer to allow same-day tours
                            const minEndDate = new Date(start);
                            minEndDate.setDate(minEndDate.getDate());
                            return end >= minEndDate;
                        }
                    )
                    .test(
                        "min-duration",
                        "End date must allow for at least one day of operation",
                        function (value) {
                            const { startDate } = this.parent;
                            if (!startDate || !value) return true;
                            const start = new Date(startDate);
                            const end = new Date(value);
                            const durationInDays = Math.ceil(
                                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                            );
                            return durationInDays >= 1;
                        }
                    ),
                seatsTotal: Yup.number().min(0, "Seats must be positive").optional(),
            })
        )
        .optional()
        .test(
            "non-overlapping-windows",
            "Operating windows cannot overlap",
            function (windows) {
                if (!windows || windows.length <= 1) return true;

                const sortedWindows = [...windows]
                    .map((w) => ({
                        start: new Date(w.startDate),
                        end: new Date(w.endDate),
                        original: w,
                    }))
                    .sort((a, b) => a.start.getTime() - b.start.getTime());

                for (let i = 1; i < sortedWindows.length; i++) {
                    const prevWindow = sortedWindows[i - 1];
                    const currentWindow = sortedWindows[i];

                    if (currentWindow.start <= prevWindow.end) {
                        return this.createError({
                            message: `Operating window starting ${currentWindow.original.startDate} overlaps with previous window ending ${prevWindow.original.endDate}`,
                        });
                    }
                }
                return true;
            }
        ),

    departures: Yup.array()
        .of(
            Yup.object().shape({
                date: Yup.date()
                    .typeError("Departure date must be a valid date")
                    .required("Departure date is required")
                    .test(
                        "not-too-soon",
                        "Departure date must be at least 10 days from today",
                        function (value) {
                            if (!value) return false;
                            return new Date(value) >= minDateFromToday(10);
                        }
                    )
                    .test(
                        "within-operating-window",
                        "Departure date must be within an operating window",
                        function (value) {
                            const operatingWindows = this.parent?.parent?.operatingWindows;

                            // If no operating windows specified, allow any future date
                            if (!operatingWindows || operatingWindows.length === 0)
                                return true;

                            const departureDate = new Date(value);

                            // Check if departure date falls within any operating window
                            return operatingWindows.some((window: OperatingWindowDTO) => {
                                const windowStart = new Date(window.startDate);
                                const windowEnd = new Date(window.endDate);
                                return (
                                    departureDate >= windowStart && departureDate <= windowEnd
                                );
                            });
                        }
                    )
                    .test(
                        "has-enough-duration",
                        "Departure must allow for tour duration",
                        function (value) {
                            const { duration, operatingWindows } = this.parent?.parent || {};

                            if (
                                !duration?.days ||
                                !operatingWindows ||
                                operatingWindows.length === 0
                            )
                                return true;

                            const departureDate = new Date(value);
                            const tourDurationDays = duration.days;

                            // Find the operating window for this departure
                            const operatingWindow = operatingWindows.find(
                                (window: OperatingWindowDTO) => {
                                    const windowStart = new Date(window.startDate);
                                    const windowEnd = new Date(window.endDate);
                                    return (
                                        departureDate >= windowStart && departureDate <= windowEnd
                                    );
                                }
                            );

                            if (!operatingWindow) return true;

                            // Calculate tour end date
                            const tourEndDate = new Date(departureDate);
                            tourEndDate.setDate(tourEndDate.getDate() + tourDurationDays - 1);

                            const windowEnd = new Date(operatingWindow.endDate);

                            // Check if tour fits within operating window
                            return tourEndDate <= windowEnd;
                        }
                    ),
                seatsTotal: Yup.number()
                    .required("Total seats is required")
                    .min(1, "At least 1 seat is required"),
                meetingPoint: Yup.string().optional(),
                meetingCoordinates: BangladeshGeoPointSchema.optional(),
            })
        )
        .optional()
        .test(
            "unique-departure-dates",
            "Departure dates must be unique",
            function (departures) {
                if (!departures) return true;

                const dates = departures.map((d) => new Date(d.date).toDateString());
                const uniqueDates = new Set(dates);

                if (dates.length !== uniqueDates.size) {
                    return this.createError({
                        message: "Duplicate departure dates are not allowed",
                    });
                }
                return true;
            }
        )
        .test(
            "departures-within-windows",
            "All departures must be within operating windows",
            function (departures) {
                const operatingWindows = this.parent?.operatingWindows;

                // If no departures or no operating windows, validation passes
                if (
                    !departures ||
                    departures.length === 0 ||
                    !operatingWindows ||
                    operatingWindows.length === 0
                ) {
                    return true;
                }

                // Check each departure
                for (const departure of departures) {
                    const departureDate = new Date(departure.date);
                    const isWithinWindow = operatingWindows.some(
                        (window: OperatingWindowDTO) => {
                            const windowStart = new Date(window.startDate);
                            const windowEnd = new Date(window.endDate);
                            return departureDate >= windowStart && departureDate <= windowEnd;
                        }
                    );

                    if (!isWithinWindow) {
                        return this.createError({
                            message: `Departure date ${departure.date.toISOString().split("T")[0]} is not within any operating window`,
                        });
                    }
                }

                return true;
            }
        ),

    paymentMethods: Yup.array()
        .of(Yup.string().oneOf(Object.values(PAYMENT_METHOD)))
        .required("At least one payment method is required")
        .min(1, "At least one payment method must be selected"),
});

export const Step5ComplianceSchema = Yup.object().shape({
    licenseRequired: Yup.boolean().default(false),
    ageSuitability: Yup.string()
        .oneOf(Object.values(AGE_SUITABILITY))
        .required("Age suitability is required"),
    accessibility: Yup.object()
        .shape({
            wheelchair: Yup.boolean().default(false),
            familyFriendly: Yup.boolean().default(false),
            petFriendly: Yup.boolean().default(false),
            notes: Yup.string().optional(),
        })
        .optional(),
});

export const Step6PolicySchema = Yup.object().shape({
    cancellationPolicy: Yup.object()
        .shape({
            refundable: Yup.boolean().default(true),
            rules: Yup.array()
                .of(
                    Yup.object().shape({
                        daysBefore: Yup.number()
                            .typeError("Days before must be a number")
                            .required("Days before cancellation is required")
                            .min(0, "Days cannot be negative")
                            .test(
                                "unique-days-before",
                                "Days before values must be unique",
                                function (value, context) {
                                    const rules = context.parent;
                                    if (!rules || !Array.isArray(rules)) return true;

                                    const currentIndex = context.path.split("[")[1].split("]")[0];
                                    const duplicate = rules.some(
                                        (rule, index) =>
                                            rule.daysBefore === value &&
                                            index !== parseInt(currentIndex)
                                    );
                                    return !duplicate;
                                }
                            ).default(0),
                        refundPercent: Yup.number()
                            .typeError("Refund percent must be a number")
                            .required("Refund percentage is required")
                            .min(0, "Refund percentage cannot be negative")
                            .max(100, "Refund percentage cannot exceed 100")
                            .test(
                                "descending-refund",
                                "Refund percentage should generally decrease as days before increases",
                                function (value, context) {
                                    const rules = context.parent;
                                    if (!rules || !Array.isArray(rules) || rules.length <= 1)
                                        return true;

                                    const currentIndex = context.path.split("[")[1].split("]")[0];
                                    const currentRule = rules[parseInt(currentIndex)];

                                    // Sort rules by daysBefore in descending order
                                    const sortedRules = [...rules].sort(
                                        (a, b) => b.daysBefore - a.daysBefore
                                    );
                                    const sortedIndex = sortedRules.findIndex(
                                        (rule) =>
                                            rule.daysBefore === currentRule.daysBefore &&
                                            rule.refundPercent === currentRule.refundPercent
                                    );

                                    // Check if refund percentage decreases as daysBefore decreases
                                    if (sortedIndex > 0) {
                                        const prevRule = sortedRules[sortedIndex - 1];
                                        if (currentRule.refundPercent > prevRule.refundPercent) {
                                            return this.createError({
                                                message:
                                                    "Refund percentage should not increase as cancellation date gets closer",
                                            });
                                        }
                                    }

                                    return true;
                                }
                            ).default(0),
                    })
                )
                .min(1, "At least one cancellation rule is required")
                .required("Cancellation rules are required")
                .test(
                    "covers-all-periods",
                    "Cancellation rules should cover from 0 days to a reasonable maximum",
                    function (rules) {
                        if (!rules || rules.length === 0) return true;

                        // Must include day-of-departure rule
                        const hasDayZeroRule = rules.some(
                            rule => rule.daysBefore === 0
                        );

                        if (!hasDayZeroRule) {
                            return this.createError({
                                message:
                                    "Cancellation rules must include a rule for 0 days (day of departure)",
                            });
                        }

                        // Must include reasonable maximum coverage
                        const maxDaysBefore = Math.max(...rules.map(r => r.daysBefore));

                        if (maxDaysBefore < 7) {
                            return this.createError({
                                message:
                                    "Cancellation rules should cover at least 7 days before departure",
                            });
                        }

                        return true;
                    }
                ),
        })
        .required(),

    refundPolicy: Yup.object()
        .shape({
            method: Yup.array()
                .of(Yup.string().oneOf(Object.values(PAYMENT_METHOD)))
                .required("At least one refund method is required")
                .min(1, "At least one refund method must be selected"),
            processingDays: Yup.number()
                .required("Processing days is required")
                .min(0, "Processing days cannot be negative")
                .max(30, "Processing days should not exceed 30"),
        })
        .default({ method: [], processingDays: 0 })
        .required(),

    terms: Yup.string().required(),
});

export const validationSchemas = [
    Step0BasicInfoSchema,
    Step1BangladeshSchema,
    Step2ContentSchema,
    Step3LogisticsSchema,
    Step4PricingSchema,
    Step5ComplianceSchema,
    Step6PolicySchema,
];
