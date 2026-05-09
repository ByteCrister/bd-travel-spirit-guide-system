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
    TOUR_DISCOUNT_TYPE,
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

const createErrorMessage = (section: string, field: string, message: string) => {
    return `${section} - ${field}: ${message}`;
};

const createNestedErrorMessage = (section: string, subsection: string, field: string, message: string) => {
    return `${section} - ${subsection} - ${field}: ${message}`;
};

export const BangladeshGeoPointSchema = Yup.object({
    lat: Yup.number()
        .typeError(createErrorMessage("Geo Location", "Latitude", "must be a number"))
        .required(createErrorMessage("Geo Location", "Latitude", "is required"))
        .min(20.34, createErrorMessage("Geo Location", "Latitude", "must be within Bangladesh (20.34 minimum)"))
        .max(26.63, createErrorMessage("Geo Location", "Latitude", "must be within Bangladesh (26.63 maximum)")),
    lng: Yup.number()
        .typeError(createErrorMessage("Geo Location", "Longitude", "must be a number"))
        .required(createErrorMessage("Geo Location", "Longitude", "is required"))
        .min(88.01, createErrorMessage("Geo Location", "Longitude", "must be within Bangladesh (88.01 minimum)"))
        .max(92.67, createErrorMessage("Geo Location", "Longitude", "must be within Bangladesh (92.67 maximum)")),
});

export const PriceSchema = Yup.object({
    amount: Yup.number()
        .transform((_, originalValue) => {
            if (originalValue === "" || originalValue === null) {
                return undefined;
            }
            return Number(originalValue);
        })
        .typeError(createErrorMessage("Price", "Amount", "must be a number"))
        .required(createErrorMessage("Price", "Amount", "is required"))
        .min(0, createErrorMessage("Price", "Amount", "must be non-negative"))
        .test(
            "decimal-precision",
            createErrorMessage("Price", "Amount", "can have at most 2 decimal places"),
            (value) =>
                value === undefined ||
                Number.isInteger(value * 100)
        ),
    currency: Yup.string()
        .oneOf(Object.values(CURRENCY), createErrorMessage("Price", "Currency", "is invalid"))
        .required(createErrorMessage("Price", "Currency", "is required")),
});

export const ActivitySchema = Yup.object({
    title: Yup.string().required(createErrorMessage("Activity", "Title", "is required")),
    url: Yup.string().url(createErrorMessage("Activity", "URL", "must be a valid URL")).optional(),
    provider: Yup.string().optional(),
    duration: Yup.string().optional(),
    price: PriceSchema.optional(),
});

export const AttractionSchema = Yup.object({
    id: Yup.string().optional(),
    title: Yup.string().required(createErrorMessage("Attraction", "Title", "is required")),
    description: Yup.string().optional(),
    bestFor: Yup.string().optional(),
    insiderTip: Yup.string().optional(),
    address: Yup.string().optional(),
    openingHours: Yup.string().optional(),
    imageIds: Yup.array()
        .of(
            Yup.object({
                id: Yup.string().required(createErrorMessage("Attraction Image", "ID", "is required")),
                url: Yup.string().url(createErrorMessage("Attraction Image", "URL", "must be a valid URL")).required(createErrorMessage("Attraction Image", "URL", "is required")),
            })
        )
        .optional(),
    coordinates: BangladeshGeoPointSchema.optional(),
});

