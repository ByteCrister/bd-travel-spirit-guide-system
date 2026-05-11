// app/api/admin/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type {
    GuideOverview,
    UpdateGuideOverviewRequest,
    UpdateGuideOverviewResponse,
    GuideDocument,
} from "@/types/overview.types";
import {
    GUIDE_STATUS,
    SUBSCRIPTION_STATUS,
    GUIDE_SOCIAL_PLATFORM,
    GUIDE_DOCUMENT_CATEGORY,
    GUIDE_DOCUMENT_TYPE,
    type GuideSocialPlatform,
} from "@/constants/guide/guide.const";

let _mockOverview: GuideOverview | null = null;

function seedMockOverview(): GuideOverview {
    const now = new Date();
    const oneMonth = new Date(now);
    oneMonth.setMonth(now.getMonth() + 1);

    const owner = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: `+8801${faker.string.numeric(9)}`,
        oauthProvider: null,
    };

    const social: { platform: GuideSocialPlatform; url: string }[] = [
        {
            platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK,
            url: `https://facebook.com/${faker.internet.username()}`,
        },
        {
            platform: GUIDE_SOCIAL_PLATFORM.INSTAGRAM,
            url: `https://instagram.com/${faker.internet.username()}`,
        },
    ];

    const documents: GuideDocument[] = [
        {
            id: faker.string.uuid(),
            category: GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO,
            fileType: GUIDE_DOCUMENT_TYPE.IMAGE,
            fileName: `${faker.person.firstName()}-profile.jpg`,
            fileUrl: `https://cdn.example.com/${faker.string.uuid()}.jpg`,
            uploadedAt: new Date().toISOString(),
        },
    ];

    const subscriptionHistory = [
        {
            id: faker.string.uuid(),
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            endDate: now.toISOString(),
            amount: 50000,
            currency: "BDT",
            status: SUBSCRIPTION_STATUS.ACTIVE,
            paymentProvider: "stripe",
            paymentId: faker.string.uuid(),
            method: "card",
            autoRenew: true,
            failureCount: 0,
            cancelledAt: null,
            refunded: false,
            notes: "initial",
            createdAt: now.toISOString(),
        },
    ];

    const currentSubscription = {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: oneMonth.toISOString(),
        autoRenew: true,
        lastPaymentId: subscriptionHistory[0].paymentId,
        amount: 50000,
        currency: "BDT",
    };

    const aggregates = {
        totalAvgRating: Number(
            faker.number.float({ min: 3, max: 5, fractionDigits: 1 }).toFixed(1)
        ),
        totalEmployees: faker.number.int({ min: 1, max: 50 }),
        totalReports: faker.number.int({ min: 0, max: 20 }),
        totalReviews: faker.number.int({ min: 0, max: 200 }),
        totalFaqs: faker.number.int({ min: 0, max: 50 }),
    };

    return {
        companyId: faker.string.uuid(),
        companyName: faker.company.name(),
        bio: faker.lorem.sentence(),
        social,
        owner,
        documents,
        subscriptionHistory,
        currentSubscription,
        status: GUIDE_STATUS.APPROVED,
        isSuspended: false,
        isActive: true,
        hasActiveSubscription: true,
        aggregates,
    };
}

if (!_mockOverview) {
    _mockOverview = seedMockOverview();
}

export async function GET() {
    return NextResponse.json({ ok: true, data: _mockOverview });
}

export async function PATCH(req: NextRequest) {
    const body = (await req.json()) as UpdateGuideOverviewRequest;

    if (!_mockOverview) {
        return NextResponse.json(
            { ok: false, errors: ["No overview available"] },
            { status: 500 }
        );
    }

    const updated: GuideOverview = { ..._mockOverview };

    if (typeof body.companyName === "string") {
        updated.companyName = body.companyName;
    }

    if ("bio" in body) {
        updated.bio = body.bio ?? null;
    }

    if (Array.isArray(body.social)) {
        const cleanSocial = body.social
            .filter(
                (s): s is { platform: GuideSocialPlatform; url: string } =>
                    !!s && typeof s.platform === "string" && typeof s.url === "string"
            )
            .map((s) => ({
                platform: s.platform,
                url: s.url,
            }));

        updated.social = cleanSocial.length ? cleanSocial : updated.social;
    }

    if (body.owner) {
        if (typeof body.owner.name === "string")
            updated.owner = { ...updated.owner, name: body.owner.name };
        if ("phone" in body.owner)
            updated.owner = { ...updated.owner, phone: body.owner.phone ?? null };
    }

    if (Array.isArray(body.documents)) {
        const incoming = body.documents as Partial<GuideDocument>[];

        const nextDocs = updated.documents.map((d) => {
            const patch = incoming.find((p) => p.id && p.id === d.id);
            return patch ? { ...d, ...patch } : d;
        });

        const newDocs = incoming
            .filter((p) => !p.id)
            .map((p) => ({
                id: faker.string.uuid(),
                category:
                    p.category ??
                    (updated.documents[0]?.category ??
                        GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO),
                fileType: p.fileType ?? GUIDE_DOCUMENT_TYPE.IMAGE,
                fileName: p.fileName ?? "new-file.dat",
                fileUrl:
                    p.fileUrl ?? `https://cdn.example.com/${faker.string.uuid()}.dat`,
                uploadedAt: new Date().toISOString(),
            }));

        updated.documents = [...nextDocs, ...newDocs];
    }

    if (body.currentSubscription) {
        updated.currentSubscription = {
            status:
                body.currentSubscription.status ??
                updated.currentSubscription?.status ??
                SUBSCRIPTION_STATUS.EXPIRED,
            currentPeriodStart:
                body.currentSubscription.currentPeriodStart ??
                updated.currentSubscription?.currentPeriodStart ??
                null,
            currentPeriodEnd:
                body.currentSubscription.currentPeriodEnd ??
                updated.currentSubscription?.currentPeriodEnd ??
                null,
            autoRenew:
                body.currentSubscription.autoRenew ??
                updated.currentSubscription?.autoRenew ??
                false,
            lastPaymentId:
                body.currentSubscription.lastPaymentId ??
                updated.currentSubscription?.lastPaymentId ??
                null,
            amount:
                body.currentSubscription.amount ??
                updated.currentSubscription?.amount ??
                null,
            currency:
                body.currentSubscription.currency ??
                updated.currentSubscription?.currency ??
                null,
        };
    }

    if (body.status) {
        updated.status = body.status;
        updated.isActive =
            updated.status === GUIDE_STATUS.APPROVED && !updated.isSuspended;
    }

    _mockOverview = updated;

    const response: UpdateGuideOverviewResponse = { ok: true, data: updated };
    return NextResponse.json(response);
}
