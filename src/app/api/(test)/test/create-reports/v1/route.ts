// api/test/create-reports/v1/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { ReportModel } from "@/models/tours/report.model";
import { TestReportGenerator } from "@/lib/mock/test-report-generator";
import { Base64Asset, uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { withErrorHandler, ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";

// Static IDs for testing (replace with your actual IDs)
const STATIC_TRAVELER_ID = new Types.ObjectId("6982c7383afd45667a05b540");
const STATIC_TOUR_ID = new Types.ObjectId("697b9332224e38cd018b70e3");

// Define the response type
interface CreateReportsResponse {
    success: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reports: any[];
    stats: {
        total: number;
        active: number;
        withStaticUser: number;
        withStaticTour: number;
    };
}

// Handler function
async function createReportsHandler(request: NextRequest): Promise<HandlerResult<CreateReportsResponse>> {
    const body = await request.json();
    const { count = 1, clearExisting = false, useStaticIds = true, images = [] } = body;

    console.log(`[DEBUG] Creating ${count} reports, clearExisting: ${clearExisting}, useStaticIds: ${useStaticIds}`);

    // Validate input
    if (typeof count !== 'number' || count < 1 || count > 100) {
        throw new ApiError('Count must be between 1 and 100', 400);
    }

    // 1️⃣ Connect to DB
    await ConnectDB();

    // Run everything in a transaction
    const result = await withTransaction(async (session) => {
        let uploadedImageIds: Types.ObjectId[] = [];

        // 2️⃣ Optional: Clear existing test reports
        if (clearExisting) {
            console.log(`[DEBUG] Clearing existing reports with static IDs...`);
            const deleteResult = await ReportModel.deleteMany(
                {
                    $or: [
                        { reporter: STATIC_TRAVELER_ID },
                        { tour: STATIC_TOUR_ID }
                    ]
                },
                { session }
            );
            console.log(`[DEBUG] Cleared ${deleteResult.deletedCount} reports`);
        }

        // 3️⃣ Upload images using Cloudinary helper (within the same transaction)
        if (images.length > 0) {
            console.log(`[DEBUG] Uploading ${images.length} images...`);
            const base64Assets: Base64Asset[] = images.map((img: string) => ({
                base64: img,
                assetType: 'image'
            }));
            uploadedImageIds = await uploadAssets(base64Assets, session, 2);
            console.log(`[DEBUG] Uploaded ${uploadedImageIds.length} images`);
        }

        // 4️⃣ Generate test report data
        console.log(`[DEBUG] Generating test report data...`);
        const generatedReports = TestReportGenerator.generateMultiple(
            count,
            useStaticIds
                ? { reporter: STATIC_TRAVELER_ID, tour: STATIC_TOUR_ID }
                : {}
        );

        console.log(`[DEBUG] Generated ${generatedReports.length} reports`);

        // Log sample of generated data for debugging
        if (generatedReports.length > 0) {
            console.log(`[DEBUG] Sample report:`, {
                reporter: generatedReports[0].reporter.toString(),
                tour: generatedReports[0].tour.toString(),
                status: generatedReports[0].status,
                reason: generatedReports[0].reason,
                hasEvidenceLinks: generatedReports[0].evidenceLinks?.length || 0
            });
        }

        const testReportsData = generatedReports.map((report) => ({
            ...report,
            evidenceImages: uploadedImageIds,
            evidenceLinks: report.evidenceLinks || [],
            // Ensure required fields exist
            reopenedCount: 0,
            deletedAt: null
        }));

        // 5️⃣ Insert reports into DB
        console.log(`[DEBUG] Inserting reports into database...`);
        try {
            const createdReports = await ReportModel.insertMany(testReportsData, {
                session,
                ordered: false // Continue even if some fail
            });
            console.log(`[DEBUG] Successfully inserted ${createdReports.length} reports`);

            // 6️⃣ Get statistics
            const [total, active, withStaticUser, withStaticTour] = await Promise.all([
                ReportModel.countDocuments().session(session),
                ReportModel.countActive().session(session),
                ReportModel.countActive({ reporter: STATIC_TRAVELER_ID }).session(session),
                ReportModel.countActive({ tour: STATIC_TOUR_ID }).session(session),
            ]);

            console.log(`[DEBUG] Statistics: total=${total}, active=${active}, withStaticUser=${withStaticUser}, withStaticTour=${withStaticTour}`);

            return {
                success: true,
                message: `Created ${createdReports.length} test report(s)`,
                reports: createdReports,
                stats: {
                    total,
                    active,
                    withStaticUser,
                    withStaticTour,
                },
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(`[ERROR] Failed to insert reports:`, error.message);
            console.error(`[ERROR] Error details:`, error);

            // Check for specific MongoDB errors
            if (error.code === 11000) {
                console.error(`[ERROR] Duplicate key error. Unique constraint violation.`);
            }

            throw error;
        }
    });

    return {
        data: result,
        status: 201,
    };
}

// Export the wrapped handler
export const POST = withErrorHandler(createReportsHandler);