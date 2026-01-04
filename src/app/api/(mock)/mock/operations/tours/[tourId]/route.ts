// app/api/mock/tours/[tourId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import { TourDetailDTO } from '@/types/tour.types';
import {
    TOUR_STATUS,
    TRAVEL_TYPE,
    DIFFICULTY_LEVEL,
    AUDIENCE_TYPE,
    TOUR_CATEGORIES,
    DIVISION,
    DISTRICT,
    PAYMENT_METHOD,
    CURRENCY,
    TRANSPORT_MODE,
    SEASON,
    ACCOMMODATION_TYPE,
    AGE_SUITABILITY,
    MODERATION_STATUS,
    TOUR_DISCOUNT,
    MEALS_PROVIDED
} from '@/constants/tour.const';

interface MockApiResponse {
    success: boolean;
    data?: TourDetailDTO;
    error?: string;
    message?: string;
}

// Cache for consistent mock data across requests
const mockToursCache = new Map<string, TourDetailDTO>();

// Seed faker for consistent results
faker.seed(12345);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) {
    try {
        const tourId = (await params).tourId;

        // Check if we have cached this tour
        if (mockToursCache.has(tourId)) {
            const cachedTour = mockToursCache.get(tourId)!;
            return NextResponse.json<MockApiResponse>({
                success: true,
                data: cachedTour
            });
        }

        // Generate consistent mock data based on tourId
        const seed = parseInt(tourId.replace(/\D/g, '')) || 0;
        faker.seed(seed);

        // Generate mock tour
        const tourDetail = generateMockTourDetail(tourId);

        // Cache the tour
        mockToursCache.set(tourId, tourDetail);

        // Add delay to simulate network latency
        await new Promise(resolve => setTimeout(resolve, 200));

        return NextResponse.json<MockApiResponse>({
            success: true,
            data: tourDetail
        });

    } catch (error) {
        console.error('Error generating mock tour:', error);
        return NextResponse.json<MockApiResponse>({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate mock tour data'
        }, { status: 500 });
    }
}

