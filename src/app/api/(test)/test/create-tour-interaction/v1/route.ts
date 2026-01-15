// app/api/test/create-tour-interaction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import ConnectDB from '@/config/db';
import { UserTourInteractionModel } from '@/models/travelers/traveler-tour-interaction.model';

// Define static test IDs
// You can replace these with actual IDs from your database
const STATIC_USER_ID = '6789abcd1234ef5678901234'; // Replace with a real User _id
const STATIC_TOUR_ID = '6789abcd1234ef5678901235'; // Replace with a real Tour _id

// Interface for request body
interface CreateTourInteractionRequest {
    user?: string; // Optional - will use static if not provided
    bookingHistory?: string[];
    cart?: string[];
    wishlist?: string[];
    hiddenTours?: string[];
}

// Response interfaces
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
        // Parse request body
        const body: CreateTourInteractionRequest = await request.json();

        // Connect to database
        await ConnectDB();

        // Use provided user ID or static one
        const userId = body.user || STATIC_USER_ID;
        const tourId = STATIC_TOUR_ID;

        // Validate user ID format
        if (!Types.ObjectId.isValid(userId)) {
            return createErrorResponse(400, 'Invalid user ID format');
        }

        // Check if interaction already exists for this user
        const existingInteraction = await UserTourInteractionModel.findOne({ user: userId });
        if (existingInteraction) {
            return createErrorResponse(409, 'Tour interaction already exists for this user');
        }

        // Start transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Convert string IDs to ObjectId
        const userObjectId = new Types.ObjectId(userId);
        const tourObjectId = new Types.ObjectId(tourId);

        // Prepare interaction data
        const interactionData = {
            user: userObjectId,
            bookingHistory: body.bookingHistory?.map(id => new Types.ObjectId(id)) || [tourObjectId],
            cart: body.cart?.map(id => new Types.ObjectId(id)) || [tourObjectId],
            wishlist: body.wishlist?.map(id => new Types.ObjectId(id)) || [tourObjectId],
            hiddenTours: body.hiddenTours?.map(id => new Types.ObjectId(id)) || [tourObjectId],
        };

        // Create the interaction document
        const interaction = new UserTourInteractionModel(interactionData);
        const savedInteraction = await interaction.save({ session });

        // Commit transaction
        await session.commitTransaction();

        // Prepare response
        const responseData = {
            _id: (savedInteraction._id as Types.ObjectId).toString(),
            user: savedInteraction.user.toString(),
            bookingHistory: savedInteraction.bookingHistory.map(id => id.toString()),
            cart: savedInteraction.cart.map(id => id.toString()),
            wishlist: savedInteraction.wishlist.map(id => id.toString()),
            hiddenTours: savedInteraction.hiddenTours.map(id => id.toString()),
        };

        return createSuccessResponse(
            201,
            'Tour interaction created successfully',
            responseData
        );

    } catch (error: unknown) {
        // Rollback transaction if it exists
        if (session) {
            await session.abortTransaction();
        }

        console.error('Error creating tour interaction:', error);

        // Handle specific error types

        if (error instanceof Error && 'code' in error && error.code === 11000) {
            return createErrorResponse(409, 'Duplicate key error (user already has an interaction)', error.message);
        }

        if (error instanceof Error) {
            return createErrorResponse(500, 'Failed to create tour interaction', error.message);
        }

        return createErrorResponse(500, 'Failed to create tour interaction', 'An unknown error occurred');
    } finally {
        // End session if it exists
        if (session) {
            await session.endSession();
        }
    }
}