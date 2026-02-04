import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import ConnectDB from "@/config/db";
import AuditModel, { ICreateAuditParams } from "@/models/audit.model";
import { AUDIT_ACTION } from "@/constants/audit-action.const";

// POST /api/test-audits
export const POST = async (req: NextRequest) => {
    await ConnectDB();

    const body = await req.json();
    const { userId, count = 10 } = body;

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const audits: ICreateAuditParams[] = [];

    for (let i = 0; i < count; i++) {
        const action = faker.helpers.arrayElement([
            AUDIT_ACTION.CREATE,
            AUDIT_ACTION.READ,
            AUDIT_ACTION.UPDATE,
            AUDIT_ACTION.DELETE,
        ]);

        const targetModel = faker.helpers.arrayElement([
            "User",
            "Tour",
            "Review",
            "Booking",
            "Payment",
        ]);

        const targetId = new mongoose.Types.ObjectId();

        const audit: ICreateAuditParams = {
            targetModel,
            target: targetId,
            actor: userId,
            actorModel: "User",
            action,
            note: faker.lorem.sentence(),
            ip: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),
            before: faker.datatype.boolean()
                ? { field: faker.lorem.word(), value: faker.lorem.words() }
                : undefined,
            after: faker.datatype.boolean()
                ? { field: faker.lorem.word(), value: faker.lorem.words() }
                : undefined,
        };

        audits.push(audit);
    }

    // Save all audits
    const createdAudits = await Promise.all(audits.map(a => AuditModel.createAudit(a)));

    return NextResponse.json({
        message: `${createdAudits.length} audits created successfully`,
        audits: createdAudits.map(a => ({
            _id: a._id,
            action: a.action,
            targetModel: a.targetModel,
            note: a.note,
            ip: a.ip,
            userAgent: a.userAgent,
            createdAt: a.createdAt,
        })),
    });
};
