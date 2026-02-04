import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

import ConnectDB from "@/config/db";
import { TRAVEL_TYPE, TravelType } from "@/constants/tour.const";
import { ASSET_TYPE } from "@/constants/asset.const";

import { ReviewModel } from "@/models/tours/review.model";
import { uploadAssets, Base64Asset } from "@/lib/cloudinary/upload.cloudinary";
import { TravelerModel } from "@/models/travelers/traveler.model";

const tourId = "697b9332224e38cd018b70e3";
const travelerId = "6982c9d33afd45667a05b56a"; // Traveler _id

export async function POST(request: NextRequest) {
    let session: mongoose.ClientSession | null = null;

    try {
        /* ------------------------- Dev-only safety check ------------------------- */
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This test endpoint is only available in development mode",
                },
                { status: 403 }
            );
        }

        /* --------------------------- ObjectId validation -------------------------- */
        if (!mongoose.Types.ObjectId.isValid(tourId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid tourId format",
                },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(travelerId)) {
            return NextResponse.json(
                { success: false, message: "Invalid travelerId format" },
                { status: 400 }
            );
        }

        await ConnectDB();

        session = await mongoose.startSession();
        session.startTransaction();

        /* -------------------------- Get User from Traveler ------------------------ */
        const traveler = await TravelerModel.findById(travelerId)
            .select("user")
            .session(session);

        if (!traveler) {
            throw new Error("Traveler not found");
        }

        const userObjectId = traveler.user;

        /* ----------------------------- Parse request ----------------------------- */
        // Optional body:
        // { images?: string[] }
        let images: string[] = [];
        try {
            const body = await request.json();
            if (Array.isArray(body?.images)) {
                images = body.images;
            }
        } catch {
            // body is optional for this test endpoint
        }

        /* ----------------------------- Upload images ----------------------------- */
        let imageAssetIds: mongoose.Types.ObjectId[] = [];

        if (images.length > 0) {
            const assets: Base64Asset[] = images.map((img, index) => {
                if (!img.startsWith("data:image/")) {
                    throw new Error(`Invalid image format at index ${index}`);
                }

                return {
                    base64: img,
                    name: `review-${tourId}-${index + 1}`,
                    assetType: ASSET_TYPE.IMAGE,
                };
            });

            imageAssetIds = await uploadAssets(assets, session);
        }

        /* ---------------------------- Create review ----------------------------- */
        const travelTypes = Object.values(TRAVEL_TYPE) as TravelType[];

        const review = new ReviewModel({
            tour: new mongoose.Types.ObjectId(tourId),
            user: new mongoose.Types.ObjectId(userObjectId),
            rating: faker.number.int({ min: 1, max: 5 }),
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            comment: faker.lorem.paragraphs({ min: 1, max: 3 }),
            images: imageAssetIds, // uploaded Asset IDs
            tripType: faker.helpers.arrayElement(travelTypes),
            travelDate: faker.date.past({ years: 1 }),
            isApproved: false,
            helpfulCount: 0,
            helpfulVotes: [],
            replies: [],
            approvedAt: new Date(),
        });

        await review.save({ session });

        await session.commitTransaction();

        /* ------------------------------ Response ------------------------------ */
        return NextResponse.json({
            success: true,
            message: "Test review created successfully",
            data: {
                review: {
                    id: review._id,
                    tourId: review.tour,
                    userId: review.user,
                    rating: review.rating,
                    title: review.title,
                    comment: review.comment,
                    images: review.images,
                    tripType: review.tripType,
                    travelDate: review.travelDate,
                    isApproved: review.isApproved,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                },
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (session) await session.abortTransaction();

        console.error("Error creating test review:", error);

        if (error?.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A review already exists for this user and tour.",
                },
                { status: 409 }
            );
        }

        if (error?.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err: any) => err.message
            );
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create test review",
                error: error?.message,
            },
            { status: 500 }
        );
    } finally {
        if (session) await session.endSession();
    }
}