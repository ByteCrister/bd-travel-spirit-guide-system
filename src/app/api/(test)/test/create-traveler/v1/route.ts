// app/api/test/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import UserModel from '@/models/user.model';
import mongoose, { HydratedDocument } from 'mongoose';
import { ACCOUNT_STATUS, USER_ROLE, UserRole } from '@/constants/user.const';
import { Division, District } from '@/constants/tour.const';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import { Types } from 'mongoose';

// Define proper TypeScript interfaces
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
        role?: UserRole;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper function for error responses
const createErrorResponse = (status: number, message: string, error?: string): NextResponse<ApiErrorResponse> => {
    return NextResponse.json(
        {
            success: false,
            message,
            ...(error && { error })
        },
        { status }
    );
};

// Helper function for success responses
const createSuccessResponse = <T>(status: number, message: string, data: T): NextResponse<ApiSuccessResponse<T>> => {
    return NextResponse.json(
        {
            success: true,
            message,
            data
        },
        { status }
    );
};

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {

    let session: mongoose.ClientSession | null = null;

    try {
        // Parse and validate request body
        const body: CreateUserRequest = await request.json();

        const { user: userData, traveler: travelerData } = body;

        // Validate required fields
        if (!userData?.email || !userData?.password || !userData?.name) {
            return createErrorResponse(400, 'Missing required fields: name, email, password');
        }

        // Connect to database
        await ConnectDB();

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
            return createErrorResponse(409, 'User with this email already exists');
        }

        // Start transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Create User
        const user = new UserModel({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role || USER_ROLE.TRAVELER,
        });

        const savedUser = await user.save({ session });

        // Create Traveler if user role is TRAVELER
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let savedTraveler: HydratedDocument<any> | null = null;

        if (savedUser.role === USER_ROLE.TRAVELER) {
            // Prepare traveler data with proper typing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const travelerPayload: Record<string, any> = {
                user: savedUser._id,
                name: travelerData?.name || userData.name,
                isVerified: false,
                accountStatus: ACCOUNT_STATUS.ACTIVE,
                loginAttempts: 0,
            };

            // Add optional fields if provided
            if (travelerData?.phone) travelerPayload.phone = travelerData.phone;
            if (travelerData?.address) travelerPayload.address = travelerData.address;
            if (travelerData?.dateOfBirth) travelerPayload.dateOfBirth = new Date(travelerData.dateOfBirth);
            if (travelerData?.location) travelerPayload.location = travelerData.location;

            const traveler = new TravelerModel(travelerPayload);
            savedTraveler = await traveler.save({ session });
        }

        // Commit transaction
        await session.commitTransaction();

        // Prepare response data with proper typing
        const responseData = {
            user: {
                _id: (savedUser._id as Types.ObjectId).toString(),
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                createdAt: savedUser.createdAt,
            },
            traveler: savedTraveler ? {
                _id: savedTraveler._id.toString(),
                name: savedTraveler.name,
                phone: savedTraveler.phone,
                accountStatus: savedTraveler.accountStatus,
                isVerified: savedTraveler.isVerified,
            } : null
        };

        return createSuccessResponse(
            201,
            savedTraveler ? 'User and Traveler created successfully' : 'User created successfully',
            responseData
        );

    } catch (error: unknown) {
        // Rollback transaction if it exists
        if (session) {
            await session.abortTransaction();
        }

        console.error('Error creating user:', error);

        if (error instanceof Error && 'code' in error && error.code === 11000) {
            return createErrorResponse(409, 'Duplicate key error', error.message);
        }

        if (error instanceof Error) {
            return createErrorResponse(500, 'Failed to create user', error.message);
        }

        return createErrorResponse(500, 'Failed to create user', 'An unknown error occurred');
    } finally {
        // End session if it exists
        if (session) {
            await session.endSession();
        }
    }
}