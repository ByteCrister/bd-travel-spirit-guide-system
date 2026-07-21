// app/api/operations/tours/v1/route.ts
import { NextRequest } from "next/server";
import UserModel from "@/models/user.model";
import { USER_ROLE } from "@/constants/current-user/user.const";
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
import GuideModel from "@/models/guide/guide.model";
import EmployeeModel from "@/models/employees/employees.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { slugify } from "@/lib/helpers/slugify";
import { AUDIT_ACTION, logAuditForActor } from "@/lib/audit/audit-logger";
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";
import { SUPPORT_SYSTEM_NOTIFICATION_TYPE, SUPPORT_SYSTEM_NOTIFICATION_PRIORITY } from "@/constants/notifications/support-system-notification.const";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SocketTTriggerTypes } from "@/constants/socket/socket.const";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
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

    // 5️⃣ Resolve companyId for both guide and assistant roles
    const [userData] = await UserModel.aggregate([
        { $match: { _id: authorId } },
        {
            $lookup: {
                from: getCollectionName(GuideModel),
                localField: "_id",
                foreignField: "owner.user",
                as: "guide",
            },
        },
        {
            $lookup: {
                from: getCollectionName(EmployeeModel),
                localField: "_id",
                foreignField: "user",
                as: "employee",
            },
        },
        {
            $project: {
                _id: 1,
                role: 1,
                companyId: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ["$role", USER_ROLE.GUIDE] },
                                then: { $arrayElemAt: ["$guide._id", 0] },
                            },
                            {
                                case: { $eq: ["$role", USER_ROLE.ASSISTANT] },
                                then: { $arrayElemAt: ["$employee.companyId", 0] },
                            },
                        ],
                        default: null,
                    },
                },
            },
        },
    ]);

    if (!userData) throw new ApiError("User not found", 404);
    if (!userData.companyId)
        throw new ApiError(
            "Access denied: only guide or assistant users can create tours",
            403
        );
    const companyId = userData.companyId instanceof Types.ObjectId
        ? userData.companyId
        : new Types.ObjectId(userData.companyId);

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
            operatingWindow: body.operatingWindow ? { startDate: new Date(body.operatingWindow.startDate), endDate: new Date(body.operatingWindow.endDate) } : undefined,
            departure: body.departure ? { ...body.departure, date: new Date(body.departure.date), seatsBooked: 0 } : undefined,
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

        const notification = await SupportSystemNotificationModel.create(
            [{
                type: SUPPORT_SYSTEM_NOTIFICATION_TYPE.NEW_TOUR_REQUESTED,
                title: "New Tour as Draft",
                message: `Tour "${tour.title}" has been added as draft.`,
                priority: SUPPORT_SYSTEM_NOTIFICATION_PRIORITY.LOW,
                relatedModel: "Tour",
                relatedId: tour._id,
            }],
            { session }
        );
        const notifDoc = Array.isArray(notification) ? notification[0] : notification;

        // Get the first admin user's ID to use as ownerId for the socket event
        const adminUser = await UserModel.findOne({ role: USER_ROLE.ADMIN }).select("_id").lean();
        const ownerId = adminUser?._id?.toString() || "";

        triggerSocketEvent({
            userId: authorIdStr,
            ownerId: ownerId,
            type: SUPPORT_SYSTEM_NOTIFICATION_TYPE.NEW_TOUR_REQUESTED as unknown as SocketTTriggerTypes,
            data: notifDoc,
        }).catch(console.error);

        return detailDto;
    });

    await logAuditForActor(authorIdStr, {
        targetModel: "Tour",
        target: tourDetailDTO.id,
        action: AUDIT_ACTION.CREATE,
        note: "Created tour draft",
    });

    return { data: tourDetailDTO, status: 201 };
}

export default TourPostHandler;