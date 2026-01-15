// app/api/test/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { ReportModel } from "@/models/tours/report.model";
import { TestReportGenerator } from "@/lib/mock/test-report-generator";

// Static IDs for testing (replace with your actual IDs)
const STATIC_USER_ID = new Types.ObjectId("67a1b2c3d4e5f67890123456");
const STATIC_TOUR_ID = new Types.ObjectId("67a1b2c3d4e5f67890123457");

export async function POST(request: NextRequest) {
    try {

        const body = await request.json();
        const { count = 1, clearExisting = false, useStaticIds = true } = body;

        // Connect to database
        await ConnectDB();

        // Optional: Clear existing test reports
        if (clearExisting) {
            await ReportModel.deleteMany({
                $or: [
                    { reporter: STATIC_USER_ID },
                    { tour: STATIC_TOUR_ID }
                ]
            });
        }

        // Generate test reports
        const testReportsData = TestReportGenerator.generateMultiple(
            count,
            useStaticIds
                ? {
                    reporter: STATIC_USER_ID,
                    tour: STATIC_TOUR_ID,
                }
                : {}
        );

        // Insert reports
        const createdReports = await ReportModel.insertMany(testReportsData, {
            ordered: false,
        });

        return NextResponse.json(
            {
                success: true,
                message: `Created ${createdReports.length} test report(s)`,
                reports: createdReports,
                stats: {
                    total: await ReportModel.countDocuments(),
                    active: await ReportModel.countActive(),
                    withStaticUser: await ReportModel.countActive({ reporter: STATIC_USER_ID }),
                    withStaticTour: await ReportModel.countActive({ tour: STATIC_TOUR_ID }),
                }
            },
            { status: 201 }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Test report creation failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}