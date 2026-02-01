// app/api/auth/user/v1/password/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { USER_ROLE } from "@/constants/user.const";
import UserModel from "@/models/user.model";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

// Request body type for password update
interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// Response type for password update (empty success response)
interface UpdatePasswordResponse {
    success: boolean;
    message: string;
}

// Helper function to validate password strength
function validatePasswordStrength(password: string): void {
    const passwordRegex = /^(?=.{6,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;

    if (!passwordRegex.test(password)) {
        throw new ApiError(
            "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
            400
        );
    }
}

// Main handler function
async function handler(request: NextRequest): Promise<HandlerResult<UpdatePasswordResponse>> {
    // 1. Get current user ID
    const currentUserId = await getUserIdFromSession();

    if (!currentUserId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Validate user has required role
    await VERIFY_USER_ROLE.MULTIPLE(currentUserId, [USER_ROLE.GUIDE, USER_ROLE.ASSISTANT]);

    // 3. Parse and validate request body
    let body: UpdatePasswordRequest;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid request body", 400);
    }

    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || typeof currentPassword !== "string") {
        throw new ApiError("Current password is required", 400);
    }

    if (!newPassword || typeof newPassword !== "string") {
        throw new ApiError("New password is required", 400);
    }

    if (currentPassword === newPassword) {
        throw new ApiError("New password must be different from current password", 400);
    }

    validatePasswordStrength(newPassword);

    // 4. Use transaction for atomic update
    await withTransaction(async (session) => {
        const user = await UserModel.findById(currentUserId)
            .select("+password")
            .session(session);

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        // Verify current password (USE THE DOCUMENT)
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            throw new ApiError("Current password is incorrect", 401);
        }

        // Set & save → triggers pre("save") bcrypt hook
        user.password = newPassword;
        user.markModified("password"); // extra safety
        await user.save({ session });
    });


    return {
        data: {
            success: true,
            message: "Password updated successfully"
        },
        status: 200,
    };
}

// Export the wrapped handler
export const PATCH = withErrorHandler(handler);