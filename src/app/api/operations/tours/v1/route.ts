// app/api/tours/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import TourModel, { IDestinationBlock, ITour } from "@/models/tours/tour.model";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { TOUR_STATUS, MODERATION_STATUS } from "@/constants/tour.const";
import ConnectDB from "@/config/db";
import { validationSchemas } from "@/utils/validators/add-tour.validator";
import { combineSchemas } from "@/types/validator.yup";
import { ValidationError } from "yup";
import { ASSET_TYPE } from "@/constants/asset.const";
import { CreateTourDTO } from "@/types/tour.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel from "@/models/employees/employees.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { slugify } from "@/lib/helpers/slugify";

// 🔹 Helper function to map destinations & attractions
function mapDestinationsWithImages(
    destinations: CreateTourDTO["destinations"],
    uploadedAssetIds: Types.ObjectId[],
    assetIndexRef: { current: number }
): IDestinationBlock[] {
    return destinations?.map((dest) => {
        const mappedDest: IDestinationBlock = {
            description: dest.description,
            highlights: dest.highlights,
            coordinates: dest.coordinates,
            activities: dest.activities?.map(act => ({ ...act })) || [],
            attractions: dest.attractions?.map((attr) => ({
                ...attr,
                images: attr.imageIds?.map(() => uploadedAssetIds[assetIndexRef.current++]) || [],
            })) || [],
            images: dest.imageIds?.map(() => uploadedAssetIds[assetIndexRef.current++]) || [],
        };
        return mappedDest;
    }) || [];
}

export const POST = withErrorHandler(async (request: NextRequest) => {
    // 1️⃣ Parse request body
    const body = (await request.json()) as CreateTourDTO;
    const statusParam = request.nextUrl.searchParams.get("status");

    if (statusParam !== (TOUR_STATUS.DRAFT || TOUR_STATUS.SUBMITTED)) {
        throw new ApiError("Invalid status", 400);
    }

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
        // Collect all images
        const imagesToUpload: { base64: string; name?: string; assetType?: string }[] = [];

        if (body.heroImage) imagesToUpload.push({ base64: body.heroImage, name: "hero-image", assetType: ASSET_TYPE.IMAGE });
        body.gallery?.forEach((b64, i) => imagesToUpload.push({ base64: b64, name: `gallery-${i + 1}`, assetType: ASSET_TYPE.IMAGE }));
        body.destinations?.forEach((dest, destIndex) => {
            dest.imageIds?.forEach((b64, idx) => imagesToUpload.push({ base64: b64, name: `destination-${destIndex + 1}-image-${idx + 1}`, assetType: ASSET_TYPE.IMAGE }));
            dest.attractions?.forEach((attr, attrIndex) => {
                attr.imageIds?.forEach((b64, idx) => imagesToUpload.push({ base64: b64, name: `destination-${destIndex + 1}-attraction-${attrIndex + 1}-image-${idx + 1}`, assetType: ASSET_TYPE.IMAGE }));
            });
        });

        // Upload all images
        const uploadedAssetIds = await uploadAssets(imagesToUpload, session);
        const assetIndexRef = { current: 0 };

        // Map destinations
        const mappedDestinations = mapDestinationsWithImages(body.destinations, uploadedAssetIds, assetIndexRef);

        // Prepare tour data
        const tourData: Partial<ITour> = {
            companyId,
            authorId,
            title: body.title,
            slug: slugify(body.title),
            summary: body.summary,
            heroImage: body.heroImage ? uploadedAssetIds[assetIndexRef.current++] : undefined,
            gallery: body.gallery?.map(() => uploadedAssetIds[assetIndexRef.current++]),
            seo: body.seo,
            status: body.status || TOUR_STATUS.DRAFT,
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