export const Step0BasicInfoSchema = Yup.object().shape({
    title: Yup.string()
        .required(createErrorMessage("Basic Info", "Title", "is required"))
        .min(10, createErrorMessage("Basic Info", "Title", "must be at least 10 characters"))
        .max(200, createErrorMessage("Basic Info", "Title", "must be less than 200 characters")),
    summary: Yup.string()
        .required(createErrorMessage("Basic Info", "Summary", "is required"))
        .min(50, createErrorMessage("Basic Info", "Summary", "must be at least 50 characters"))
        .max(500, createErrorMessage("Basic Info", "Summary", "must be less than 500 characters")),
    heroImage: Yup.string().optional(),
    gallery: Yup.array().of(Yup.string()).optional(),
    seo: Yup.object()
        .shape({
            metaTitle: Yup.string().max(
                60,
                createErrorMessage("Basic Info - SEO", "Meta Title", "must be less than 60 characters")
            ),
            metaDescription: Yup.string().max(
                160,
                createErrorMessage("Basic Info - SEO", "Meta Description", "must be less than 160 characters")
            ),
        })
        .optional(),
    tags: Yup.array()
        .of(Yup.string().max(20, createErrorMessage("Basic Info", "Tag", "must be less than 20 characters")))
        .optional(),
});

export const Step1BangladeshSchema = Yup.object().shape({
    tourType: Yup.string()
        .oneOf(Object.values(TRAVEL_TYPE), createErrorMessage("Bangladesh Info", "Tour Type", "is invalid"))
        .required(createErrorMessage("Bangladesh Info", "Tour Type", "is required")),
    division: Yup.string().required(createErrorMessage("Bangladesh Info", "Division", "is required")),
    district: Yup.string().required(createErrorMessage("Bangladesh Info", "District", "is required")),
    accommodationType: Yup.array()
        .of(Yup.string().oneOf(Object.values(ACCOMMODATION_TYPE), createErrorMessage("Bangladesh Info", "Accommodation Type", "has invalid value")))
        .optional(),
    guideIncluded: Yup.boolean().default(true),
    transportIncluded: Yup.boolean().default(true),
    emergencyContacts: Yup.object()
        .shape({
            policeNumber: Yup.string()
                .matches(
                    BD_PHONE_OR_EMERGENCY_REGEX,
                    createErrorMessage("Bangladesh Info - Emergency Contacts", "Police Number", "must be a valid Bangladesh mobile number or emergency number")
                )
                .optional(),
            ambulanceNumber: Yup.string()
                .matches(
                    BD_PHONE_OR_EMERGENCY_REGEX,
                    createErrorMessage("Bangladesh Info - Emergency Contacts", "Ambulance Number", "must be a valid Bangladesh mobile number or emergency number")
                )
                .optional(),
            fireServiceNumber: Yup.string()
                .matches(
                    BD_PHONE_OR_EMERGENCY_REGEX,
                    createErrorMessage("Bangladesh Info - Emergency Contacts", "Fire Service Number", "must be a valid Bangladesh mobile number or emergency number")
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
                id: Yup.string().optional(),
                description: Yup.string().optional(),
                highlights: Yup.array().of(Yup.string()).optional(),
                attractions: Yup.array().of(AttractionSchema).optional(),
                activities: Yup.array().of(ActivitySchema).optional(),
                imageIds: Yup.array()
                    .of(
                        Yup.object({
                            id: Yup.string().required(createErrorMessage("Content - Destination Image", "ID", "is required")),
                            url: Yup.string().url(createErrorMessage("Content - Destination Image", "URL", "must be a valid URL")).required(createErrorMessage("Content - Destination Image", "URL", "is required")),
                        })
                    )
                    .optional(),
                coordinates: BangladeshGeoPointSchema.optional(),
            })
        )
        .optional(),

    itinerary: Yup.array()
        .of(
            Yup.object().shape({
                day: Yup.number()
                    .required(createNestedErrorMessage("Content", "Itinerary", "Day", "is required"))
                    .min(1, createNestedErrorMessage("Content", "Itinerary", "Day", "must be at least 1")),
                title: Yup.string().optional(),
                description: Yup.string().optional(),
                mealsProvided: Yup.array()
                    .of(Yup.string().oneOf(Object.values(MEALS_PROVIDED), createNestedErrorMessage("Content", "Itinerary", "Meals Provided", "has invalid value")))
                    .optional(),
                accommodation: Yup.string().optional(),
                activities: Yup.array().of(Yup.string()).optional(),
                travelDistance: Yup.string().optional(),
                travelMode: Yup.string()
                    .oneOf(Object.values(TRANSPORT_MODE), createNestedErrorMessage("Content", "Itinerary", "Travel Mode", "is invalid"))
                    .optional(),
                estimatedTime: Yup.string().optional(),
                importantNotes: Yup.array().of(Yup.string()).optional(),
            })
        )
        .optional(),

    inclusions: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string().required(createNestedErrorMessage("Content", "Inclusions", "Label", "is required")),
                description: Yup.string().optional(),
            })
        )
        .optional(),

    exclusions: Yup.array()
        .of(
            Yup.object().shape({
                label: Yup.string().required(createNestedErrorMessage("Content", "Exclusions", "Label", "is required")),
                description: Yup.string().optional(),
            })
        )
        .optional(),

    difficulty: Yup.string()
        .oneOf(Object.values(DIFFICULTY_LEVEL), createErrorMessage("Content", "Difficulty Level", "is invalid"))
        .required(createErrorMessage("Content", "Difficulty Level", "is required")),

    bestSeason: Yup.array()
        .of(Yup.string().oneOf(Object.values(SEASON), createErrorMessage("Content", "Best Season", "has invalid value")))
        .required(createErrorMessage("Content", "Best Season", "at least one season is required"))
        .min(1, createErrorMessage("Content", "Best Season", "at least one season must be selected")),

    audience: Yup.array()
        .of(Yup.string().oneOf(Object.values(AUDIENCE_TYPE), createErrorMessage("Content", "Audience", "has invalid value")))
        .optional(),
    categories: Yup.array()
        .of(Yup.string().oneOf(Object.values(TOUR_CATEGORIES), createErrorMessage("Content", "Categories", "has invalid value")))
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
        .of(Yup.string().oneOf(Object.values(TRANSPORT_MODE), createErrorMessage("Logistics", "Transport Mode", "has invalid value")))
        .optional(),

    pickupOptions: Yup.array()
        .of(
            Yup.object().shape({
                city: Yup.string().required(createNestedErrorMessage("Logistics", "Pickup Options", "City", "is required")),
                price: Yup.number().min(0, createNestedErrorMessage("Logistics", "Pickup Options", "Price", "must be positive")),
                currency: Yup.string()
                    .oneOf(Object.values(CURRENCY), createNestedErrorMessage("Logistics", "Pickup Options", "Currency", "is invalid"))
                    .required(createNestedErrorMessage("Logistics", "Pickup Options", "Currency", "is required")),
            })
        )
        .optional(),

    meetingPoint: Yup.string().optional(),

    packingList: Yup.array()
        .of(
            Yup.object().shape({
                item: Yup.string().required(createNestedErrorMessage("Logistics", "Packing List", "Item", "is required")),
                required: Yup.boolean().default(true),
                notes: Yup.string().optional(),
            })
        )
        .optional(),
});

