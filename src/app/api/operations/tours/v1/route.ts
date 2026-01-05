// app/api/tours/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import TourModel, { IDestinationBlock, ITour } from "@/models/tours/tour.model";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { TOUR_STATUS, MODERATION_STATUS } from "@/constants/tour.const";
import ConnectDB from "@/config/db";
import { validationSchemas } from "@/utils/validators/tour/add-tour.validator";
import { combineSchemas } from "@/types/validator.yup";
import { ValidationError } from "yup";
import { CreateTourDTO } from "@/types/tour.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel from "@/models/employees/employees.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { slugify } from "@/lib/helpers/slugify";

// 🔹 Helper function to map destinations & attractions
function mapDestinations(
    destinations: CreateTourDTO["destinations"],
): IDestinationBlock[] {
    return destinations?.map((dest) => {
        const mappedDest: IDestinationBlock = {
            description: dest.description,
            highlights: dest.highlights,
            coordinates: dest.coordinates,
            activities: dest.activities?.map(act => ({ ...act })) || [],
            attractions: dest.attractions?.map((attr) => ({
                ...attr,
                images: [],
            })) || [],
            images: [],
        };
        return mappedDest;
    }) || [];
}

export const POST = withErrorHandler(async (request: NextRequest) => {
    // 1️⃣ Parse request body
    const body = (await request.json()) as CreateTourDTO;

    // 2️⃣ Validate request body
    const fullValidationSchema = combineSchemas(validationSchemas);
    try {
        await fullValidationSchema.validate(body, { abortEarly: false, stripUnknown: true });
    } catch (err) {
        if (err instanceof ValidationError) {
            const errors = err.inner.map(e => ({ path: e.path, message: e.message }));
            throw new ApiError(errors[0]?.message || "Validation failed", 400);
        }
    }

    // 3️⃣ Connect DB
    await ConnectDB();

    // 4️⃣ Get authorId
    const authorIdStr = await getUserIdFromSession();
    if (!authorIdStr) throw new ApiError("Unauthorized", 401);
    const authorId = new Types.ObjectId(authorIdStr);

    // 5️⃣ Get companyId
    const employee = await EmployeeModel.findOne({ user: authorId }).select("companyId").lean();
    if (!employee?.companyId) throw new ApiError("Employee or company not found", 404);
    const companyId =
        employee.companyId instanceof Types.ObjectId
            ? employee.companyId
            : new Types.ObjectId(employee.companyId);

    // 6️⃣ Upload images & create tour in transaction
    const createdTour = await withTransaction<ITour>(async session => {

        // Map destinations
        const mappedDestinations = mapDestinations(body.destinations);

        // Prepare tour data
        const tourData: Partial<ITour> = {
            companyId,
            authorId,
            title: body.title,
            slug: slugify(body.title),
            summary: body.summary,
            heroImage: undefined,
            gallery: [],
            seo: body.seo,
            status: TOUR_STATUS.DRAFT,
            tourType: body.tourType,
            division: body.division,
            district: body.district,
            accommodationType: body.accommodationType,
            guideIncluded: body.guideIncluded ?? true,
            transportIncluded: body.transportIncluded ?? true,
            emergencyContacts: body.emergencyContacts,
            destinations: mappedDestinations,
            itinerary: body.itinerary,
            inclusions: body.inclusions,
            exclusions: body.exclusions,
            difficulty: body.difficulty,
            bestSeason: body.bestSeason,
            audience: body.audience,
            categories: body.categories,
            translations: body.translations,
            mainLocation: body.mainLocation,
            transportModes: body.transportModes,
            pickupOptions: body.pickupOptions,
            meetingPoint: body.meetingPoint,
            packingList: body.packingList,
            basePrice: body.basePrice,
            discounts: body.discounts?.map(d => ({
                ...d,
                validFrom: d.validFrom ? new Date(d.validFrom) : undefined,
                validUntil: d.validUntil ? new Date(d.validUntil) : undefined,
            })),
            duration: body.duration,
            operatingWindows: body.operatingWindows?.map(w => ({ ...w, startDate: new Date(w.startDate), endDate: new Date(w.endDate), seatsBooked: 0 })),
            departures: body.departures?.map(d => ({ ...d, date: new Date(d.date), seatsBooked: 0 })),
            paymentMethods: body.paymentMethods,
            licenseRequired: body.licenseRequired ?? false,
            ageSuitability: body.ageSuitability,
            accessibility: body.accessibility,
            cancellationPolicy: body.cancellationPolicy,
            refundPolicy: body.refundPolicy,
            terms: body.terms,
            moderationStatus: MODERATION_STATUS.PENDING,
            wishlistCount: 0,
            featured: false,
            viewCount: 0,
            likeCount: 0,
            shareCount: 0,
            tags: body.tags,
        };

        const [tour] = await TourModel.create([tourData], { session });
        return tour;
    });

    // 7️⃣ Build response
    const tourDetailDTO = await buildTourDetailDTO(createdTour._id as Types.ObjectId);
    return { data: tourDetailDTO, status: 201 };
});