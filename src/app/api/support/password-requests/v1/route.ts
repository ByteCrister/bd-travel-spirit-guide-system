// api/operations/employees-password-request/v1
import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";

import ResetPasswordRequestModel, { IResetPasswordRequest } from "@/models/employees/reset-password-request.model";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import { FilterQuery, PipelineStage } from "mongoose";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { Types } from "mongoose";
import { REQUEST_STATUS, RequestStatus } from "@/constants/employee/reset-password-request.const";
import GuideModel from "@/models/guide/guide.model";
import GuideForgotPasswordModel from "@/models/guide/guide-forgot-password.model";
import { FORGOT_PASSWORD_STATUS } from "@/constants/guide/guide-forgot-password.const";
import { GuideSystemNotificationModel } from "@/models/notifications/guide-system-notification.model";
import { GUIDE_SYSTEM_NOTIFICATION_TYPE, GUIDE_SYSTEM_NOTIFICATION_PRIORITY } from "@/constants/notifications/guide-system-notification.const";
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";
import { SUPPORT_SYSTEM_NOTIFICATION_TYPE, SUPPORT_SYSTEM_NOTIFICATION_PRIORITY } from "@/constants/notifications/support-system-notification.const";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SocketTTriggerTypes } from "@/constants/socket/socket.const";
/* -----------------------------------------
   Query params
------------------------------------------ */

interface ListQueryParams {
    search?: string;
    status?: RequestStatus | "all";
    sortBy?: string;
    sortDir?: "asc" | "desc";
    page?: string;
    limit?: string;
}

/* -----------------------------------------
   Get list of request for password resets
------------------------------------------ */

export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries()) as ListQueryParams;

    const {
        search,
        status,
        sortBy = "requestedAt",
        sortDir = "desc",
        page = "1",
        limit = "20",
    } = params;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    /* -----------------------------------------
       Base query - first filter by support users
    ------------------------------------------ */

    // First, get all support user IDs
    const supportUsers = await UserModel.find({
        role: USER_ROLE.SUPPORT
    }).select("_id").lean();

    const supportUserIds = supportUsers.map(user => user._id);

    const query: FilterQuery<IResetPasswordRequest> = {
        user: { $in: supportUserIds }
    };

    if (status && status !== "all") {
        query.status = status;
    }

    /* -----------------------------------------
       Search within support users
    ------------------------------------------ */
    if (search) {
        const regex = new RegExp(search, "i");

        // Get support users matching search
        const matchingSupportUsers = await UserModel.find({
            _id: { $in: supportUserIds },
            $or: [{ email: regex }, { name: regex }]
        }).select("_id").lean();

        // Get employees of support users matching search
        const matchingEmployees = await EmployeeModel.find({
            user: { $in: supportUserIds },
            $or: [
                { "contactInfo.phone": regex },
                { "contactInfo.email": regex },
            ],
        }).select("_id").lean();

        const searchConditions = [];

        if (matchingSupportUsers.length > 0) {
            searchConditions.push({ user: { $in: matchingSupportUsers.map(u => u._id) } });
        }

        if (matchingEmployees.length > 0) {
            searchConditions.push({ employee: { $in: matchingEmployees.map(e => e._id) } });
        }

        searchConditions.push({ description: regex });

        if (searchConditions.length > 0) {
            query.$or = searchConditions;
        }
    }

    /* -----------------------------------------
       Sorting
    ------------------------------------------ */

    const sortFieldMap: Record<string, string> = {
        requesterEmail: "user.email",
        requesterName: "user.name",
        status: "status",
        requestedAt: "requestedAt",
        reviewedAt: "reviewedAt",
        fulfilledAt: "fulfilledAt",
    };

    const sortField = sortFieldMap[sortBy] ?? "requestedAt";
    const sortOrder = sortDir === "asc" ? 1 : -1;

    /* -----------------------------------------
       Query execution with aggregation for better control
    ------------------------------------------ */

    // Use aggregation to properly handle population and filtering
    const aggregationPipeline: PipelineStage[] = [
        { $match: query },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $lookup: {
                from: "employees",
                localField: "employee",
                foreignField: "_id",
                as: "employeeInfo"
            }
        },
        { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },
        {
            $match: {
                "userInfo.role": USER_ROLE.SUPPORT
            }
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: limitNum }
    ];

    const countPipeline = [
        { $match: query },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $match: {
                "userInfo.role": USER_ROLE.SUPPORT
            }
        },
        { $count: "total" }
    ];

    const [requests, countResult] = await Promise.all([
        ResetPasswordRequestModel.aggregate(aggregationPipeline),
        ResetPasswordRequestModel.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    /* -----------------------------------------
       DTO transformation (frontend-safe)
    ------------------------------------------ */

    const data = requests.map((req) => ({
        _id: req._id.toString(),
        requesterEmail: req.userInfo?.email || "",
        requesterName: req.userInfo?.name || "",
        requesterMobile: req.employeeInfo?.contactInfo?.phone || "",
        description: req.description,
        reason: req.denialReason,
        status: req.status,
        requestedAt: req.requestedAt?.toISOString(),
        reviewedAt: req.reviewedAt?.toISOString(),
        fulfilledAt: req.fulfilledAt?.toISOString(),
        requestedFromIP: req.requestedFromIP,
        requestedAgent: req.requestedAgent,
        createdAt: req.createdAt?.toISOString(),
        updatedAt: req.updatedAt?.toISOString(),
    }));

    return {
        data: {
            data,
            meta: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        },
        status: 200,
    };
});


