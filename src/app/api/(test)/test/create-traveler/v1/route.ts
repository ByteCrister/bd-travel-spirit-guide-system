// app/api/test/create-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose, { HydratedDocument, Types } from "mongoose";

import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { TravelerModel } from "@/models/travelers/traveler.model";

import { ACCOUNT_STATUS, USER_ROLE, UserRole } from "@/constants/user.const";
import { Division, District } from "@/constants/tour.const";
import { ASSET_TYPE } from "@/constants/asset.const";

import { uploadAssets, Base64Asset } from "@/lib/cloudinary/upload.cloudinary";

/* -------------------------------------------------------------------------- */
/*                                  Typings                                   */
/* -------------------------------------------------------------------------- */

interface AddressData {
    house?: string;
    road?: string;
    area?: string;
    village?: string;
    ward?: string;
    union?: string;
    upazila?: string;
    district: District;
    division: Division;
    postOffice?: string;
    postalCode?: string;
}

interface CreateUserRequest {
    user: {
        name: string;
        email: string;
        password: string;
        avatar?: string; // base64 data URL
        role: UserRole;
    };
    traveler?: {
        name?: string;
        phone?: string;
        address?: AddressData;
        dateOfBirth?: string;
        location?: {
            type: "Point";
            coordinates: [number, number];
        };
    };
}

interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}

interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
}

type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/* -------------------------------------------------------------------------- */
/*                              Response Helpers                              */
/* -------------------------------------------------------------------------- */

const errorResponse = (
    status: number,
    message: string,
    error?: string
): NextResponse<ApiErrorResponse> =>
    NextResponse.json(
        { success: false, message, ...(error && { error }) },
        { status }
    );

const successResponse = <T,>(
    status: number,
    message: string,
    data: T
): NextResponse<ApiSuccessResponse<T>> =>
    NextResponse.json(
        { success: true, message, data },
        { status }
    );

/* -------------------------------------------------------------------------- */
/*                                   Handler                                  */
/* -------------------------------------------------------------------------- */

export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse>> {
    let session: mongoose.ClientSession | null = null;

    try {
        const body: CreateUserRequest = await request.json();
        const { user: userData, traveler: travelerData } = body;

        if (!userData?.name || !userData?.email || !userData?.password) {
            return errorResponse(
                400,
                "Missing required fields: name, email, password"
            );
        }

        await ConnectDB();

        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
            return errorResponse(409, "User with this email already exists");
        }

        session = await mongoose.startSession();
        session.startTransaction();

        /* ----------------------------- Upload Avatar ----------------------------- */

        let avatarAssetId: Types.ObjectId | undefined;

        if (userData.avatar) {
            if (!userData.avatar.startsWith("data:image/")) {
                throw new Error("Invalid avatar format");
            }

            const [assetId] = await uploadAssets(
                [
                    {
                        base64: userData.avatar,
                        name: `${userData.name}-avatar`,
                        assetType: ASSET_TYPE.IMAGE,
                    } satisfies Base64Asset,
                ],
                session
            );

            avatarAssetId = assetId;
        }

        /* ------------------------------ Create User ------------------------------ */

        const user = new UserModel({
            name: userData.name,
            email: userData.email,
            password: userData.password, // bcrypt via pre("save")
            role: userData.role || USER_ROLE.TRAVELER,
            ...(avatarAssetId && { avatar: avatarAssetId }),
        });

        const savedUser = await user.save({ session });

        /* ---------------------------- Create Traveler ---------------------------- */

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let savedTraveler: HydratedDocument<any> | null = null;

        if (savedUser.role === USER_ROLE.TRAVELER) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const travelerPayload: Record<string, any> = {
                user: savedUser._id,
                name: travelerData?.name || userData.name,
                isVerified: false,
                accountStatus: ACCOUNT_STATUS.ACTIVE,
                loginAttempts: 0,
            };

            if (travelerData?.phone)
                travelerPayload.phone = travelerData.phone;

            if (travelerData?.address)
                travelerPayload.address = travelerData.address;

            if (travelerData?.dateOfBirth)
                travelerPayload.dateOfBirth = new Date(
                    travelerData.dateOfBirth
                );

            if (travelerData?.location)
                travelerPayload.location = travelerData.location;

            const traveler = new TravelerModel(travelerPayload);
            savedTraveler = await traveler.save({ session });
        }

        await session.commitTransaction();

        /* ------------------------------ API Response ----------------------------- */

        return successResponse(
            201,
            savedTraveler
                ? "User and Traveler created successfully"
                : "User created successfully",
            {
                user: {
                    _id: (savedUser._id as Types.ObjectId).toString(),
                    name: savedUser.name,
                    email: savedUser.email,
                    role: savedUser.role,
                    avatar: savedUser.avatar ?? null,
                    createdAt: savedUser.createdAt,
                },
                traveler: savedTraveler
                    ? {
                        _id: savedTraveler._id.toString(),
                        name: savedTraveler.name,
                        phone: savedTraveler.phone,
                        accountStatus: savedTraveler.accountStatus,
                        isVerified: savedTraveler.isVerified,
                    }
                    : null,
            }
        );
    } catch (err: unknown) {
        if (session) await session.abortTransaction();

        console.error("Create user error:", err);

        if (err instanceof Error) {
            return errorResponse(500, "Failed to create user", err.message);
        }

        return errorResponse(
            500,
            "Failed to create user",
            "Unknown error"
        );
    } finally {
        if (session) await session.endSession();
    }
}