export const Step4PricingSchema = Yup.object().shape({
    basePrice: PriceSchema.required(createErrorMessage("Pricing", "Base Price", "is required")),

    discounts: Yup.array()
        .of(
            Yup.object().shape({
                type: Yup.string()
                    .oneOf(Object.values(TOUR_DISCOUNT_TYPE), createNestedErrorMessage("Pricing", "Discounts", "Type", "is invalid"))
                    .required(createNestedErrorMessage("Pricing", "Discounts", "Type", "is required")),
                discount: Yup.string()
                    .oneOf(Object.values(TOUR_DISCOUNT), createNestedErrorMessage("Pricing", "Discounts", "Discount", "is invalid"))
                    .required(createNestedErrorMessage("Pricing", "Discounts", "Discount", "is required")),
                value: Yup.number()
                    .min(0, createNestedErrorMessage("Pricing", "Discounts", "Value", "must be positive"))
                    .test(
                        "percentage-max",
                        createNestedErrorMessage("Pricing", "Discounts", "Value", "cannot exceed 100 for percentage discounts"),
                        function (value) {
                            if (value === undefined || value === null) return true;
                            const { type } = this.parent;
                            if (type === TOUR_DISCOUNT_TYPE.PERCENTAGE) {
                                return value <= 100;
                            }
                            return true;
                        }
                    ),
                code: Yup.string().when("discount", {
                    is: (discount: string) => discount === TOUR_DISCOUNT.PROMO,
                    then: () =>
                        Yup.string().required(createNestedErrorMessage("Pricing", "Discounts", "Code", "is required for promo discounts")),
                    otherwise: () => Yup.string().optional(),
                }),
                validFrom: Yup.date()
                    .typeError(createNestedErrorMessage("Pricing", "Discounts", "Valid From", "must be a valid date"))
                    .optional()
                    .test(
                        "not-too-soon",
                        createNestedErrorMessage("Pricing", "Discounts", "Valid From", "must be at least 10 days from today"),
                        function (value) {
                            if (!value) return true;
                            return new Date(value) >= minDateFromToday(10);
                        }
                    ),
                validUntil: Yup.date()
                    .typeError(createNestedErrorMessage("Pricing", "Discounts", "Valid Until", "must be a valid date"))
                    .optional()
                    .test(
                        "is-after-valid-from",
                        createNestedErrorMessage("Pricing", "Discounts", "Valid Until", "must be after valid from"),
                        function (value) {
                            const { validFrom } = this.parent;
                            if (!validFrom || !value) return true;
                            return new Date(value) > new Date(validFrom);
                        }
                    )
                    .test(
                        "not-past-if-set",
                        createNestedErrorMessage("Pricing", "Discounts", "Valid Until", "cannot be in the past"),
                        function (value) {
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
                .required(createNestedErrorMessage("Pricing", "Duration", "Days", "is required"))
                .min(1, createNestedErrorMessage("Pricing", "Duration", "Days", "at least 1 day is required")),
            nights: Yup.number().min(0, createNestedErrorMessage("Pricing", "Duration", "Nights", "cannot be negative")).optional(),
        })
        .optional(),

    operatingWindows: Yup.array()
        .of(
            Yup.object().shape({
                startDate: Yup.date()
                    .typeError(createNestedErrorMessage("Pricing", "Operating Windows", "Start Date", "must be a valid date"))
                    .required(createNestedErrorMessage("Pricing", "Operating Windows", "Start Date", "is required"))
                    .test(
                        "not-too-soon",
                        createNestedErrorMessage("Pricing", "Operating Windows", "Start Date", "must be at least 10 days from today"),
                        function (value) {
                            if (!value) return true;
                            return new Date(value) >= minDateFromToday(10);
                        }
                    ),
                endDate: Yup.date()
                    .typeError(createNestedErrorMessage("Pricing", "Operating Windows", "End Date", "must be a valid date"))
                    .required(createNestedErrorMessage("Pricing", "Operating Windows", "End Date", "is required"))
                    .test(
                        "is-after-start",
                        createNestedErrorMessage("Pricing", "Operating Windows", "End Date", "must be after start date"),
                        function (value) {
                            const { startDate } = this.parent;
                            if (!startDate || !value) return true;
                            const start = new Date(startDate);
                            const end = new Date(value);
                            const minEndDate = new Date(start);
                            minEndDate.setDate(minEndDate.getDate());
                            return end >= minEndDate;
                        }
                    )
                    .test(
                        "min-duration",
                        createNestedErrorMessage("Pricing", "Operating Windows", "End Date", "must allow for at least one day of operation"),
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
                seatsTotal: Yup.number().min(0, createNestedErrorMessage("Pricing", "Operating Windows", "Seats Total", "must be positive")).optional(),
            })
        )
        .optional()
        .test(
            "non-overlapping-windows",
            createNestedErrorMessage("Pricing", "Operating Windows", "Windows", "cannot overlap"),
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
                            message: createNestedErrorMessage("Pricing", "Operating Windows", `Window starting ${currentWindow.original.startDate}`, `overlaps with previous window ending ${prevWindow.original.endDate}`),
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
                    .typeError(createNestedErrorMessage("Pricing", "Departures", "Date", "must be a valid date"))
                    .required(createNestedErrorMessage("Pricing", "Departures", "Date", "is required"))
                    .test(
                        "not-too-soon",
                        createNestedErrorMessage("Pricing", "Departures", "Date", "must be at least 10 days from today"),
                        function (value) {
                            if (!value) return false;
                            return new Date(value) >= minDateFromToday(10);
                        }
                    )
                    .test(
                        "within-operating-window",
                        createNestedErrorMessage("Pricing", "Departures", "Date", "must be within an operating window"),
                        function (value) {
                            const operatingWindows = this.parent?.parent?.operatingWindows;

                            if (!operatingWindows || operatingWindows.length === 0)
                                return true;

                            const departureDate = new Date(value);

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
                        createNestedErrorMessage("Pricing", "Departures", "Date", "must allow for full tour duration"),
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

                            const tourEndDate = new Date(departureDate);
                            tourEndDate.setDate(tourEndDate.getDate() + tourDurationDays - 1);

                            const windowEnd = new Date(operatingWindow.endDate);

                            return tourEndDate <= windowEnd;
                        }
                    ),
                seatsTotal: Yup.number()
                    .required(createNestedErrorMessage("Pricing", "Departures", "Seats Total", "is required"))
                    .min(1, createNestedErrorMessage("Pricing", "Departures", "Seats Total", "at least 1 seat is required")),
                meetingPoint: Yup.string().optional(),
                meetingCoordinates: BangladeshGeoPointSchema.optional(),
            })
        )
        .optional()
        .test(
            "unique-departure-dates",
            createNestedErrorMessage("Pricing", "Departures", "Dates", "must be unique"),
            function (departures) {
                if (!departures) return true;

                const dates = departures.map((d) => new Date(d.date).toDateString());
                const uniqueDates = new Set(dates);

                if (dates.length !== uniqueDates.size) {
                    return this.createError({
                        message: createNestedErrorMessage("Pricing", "Departures", "Dates", "duplicate departure dates are not allowed"),
                    });
                }
                return true;
            }
        )
        .test(
            "departures-within-windows",
            createNestedErrorMessage("Pricing", "Departures", "Dates", "must be within operating windows"),
            function (departures) {
                const operatingWindows = this.parent?.operatingWindows;

                if (
                    !departures ||
                    departures.length === 0 ||
                    !operatingWindows ||
                    operatingWindows.length === 0
                ) {
                    return true;
                }

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
                            message: createNestedErrorMessage("Pricing", "Departures", `Date ${departure.date.toISOString().split("T")[0]}`, "is not within any operating window"),
                        });
                    }
                }

                return true;
            }
        ),

    paymentMethods: Yup.array()
        .of(Yup.string().oneOf(Object.values(PAYMENT_METHOD), createErrorMessage("Pricing", "Payment Method", "has invalid value")))
        .required(createErrorMessage("Pricing", "Payment Methods", "at least one is required"))
        .min(1, createErrorMessage("Pricing", "Payment Methods", "at least one must be selected")),
});

