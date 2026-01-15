// utils/test-report-generator.ts
import { Types } from "mongoose";
import { REPORT_REASON, REPORT_PRIORITY, REPORT_STATUS } from "@/constants/report.const";

export interface TestReportData {
    reporter?: Types.ObjectId;
    tour?: Types.ObjectId;
    reason?: string;
    message?: string;
    status?: string;
    priority?: string;
    evidenceLinks?: string[];
    tags?: string[];
}

export class TestReportGenerator {
    static generate(data: TestReportData = {}) {
        const reasons = Object.values(REPORT_REASON);
        const priorities = Object.values(REPORT_PRIORITY);
        const statuses = REPORT_STATUS.IN_REVIEW;

        const fakeMessages = [
            "The tour guide was not professional and arrived 30 minutes late.",
            "The accommodation did not match the description in the booking.",
            "Safety concerns: equipment appeared to be poorly maintained.",
            "The itinerary was changed without prior notice.",
            "Overcrowded vehicle with insufficient seating.",
            "Unsanitary food handling observed during meals.",
            "Hidden costs not disclosed during booking.",
            "Tour operator was unresponsive to emergency situations.",
            "Misleading information about physical difficulty level.",
            "Poor customer service and refusal to provide refunds."
        ];

        const fakeLinks = [
            "https://example.com/evidence1.jpg",
            "https://drive.google.com/file/d/xyz123",
            "https://imgur.com/a/abc123",
            "https://example.com/screenshot.png"
        ];

        const tags = ["urgent", "quality", "safety", "refund", "complaint"];

        return {
            reporter: data.reporter || new Types.ObjectId(),
            tour: data.tour || new Types.ObjectId(),
            reason: data.reason || reasons[Math.floor(Math.random() * reasons.length)],
            message: data.message || fakeMessages[Math.floor(Math.random() * fakeMessages.length)],
            status: data.status || statuses[Math.floor(Math.random() * statuses.length)],
            priority: data.priority || priorities[Math.floor(Math.random() * priorities.length)],
            evidenceLinks: data.evidenceLinks || [
                fakeLinks[Math.floor(Math.random() * fakeLinks.length)],
                fakeLinks[Math.floor(Math.random() * fakeLinks.length)]
            ],
            tags: data.tags || tags.slice(0, Math.floor(Math.random() * 3) + 1),
        };
    }

    static generateMultiple(count: number, baseData?: TestReportData) {
        const reports = [];
        for (let i = 0; i < count; i++) {
            reports.push(this.generate(baseData));
        }
        return reports;
    }
}