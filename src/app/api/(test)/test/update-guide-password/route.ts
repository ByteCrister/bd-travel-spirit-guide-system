import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

type ResetPasswordBody = {
    userId: string;
    newPassword: string;
};

const resetPasswordHandler = async (req: NextRequest) => {
    const body = (await req.json()) as ResetPasswordBody;

    const { userId, newPassword } = body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new ApiError("Invalid user ID", 400);
    }

    if (!newPassword) {
        throw new ApiError("New password is required", 400);
    }

    await ConnectDB();

    // IMPORTANT: select password so validation + hashing work
    const user = await UserModel.findById(userId).select("+password");

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // Set new password (regex + minlength validated by schema)
    user.password = newPassword;
    user.markModified("password");

    await user.save(); // triggers pre("save") bcrypt hashing

    return {
        status: 200,
        data: {
            message: "Password updated successfully",
            user: user.safeToJSON(),
        },
    };
};

export const PATCH = withErrorHandler(resetPasswordHandler);