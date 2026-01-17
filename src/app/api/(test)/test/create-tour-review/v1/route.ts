import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { TRAVEL_TYPE, TravelType } from '@/constants/tour.const';
import { ReviewModel } from '@/models/tours/review.model';
import ConnectDB from '@/config/db';

const tourId: string = "695e8f262529c71561f19a06";
const userId: string = "69688f3b92b7be1cc4819170"; // traveler id

export async function POST() {
    try {
        // Safety check - only allow in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'This test endpoint is only available in development mode'
                },
                { status: 403 }
            );
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(tourId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid tourId format. Must be a valid MongoDB ObjectId.'
                },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid userId format. Must be a valid MongoDB ObjectId.'
                },
                { status: 400 }
            );
        }

        await ConnectDB();

        // Get travel types from your constants
        const travelTypes = Object.values(TRAVEL_TYPE) as TravelType[];

        // Generate a single fake review
        const fakeReviewData = {
            tour: new mongoose.Types.ObjectId(tourId),
            user: new mongoose.Types.ObjectId(userId),
            rating: faker.number.int({ min: 1, max: 5 }), // Use provided rating or random
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            comment: faker.lorem.paragraphs({ min: 1, max: 3 }),
            images: [], // Empty array or you can add fake image IDs
            tripType: faker.helpers.arrayElement(travelTypes),
            travelDate: faker.date.past({ years: 1 }),
            isApproved: false, // Default false
            helpfulCount: 0, // Start with 0 helpful votes
            helpfulVotes: [],
            replies: [],
            approvedAt: new Date(), // Set approved timestamp
        };

        // Create the review
        const review = new ReviewModel(fakeReviewData);
        await review.save();

        // Return the created review
        return NextResponse.json({
            success: true,
            message: 'Test review created successfully',
            data: {
                review: {
                    id: review._id,
                    tourId: review.tour,
                    userId: review.user,
                    rating: review.rating,
                    title: review.title,
                    comment: review.comment,
                    tripType: review.tripType,
                    travelDate: review.travelDate,
                    isApproved: review.isApproved,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                },
                tourId: tourId,
                userId: userId,
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error creating test review:', error);

        // Handle duplicate key error (tour + user unique constraint)
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'A review already exists for this user and tour.',
                    error: 'Duplicate review error'
                },
                { status: 409 }
            );
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors
                },
                { status: 400 }
            );
        }

        // Generic error
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create test review',
                error: error.message
            },
            { status: 500 }
        );
    }
}