interface ForgotPasswordRequestBody {
    email: string;
    description?: string;
}
/* -----------------------------------------
   Employee requests for password reset
------------------------------------------ */
export const POST = withErrorHandler(async (req: NextRequest) => {

    const body: ForgotPasswordRequestBody = await req.json();
    const email = body.email?.trim().toLowerCase();
    const description = body.description?.trim();

    /* ----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new ApiError("Invalid email address", 400);
    }

    /* ----------------------------------------
       RATE LIMIT (per email)
    ----------------------------------------- */

    const allowed = await authRateLimit({
        identifier: email,
        limit: 5,
        window: 60,
    });

    if (!allowed) {
        throw new ApiError(
            "Too many requests. Please try again later.",
            429
        );
    }

    await ConnectDB();

    const result = await withTransaction(async (session) => {

        /* ----------------------------------------
           USER LOOKUP (SUPPORT OR GUIDE)
        ----------------------------------------- */

        const user = await UserModel.findOne({
            email,
            role: { $in: [USER_ROLE.ASSISTANT, USER_ROLE.GUIDE] }
        })
        .select("_id role")
        .session(session);

        if (!user) {
            return {
                message:
                    "If an account exists, your request has been submitted.",
            };
        }

        /* =====================================================
           BRANCH A — EMPLOYEE (ASSISTANT) FLOW (YOUR EXISTING LOGIC)
        ===================================================== */

        if (user.role === USER_ROLE.ASSISTANT) {

            const employee = await EmployeeModel.findOne({ user: user._id })
                .select("_id companyId")
                .session(session)
                .lean();

            if (!employee) {
                return {
                    message:
                        "If an account exists, your request has been submitted.",
                };
            }

            const existingRequest =
                await ResetPasswordRequestModel.findOne({
                    user: user._id,
                    status: REQUEST_STATUS.PENDING,
                }).session(session);

            if (existingRequest) {
                throw new ApiError(
                    "You already have a pending password reset request.",
                    400
                );
            }

            const xForwardedFor = req.headers.get("x-forwarded-for");
            const ip = xForwardedFor
                ? xForwardedFor.split(",")[0].trim()
                : undefined;

            const agent = req.headers.get("user-agent") || undefined;

            const resetRequest =
                await ResetPasswordRequestModel.createRequest(
                    {
                        userId: user._id as Types.ObjectId,
                        employeeId: employee._id as Types.ObjectId,
                        description,
                        ip,
                        agent,
                    },
                    session
                );

            const doc = Array.isArray(resetRequest)
                ? resetRequest[0]
                : resetRequest;

            const notification = await GuideSystemNotificationModel.create(
                [{
                    type: GUIDE_SYSTEM_NOTIFICATION_TYPE.GUIDE_EMP_FORGOT_PASSWORD,
                    title: "Employee Password Reset Request",
                    message: `An employee associated with your guide account has requested a password reset. Email: ${email}`,
                    priority: GUIDE_SYSTEM_NOTIFICATION_PRIORITY.HIGH,
                    relatedModel: "ResetPasswordRequest",
                    relatedId: doc._id,
                    guide: employee.companyId,
                }],
                { session }
            );
            const notifDoc = Array.isArray(notification) ? notification[0] : notification;

            // Find the guide that owns this employee (via companyId) to get the owner's userId
            let ownerIdForSocket: string | undefined;
            if (employee.companyId) {
                const ownerGuide = await GuideModel.findById(employee.companyId)
                    .select("owner.user")
                    .session(session)
                    .lean();
                if (ownerGuide?.owner?.user) {
                    ownerIdForSocket = (ownerGuide.owner.user as Types.ObjectId).toString();
                }
            }

            triggerSocketEvent({
                ownerId: ownerIdForSocket,
                type: GUIDE_SYSTEM_NOTIFICATION_TYPE.GUIDE_EMP_FORGOT_PASSWORD as unknown as SocketTTriggerTypes,
                data: notifDoc,
            }).catch(console.error);

            return {
                message: "Your password reset request has been submitted.",
                requestId: (doc._id as Types.ObjectId).toString(),
                type: "employee",
            };
        }

        /* =====================================================
           BRANCH B — GUIDE FLOW (NEW)
        ===================================================== */

        if (user.role === USER_ROLE.GUIDE) {

            const guide = await GuideModel.findOne({ "owner.user": user._id })
                .select("_id")
                .session(session)
                .lean();

            if (!guide) {
                return {
                    message:
                        "If an account exists, your request has been submitted.",
                };
            }

            // Check existing pending request
            const existingGuideReq =
                await GuideForgotPasswordModel.findOne({
                    guideId: guide._id,
                    status: FORGOT_PASSWORD_STATUS.PENDING,
                }).session(session);

            if (existingGuideReq) {
                throw new ApiError(
                    "You already have a pending guide password reset request.",
                    400
                );
            }

            // Create guide forgot password request
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // valid for 24 hours

            const guideRequest =
                await GuideForgotPasswordModel.create(
                    [
                        {
                            guideId: guide._id,
                            reason: description || "Password reset requested by guide",
                            expiresAt,
                        },
                    ],
                    { session }
                );

            const doc = Array.isArray(guideRequest)
                ? guideRequest[0]
                : guideRequest;

            const notification = await SupportSystemNotificationModel.create(
                [{
                    type: SUPPORT_SYSTEM_NOTIFICATION_TYPE.GUIDE_FORGOT_PASSWORD,
                    title: "Guide Password Reset Request",
                    message: `You have requested a password reset for your guide account. Email: ${email}`,
                    priority: SUPPORT_SYSTEM_NOTIFICATION_PRIORITY.HIGH,
                    relatedModel: "GuideForgotPassword",
                    relatedId: doc._id,
                }],
                { session }
            );
            const notifDoc = Array.isArray(notification) ? notification[0] : notification;

            // Guide forgot password → notify the main admin (first user with role=admin)
            const adminUser = await UserModel.findOne({ role: USER_ROLE.ADMIN })
                .select("_id")
                .session(session)
                .lean();

            triggerSocketEvent({
                ownerId: adminUser ? (adminUser._id as Types.ObjectId).toString() : undefined,
                type: SUPPORT_SYSTEM_NOTIFICATION_TYPE.GUIDE_FORGOT_PASSWORD as unknown as SocketTTriggerTypes,
                data: notifDoc,
            }).catch(console.error);

            return {
                message: "Your guide password reset request has been submitted.",
                requestId: (doc._id as Types.ObjectId).toString(),
                type: "guide",
            };
        }

        // Fallback (should not happen)
        return {
            message:
                "If an account exists, your request has been submitted.",
        };
    });

    return {
        data: result,
        status: 201,
    };
});