// Helper function to generate a complete mock tour
function generateMockTourDetail(tourId: string): TourDetailDTO {
    const companyId = faker.string.uuid();
    const authorId = faker.string.uuid();
    const createdAt = faker.date.past({ years: 1 });
    const updatedAt = faker.date.recent({ days: 30 });
    const publishedAt = faker.date.between({ from: createdAt, to: updatedAt });

    const status = faker.helpers.arrayElement(Object.values(TOUR_STATUS));
    const tourType = faker.helpers.arrayElement(Object.values(TRAVEL_TYPE));
    const division = faker.helpers.arrayElement(Object.values(DIVISION));
    const district = faker.helpers.arrayElement(Object.values(DISTRICT));
    const difficulty = faker.helpers.arrayElement(Object.values(DIFFICULTY_LEVEL));
    const ageSuitability = faker.helpers.arrayElement(Object.values(AGE_SUITABILITY));
    const currency = faker.helpers.arrayElement(Object.values(CURRENCY));
    const moderationStatus = faker.helpers.arrayElement(Object.values(MODERATION_STATUS));

    // Generate random categories (1-3)
    const categories = faker.helpers.arrayElements(
        Object.values(TOUR_CATEGORIES),
        faker.number.int({ min: 1, max: 3 })
    );

    // Generate random audience types (1-4)
    const audience = faker.helpers.arrayElements(
        Object.values(AUDIENCE_TYPE),
        faker.number.int({ min: 1, max: 4 })
    );

    // Generate random seasons (1-3)
    const bestSeason = faker.helpers.arrayElements(
        Object.values(SEASON),
        faker.number.int({ min: 1, max: 3 })
    );

    // Generate random transport modes (1-3)
    const transportModes = faker.helpers.arrayElements(
        Object.values(TRANSPORT_MODE),
        faker.number.int({ min: 1, max: 3 })
    );

    // Generate random payment methods (2-4)
    const paymentMethods = faker.helpers.arrayElements(
        Object.values(PAYMENT_METHOD),
        faker.number.int({ min: 2, max: 4 })
    );

    // Generate random accommodation types (1-3)
    const accommodationType = faker.helpers.arrayElements(
        Object.values(ACCOMMODATION_TYPE),
        faker.number.int({ min: 1, max: 3 })
    );

    // Generate base price
    const basePriceAmount = faker.number.int({ min: 5000, max: 50000 });
    const basePrice = {
        amount: basePriceAmount,
        currency
    };

    // Generate discounts (0-2)
    const discounts = Array.from({ length: faker.number.int({ min: 0, max: 2 }) }).map(() => ({
        type: faker.helpers.arrayElement(Object.values(TOUR_DISCOUNT)),
        value: faker.number.int({ min: 5, max: 25 }),
        code: faker.string.alphanumeric(8).toUpperCase(),
        validFrom: faker.date.past({ years: 1 }).toISOString(),
        validUntil: faker.date.future({ years: 1 }).toISOString()
    }));

    // Generate duration
    const duration = {
        days: faker.number.int({ min: 1, max: 14 }),
        nights: faker.number.int({ min: 0, max: 13 })
    };

    // Generate destinations (2-5)
    const destinations = Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() => ({
        description: faker.lorem.paragraphs(2),
        highlights: Array.from({ length: faker.number.int({ min: 3, max: 7 }) }).map(() =>
            faker.lorem.sentence()
        ),
        attractions: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() => ({
            title: faker.lorem.words(3),
            description: faker.lorem.sentence(),
            bestFor: faker.lorem.words(2),
            insiderTip: faker.lorem.sentence(),
            address: faker.location.streetAddress(),
            openingHours: '9:00 AM - 6:00 PM',
            imageIds: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() =>
                faker.image.urlLoremFlickr({ category: 'landscape' })
            ),
            coordinates: {
                lat: faker.location.latitude(),
                lng: faker.location.longitude()
            },
            
        })),
        activities: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => ({
            title: faker.lorem.words(3),
            url: faker.internet.url(),
            provider: faker.company.name(),
            duration: `${faker.number.int({ min: 1, max: 6 })} hours`,
            price: {
                amount: faker.number.int({ min: 500, max: 5000 }),
                currency
            },
            rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 })
        })),
        imageIds: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }).map(() =>
            faker.image.urlLoremFlickr({ category: 'landscape' })
        ),
        coordinates: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude()
        }
    }));

    // Generate itinerary (based on duration)
    const itinerary = Array.from({ length: duration.days }).map((_, day) => ({
        day: day + 1,
        title: faker.lorem.words(4),
        description: faker.lorem.paragraphs(2),
        mealsProvided: faker.helpers.arrayElements(Object.values(MEALS_PROVIDED), {
            min: 1,
            max: 3
        }),
        accommodation: faker.helpers.arrayElement(Object.values(ACCOMMODATION_TYPE)),
        activities: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() =>
            faker.lorem.words(3)
        ),
        travelDistance: `${faker.number.int({ min: 50, max: 300 })} km`,
        travelMode: faker.helpers.arrayElement(Object.values(TRANSPORT_MODE)),
        estimatedTime: `${faker.number.int({ min: 2, max: 8 })} hours`,
        importantNotes: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() =>
            faker.lorem.sentence()
        )
    }));

    // Generate inclusions (5-10)
    const inclusions = Array.from({ length: faker.number.int({ min: 5, max: 10 }) }).map(() => ({
        label: faker.lorem.words(3),
        description: faker.lorem.sentence()
    }));

    // Generate exclusions (3-6)
    const exclusions = Array.from({ length: faker.number.int({ min: 3, max: 6 }) }).map(() => ({
        label: faker.lorem.words(3),
        description: faker.lorem.sentence()
    }));

    // Generate departures (3-10)
    const departures = Array.from({ length: faker.number.int({ min: 3, max: 10 }) }).map(() => ({
        id: faker.string.uuid(),
        date: faker.date.future({ years: 1, refDate: new Date() }).toISOString(),
        seatsTotal: faker.number.int({ min: 10, max: 50 }),
        seatsBooked: faker.number.int({ min: 0, max: 45 }),
        meetingPoint: faker.location.streetAddress(),
        meetingCoordinates: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude()
        }
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate operating windows (1-3)
    const operatingWindows = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => {
        const startDate = faker.date.future({ years: 1 });
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + faker.number.int({ min: 30, max: 90 }));

        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            seatsTotal: faker.number.int({ min: 20, max: 100 }),
            seatsBooked: faker.number.int({ min: 0, max: 80 })
        };
    });

    // Generate packing list (5-15 items)
    const packingList = Array.from({ length: faker.number.int({ min: 5, max: 15 }) }).map(() => ({
        item: faker.commerce.productName(),
        required: faker.datatype.boolean(),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined
    }));

    // Generate pickup options (2-5 cities)
    const pickupOptions = Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() => ({
        city: faker.location.city(),
        price: faker.number.int({ min: 500, max: 3000 }),
        currency
    }));

    // Calculate computed fields
    const totalSeats = departures.reduce((sum, dep) => sum + dep.seatsTotal, 0);
    const bookedSeats = departures.reduce((sum, dep) => sum + dep.seatsBooked, 0);
    const availableSeats = totalSeats - bookedSeats;
    const occupancyPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

    const hasActiveDiscount = discounts.some(discount => {
        const now = new Date();
        const validFrom = new Date(discount.validFrom!);
        const validUntil = new Date(discount.validUntil!);
        return now >= validFrom && now <= validUntil;
    });

    const nextDeparture = departures[0]?.date;
    const isUpcoming = nextDeparture ? new Date(nextDeparture) > new Date() : false;
    const isExpired = status === TOUR_STATUS.COMPLETED || status === TOUR_STATUS.TERMINATED || status === TOUR_STATUS.ARCHIVED;

    const activeDiscount = discounts.find(discount => {
        const now = new Date();
        const validFrom = new Date(discount.validFrom!);
        const validUntil = new Date(discount.validUntil!);
        return now >= validFrom && now <= validUntil;
    });

    const discountedAmount = activeDiscount
        ? basePriceAmount * (1 - (activeDiscount.value / 100))
        : undefined;

    // Generate hero image and gallery
    const heroImage = faker.image.urlLoremFlickr({ category: 'travel' });
    const gallery = Array.from({ length: faker.number.int({ min: 5, max: 12 }) }).map(() =>
        faker.image.urlLoremFlickr({ category: 'landscape' })
    );

    // Generate tags (3-8)
    const tags = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }).map(() =>
        faker.lorem.word()
    );

    // Generate rating
    const ratingAverage = faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 });
    const ratingCount = faker.number.int({ min: 10, max: 200 });

    // Generate translations
    const translations = {
        bn: {
            title: faker.lorem.words(4),
            summary: faker.lorem.paragraph(),
            description: faker.lorem.paragraphs(3)
        },
        en: {
            title: faker.lorem.words(4),
            summary: faker.lorem.paragraph(),
            description: faker.lorem.paragraphs(3)
        }
    };

    // Generate cancellation policy rules
    const cancellationRules = [
        { daysBefore: 30, refundPercent: 100 },
        { daysBefore: 15, refundPercent: 50 },
        { daysBefore: 7, refundPercent: 25 },
        { daysBefore: 1, refundPercent: 0 }
    ];

    // Generate accessibility object
    const accessibility = {
        wheelchair: faker.datatype.boolean(),
        familyFriendly: faker.datatype.boolean(),
        petFriendly: faker.datatype.boolean(),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined
    };

    // Generate emergency contacts
    const emergencyContacts = {
        policeNumber: '999',
        ambulanceNumber: '16263',
        fireServiceNumber: '102',
        localEmergency: faker.phone.number()
    };

    // Generate main location address
    const mainLocation = {
        address: {
            line1: faker.location.streetAddress(),
            line2: faker.location.secondaryAddress(),
            city: faker.location.city(),
            district: faker.location.county(),
            region: faker.location.state(),
            postalCode: faker.location.zipCode()
        },
        coordinates: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude()
        }
    };

    // Generate SEO data
    const seo = {
        metaTitle: faker.lorem.words(6),
        metaDescription: faker.lorem.sentence()
    };

    // Generate refund policy
    const refundPolicy = {
        method: paymentMethods.slice(0, 2),
        processingDays: faker.number.int({ min: 3, max: 14 })
    };

    // Generate terms
    const terms = faker.lorem.paragraphs(3);

    return {
        // =============== IDENTITY & BASIC INFO ===============
        id: tourId,
        title: faker.lorem.words(4),
        slug: faker.helpers.slugify(faker.lorem.words(4)).toLowerCase(),
        status,
        summary: faker.lorem.paragraphs(2),
        heroImage,
        gallery,
        seo,

        // =============== BANGLADESH-SPECIFIC FIELDS ===============
        tourType,
        division,
        district,
        accommodationType,
        guideIncluded: faker.datatype.boolean(),
        transportIncluded: faker.datatype.boolean(),
        emergencyContacts,

        // =============== CONTENT & ITINERARY ===============
        destinations,
        itinerary,
        inclusions,
        exclusions,
        difficulty,
        bestSeason,
        audience,
        categories,
        translations,

        // =============== LOGISTICS ===============
        mainLocation,
        transportModes,
        pickupOptions,
        meetingPoint: faker.location.streetAddress(),
        packingList,

        // =============== PRICING & COMMERCE ===============
        basePrice,
        discounts,
        duration,
        operatingWindows,
        departures,
        paymentMethods,

        // =============== COMPLIANCE & ACCESSIBILITY ===============
        licenseRequired: faker.datatype.boolean(),
        ageSuitability,
        accessibility,

        // =============== POLICIES ===============
        cancellationPolicy: {
            refundable: faker.datatype.boolean(),
            rules: cancellationRules
        },
        refundPolicy,
        terms,

        // =============== ENGAGEMENT & RATINGS ===============
        ratings: {
            average: ratingAverage,
            count: ratingCount
        },
        wishlistCount: faker.number.int({ min: 5, max: 100 }),
        featured: faker.datatype.boolean(),

        // =============== MODERATION ===============
        moderationStatus,
        rejectionReason: moderationStatus === MODERATION_STATUS.DENIED
            ? faker.lorem.sentence()
            : undefined,
        completedAt: status === TOUR_STATUS.COMPLETED
            ? faker.date.past({ years: 1 }).toISOString()
            : undefined,
        reApprovalRequestedAt: faker.datatype.boolean()
            ? faker.date.recent({ days: 30 }).toISOString()
            : undefined,

        // =============== SYSTEM FIELDS ===============
        companyId,
        authorId,
        tags,
        publishedAt: publishedAt.toISOString(),
        viewCount: faker.number.int({ min: 100, max: 5000 }),
        likeCount: faker.number.int({ min: 10, max: 500 }),
        shareCount: faker.number.int({ min: 5, max: 200 }),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        deletedAt: status === TOUR_STATUS.ARCHIVED
            ? faker.date.recent({ days: 10 }).toISOString()
            : undefined,

        // =============== COMPUTED/UI-ONLY FIELDS ===============
        priceSummary: {
            minAmount: basePriceAmount,
            maxAmount: basePriceAmount,
            currency,
            discountedAmount
        },
        bookingSummary: {
            totalSeats,
            bookedSeats,
            availableSeats,
            isFull: availableSeats <= 0,
            occupancyPercentage
        },
        nextDeparture,
        isUpcoming,
        isExpired,
        hasActiveDiscount
    };
}