// app/api/auth/user/v1/validate/route.ts
import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { compare } from "bcryptjs";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { USER_ROLE } from "@/constants/current-user/user.const";
import GuideModel from "@/models/guide/guide.model";
import EmployeeModel from "@/models/employees/employees.model";
import { GUIDE_STATUS } from "@/constants/guide/guide.const";

/**
 * Validate users email and password before logged in with next auth
 */
export const POST = withErrorHandler(async (req: NextRequest) => {

    const { email, password } = await req.json();

    if (!email || !password) {
        throw new ApiError("Email and password required.", 400);
    }

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    // ---- Rate limit by IP ----
    const ipAllowed = await authRateLimit({
        identifier: `ip:${ip}`,
        limit: 10,
        window: 60,
    });

    if (!ipAllowed) {
        throw new ApiError("Too many attempts. Try again in a minute.", 429);
    }

    // ---- RATE LIMIT BY EMAIL ----
    const emailAllowed = await authRateLimit({
        identifier: `ip:${ip}:email:${email}`,
        limit: 5, // 5 attempts / 1 minute
        window: 60,
    });

    if (!emailAllowed) {
        throw new ApiError("Too many attempts on this account. Try again soon.", 429);
    }

    await ConnectDB();

    // This is Guide dashboard so only "Guide" and "Assistance" only allowed
    const user = await UserModel.findOne({ email, role: { $in: [USER_ROLE.GUIDE, USER_ROLE.ASSISTANT] } }).select("+password");

    if (!user) {
        throw new ApiError("No account found with this email address or insufficient role", 401);
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
        throw new ApiError("Invalid password.", 401);
    }

    if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ "owner.user": user._id });
        if (!guide || guide.status !== GUIDE_STATUS.APPROVED) {
            throw new ApiError("Guide account is not approved yet.", 403);
        }
    } else if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: user._id });
        if (!employee || employee.deletedAt) {
            throw new ApiError("Employee account is disabled or deleted.", 403);
        }
    }

    return {
        data: {
            id: (user._id as Types.ObjectId).toString(),
            email: user.email,
            role: user.role,
        }, status: 200
    };
})