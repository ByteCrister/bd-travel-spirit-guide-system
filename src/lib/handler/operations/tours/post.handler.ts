// app/api/operations/tours/v1/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import TourModel, { IDestinationBlock, ITour } from "@/models/tours/tour.model";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { TOUR_STATUS, MODERATION_STATUS } from "@/constants/tour/tour.const";
import ConnectDB from "@/config/db";
import { validationSchemas } from "@/utils/validators/tour/add-tour.validator";
import { combineSchemas } from "@/types/common/validator.yup";
import { ValidationError } from "yup";
import { CreateTourDTO, TourDetailDTO } from "@/types/tour/tour.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel from "@/models/employees/employees.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { slugify } from "@/lib/helpers/slugify";

// POST Helper function to map destinations & attractions
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

const TourPostHandler = async (request: NextRequest) => {
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
    const tourDetailDTO = await withTransaction<TourDetailDTO>(async session => {

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

        const tour = new TourModel(tourData)
        await tour.save({ session });

        // 7️⃣ Build response
        const detailDto = await buildTourDetailDTO(tour._id as Types.ObjectId, session);

        if (!detailDto)
            throw new ApiError(
                "Tour was created but failed to build tour details.",
                500
            );

        return detailDto;
    });

    return { data: tourDetailDTO, status: 201 };
}

export default TourPostHandler;