export const Step5ComplianceSchema = Yup.object().shape({
    licenseRequired: Yup.boolean().default(false),
    ageSuitability: Yup.string()
        .oneOf(Object.values(AGE_SUITABILITY), createErrorMessage("Compliance", "Age Suitability", "is invalid"))
        .required(createErrorMessage("Compliance", "Age Suitability", "is required")),
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
                            .typeError(createNestedErrorMessage("Policy", "Cancellation", "Days Before", "must be a number"))
                            .required(createNestedErrorMessage("Policy", "Cancellation", "Days Before", "is required"))
                            .min(0, createNestedErrorMessage("Policy", "Cancellation", "Days Before", "cannot be negative"))
                            .test(
                                "unique-days-before",
                                createNestedErrorMessage("Policy", "Cancellation", "Days Before", "values must be unique"),
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
                            .typeError(createNestedErrorMessage("Policy", "Cancellation", "Refund Percent", "must be a number"))
                            .required(createNestedErrorMessage("Policy", "Cancellation", "Refund Percent", "is required"))
                            .min(0, createNestedErrorMessage("Policy", "Cancellation", "Refund Percent", "cannot be negative"))
                            .max(100, createNestedErrorMessage("Policy", "Cancellation", "Refund Percent", "cannot exceed 100"))
                            .test(
                                "descending-refund",
                                createNestedErrorMessage("Policy", "Cancellation", "Refund Percent", "should decrease as days before increases"),
                                function (value, context) {
                                    const rules = context.parent;
                                    if (!rules || !Array.isArray(rules) || rules.length <= 1)
                                        return true;

                                    const currentIndex = context.path.split("[")[1].split("]")[0];
                                    const currentRule = rules[parseInt(currentIndex)];

                                    const sortedRules = [...rules].sort(
                                        (a, b) => b.daysBefore - a.daysBefore
                                    );
                                    const sortedIndex = sortedRules.findIndex(
                                        (rule) =>
                                            rule.daysBefore === currentRule.daysBefore &&
                                            rule.refundPercent === currentRule.refundPercent
                                    );

                                    if (sortedIndex > 0) {
                                        const prevRule = sortedRules[sortedIndex - 1];
                                        if (currentRule.refundPercent > prevRule.refundPercent) {
                                            return this.createError({
                                                message: createNestedErrorMessage("Policy", "Cancellation", "Refund Percent", "should not increase as cancellation date gets closer"),
                                            });
                                        }
                                    }

                                    return true;
                                }
                            ).default(0),
                    })
                )
                .min(1, createNestedErrorMessage("Policy", "Cancellation", "Rules", "at least one rule is required"))
                .required(createNestedErrorMessage("Policy", "Cancellation", "Rules", "are required"))
                .test(
                    "covers-all-periods",
                    createNestedErrorMessage("Policy", "Cancellation", "Rules", "must cover from 0 days to a reasonable maximum"),
                    function (rules) {
                        if (!rules || rules.length === 0) return true;

                        const hasDayZeroRule = rules.some(
                            rule => rule.daysBefore === 0
                        );

                        if (!hasDayZeroRule) {
                            return this.createError({
                                message: createNestedErrorMessage("Policy", "Cancellation", "Rules", "must include a rule for 0 days (day of departure)"),
                            });
                        }

                        const maxDaysBefore = Math.max(...rules.map(r => r.daysBefore));

                        if (maxDaysBefore < 7) {
                            return this.createError({
                                message: createNestedErrorMessage("Policy", "Cancellation", "Rules", "should cover at least 7 days before departure"),
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
                .of(Yup.string().oneOf(Object.values(PAYMENT_METHOD), createNestedErrorMessage("Policy", "Refund", "Method", "has invalid value")))
                .required(createNestedErrorMessage("Policy", "Refund", "Method", "at least one is required"))
                .min(1, createNestedErrorMessage("Policy", "Refund", "Method", "at least one must be selected")),
            processingDays: Yup.number()
                .required(createNestedErrorMessage("Policy", "Refund", "Processing Days", "is required"))
                .min(0, createNestedErrorMessage("Policy", "Refund", "Processing Days", "cannot be negative"))
                .max(30, createNestedErrorMessage("Policy", "Refund", "Processing Days", "should not exceed 30")),
        })
        .default({ method: [], processingDays: 0 })
        .required(),

    terms: Yup.string().required(createErrorMessage("Policy", "Terms", "are required")),
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