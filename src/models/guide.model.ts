// guide.model.ts
// Production-grade Guide schema with subscription history and current subscription snapshot.

import { Schema, Document, Types, model, models, Query } from "mongoose";
import {
    GUIDE_DOCUMENT_CATEGORY,
    GUIDE_DOCUMENT_TYPE,
    GUIDE_SOCIAL_PLATFORM,
    GUIDE_STATUS,
    GuideDocumentCategory,
    GuideDocumentType,
    GuideSocialPlatform,
    GuideStatus,
    SUBSCRIPTION_STATUS,
    SubscriptionStatus,
} from "@/constants/guide.const";

// -------------------------
// Interfaces
// -------------------------


export interface IGuideDocument {
    category: GuideDocumentCategory;
    fileType: GuideDocumentType;
    fileName?: string;
    fileUrl: string;
    uploadedAt?: Date;
}

export interface ISubscriptionHistoryEntry {
    _id?: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    amount: number; // smallest currency unit (e.g., paisa or cents)
    currency: string; // ISO currency code
    status: SubscriptionStatus;
    paymentProvider?: string; // e.g., "stripe", "bkash"
    paymentId?: string; // provider invoice/charge id
    method?: string; // "card", "bkash", "manual"
    autoRenew: boolean;
    failureCount?: number;
    cancelledAt?: Date;
    refunded?: boolean;
    notes?: string;
    createdAt?: Date;
}

export interface ICurrentSubscription {
    status: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    autoRenew?: boolean;
    lastPaymentId?: string;
    amount?: number;
    currency?: string;
}

export interface IGuide extends Document {
    companyName: string;
    bio?: string;
    social?: {
        platform: GuideSocialPlatform;
        url: string;
    }[];

    owner: {
        name: string;
        email: string;
        password?: string;
        phone?: string;
        oauthProvider?: string;
    };

    documents: IGuideDocument[];

    status: GuideStatus;
    appliedAt?: Date;
    reviewedAt?: Date;
    reviewer?: Types.ObjectId;

    suspension?: {
        reason: string;
        suspendedBy: Types.ObjectId;
        until: Date;
        createdAt: Date;
    };

    deletedAt?: Date;

    // Subscription
    subscriptionHistory?: ISubscriptionHistoryEntry[];
    currentSubscription?: ICurrentSubscription;

    // Virtuals
    isSuspended?: boolean;
    isActive?: boolean;
    hasActiveSubscription?: boolean;

    // Instance methods
    addSubscriptionRecord(entry: ISubscriptionHistoryEntry): Promise<IGuide>;
    markSubscriptionFailed(paymentId: string, note?: string): Promise<IGuide>;
}

// -------------------------
// Schema
// -------------------------

const GuideSchema = new Schema<IGuide>(
    {
        companyName: { type: String, required: true, trim: true },
        bio: { type: String, trim: true },

        social: [
            {
                platform: {
                    type: String,
                    enum: Object.values(GUIDE_SOCIAL_PLATFORM),
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                    trim: true,
                    validate: {
                        validator: (v: string) => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v),
                        message: (props: import("mongoose").ValidatorProps) => `${props.value} is not a valid URL!`,
                    },
                },
            },
        ],

        owner: {
            name: { type: String, required: true, trim: true },
            email: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                lowercase: true,
            },
            password: {
                type: String,
                required: function (this: IGuide) {
                    return !this.owner?.["oauthProvider"];
                },
            },
            phone: {
                type: String,
                trim: true,
                validate: {
                    validator: function (v: string) {
                        return /^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/.test(v);
                    },
                    message: (props: import("mongoose").ValidatorProps) =>
                        `${props.value} is not a valid Bangladeshi phone number!`,
                },
            },
            oauthProvider: { type: String },
        },

        documents: [
            {
                category: {
                    type: String,
                    enum: Object.values(GUIDE_DOCUMENT_CATEGORY),
                    required: true,
                },
                fileType: {
                    type: String,
                    enum: Object.values(GUIDE_DOCUMENT_TYPE),
                    required: true,
                },
                fileName: { type: String, trim: true },
                fileUrl: { type: Schema.Types.ObjectId, ref: "Document" },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        status: {
            type: String,
            enum: Object.values(GUIDE_STATUS),
            default: GUIDE_STATUS.PENDING,
        },
        appliedAt: Date,
        reviewedAt: Date,
        reviewer: { type: Schema.Types.ObjectId, ref: "User" },

        suspension: {
            reason: String,
            suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
            until: Date,
            createdAt: { type: Date, default: Date.now },
        },

        deletedAt: Date,

        // -------------------------
        // Subscription fields
        // -------------------------
        subscriptionHistory: [
            {
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
                amount: { type: Number, required: true },
                currency: { type: String, required: true, default: "BDT" },
                status: {
                    type: String,
                    enum: Object.values(SUBSCRIPTION_STATUS),
                    required: true,
                },
                paymentProvider: { type: String },
                paymentId: { type: String, index: true },
                method: { type: String },
                autoRenew: { type: Boolean, default: true },
                failureCount: { type: Number, default: 0 },
                cancelledAt: { type: Date },
                refunded: { type: Boolean, default: false },
                notes: { type: String, trim: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],

        currentSubscription: {
            status: {
                type: String,
                enum: Object.values(SUBSCRIPTION_STATUS),
                default: SUBSCRIPTION_STATUS.EXPIRED,
            },
            currentPeriodStart: Date,
            currentPeriodEnd: Date,
            autoRenew: { type: Boolean, default: false },
            lastPaymentId: { type: String },
            amount: { type: Number },
            currency: { type: String, default: "BDT" },
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                if (ret.owner) {
                    delete ret.owner.password;
                }
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

// -------------------------
// Virtuals
// -------------------------

GuideSchema.virtual("isSuspended").get(function (this: IGuide) {
    return !!(this.suspension?.until && this.suspension.until > new Date());
});

GuideSchema.virtual("isActive").get(function (this: IGuide) {
    return !this.deletedAt && this.status === GUIDE_STATUS.APPROVED;
});

GuideSchema.virtual("hasActiveSubscription").get(function (this: IGuide) {
    const cs = this.currentSubscription;
    return !!(cs && cs.status === "active" && cs.currentPeriodEnd && cs.currentPeriodEnd > new Date());
});

// -------------------------
// Middleware
// -------------------------

GuideSchema.pre("save", function (next) {
    if (this.owner?.phone) {
        this.owner.phone = this.owner.phone.replace(/^0/, "+880");
    }
    next();
});

GuideSchema.pre<Query<IGuide, IGuide>>(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

// -------------------------
// Instance methods
// -------------------------

// Implementation: addSubscriptionRecord
GuideSchema.methods.addSubscriptionRecord = async function (
    this: IGuide & Document,
    entry: ISubscriptionHistoryEntry
): Promise<IGuide> {
    // ensure array
    if (!this.subscriptionHistory) {
        this.subscriptionHistory = [];
    }

    // create normalized entry with guaranteed _id and createdAt
    const normalized: ISubscriptionHistoryEntry & { _id: Types.ObjectId } = {
        ...entry,
        _id: entry._id ? entry._id : new Types.ObjectId(),
        createdAt: entry.createdAt ? entry.createdAt : new Date(),
    };

    // push typed entry
    this.subscriptionHistory.push(normalized);

    // update currentSubscription snapshot with strict typing
    this.currentSubscription = {
        status: entry.status,
        currentPeriodStart: entry.startDate,
        currentPeriodEnd: entry.endDate,
        autoRenew: entry.autoRenew ?? false,
        lastPaymentId: entry.paymentId,
        amount: entry.amount,
        currency: entry.currency,
    };

    // save and return typed document
    return (await this.save()) as IGuide;
};

// Implementation: markSubscriptionFailed
GuideSchema.methods.markSubscriptionFailed = async function (
    this: IGuide & Document,
    paymentId: string,
    note?: string
): Promise<IGuide> {
    const history = (this.subscriptionHistory ?? []).slice().reverse() as (ISubscriptionHistoryEntry & { _id?: Types.ObjectId })[];

    // find matching entry by paymentId or fallback to most recent
    const target = history.find((h) => h.paymentId === paymentId) || history[0];

    if (!target) {
        // create a failure audit entry
        const now = new Date();
        const failureEntry: ISubscriptionHistoryEntry & { _id: Types.ObjectId } = {
            _id: new Types.ObjectId(),
            startDate: now,
            endDate: now,
            amount: 0,
            currency: this.currentSubscription?.currency ?? "BDT",
            status: "failed",
            paymentProvider: undefined,
            paymentId,
            method: undefined,
            autoRenew: false,
            failureCount: 1,
            cancelledAt: undefined,
            refunded: false,
            notes: note,
            createdAt: now,
        };

        return this.addSubscriptionRecord(failureEntry);
    }

    // find the actual index in the original array to mutate (since history was reversed copy)
    const origIndex = (this.subscriptionHistory ?? []).findIndex(
        (h) => (h._id && target._id && h._id.equals && h._id.equals(target._id)) || h.paymentId === target.paymentId
    );

    // fallback: if not found by _id, fall back to index 0 (most recent) if exists
    const indexToUpdate = origIndex >= 0 ? origIndex : (this.subscriptionHistory ? this.subscriptionHistory.length - 1 : -1);

    if (indexToUpdate >= 0 && this.subscriptionHistory) {
        // mutate with typed access
        const existing = this.subscriptionHistory[indexToUpdate] as ISubscriptionHistoryEntry;

        existing.failureCount = (existing.failureCount ?? 0) + 1;
        existing.status = "failed";
        existing.notes = [existing.notes, note].filter(Boolean).join(" | ");

        // update snapshot if this history item corresponds to current subscription
        const current = this.currentSubscription;
        const matchesCurrent =
            (current?.lastPaymentId && current.lastPaymentId === paymentId) ||
            (current?.currentPeriodEnd && existing.endDate && current.currentPeriodEnd && existing.endDate.getTime() === current.currentPeriodEnd.getTime());

        if (matchesCurrent && this.currentSubscription) {
            this.currentSubscription.status = "past_due";
            this.currentSubscription.lastPaymentId = paymentId;
        }

        return (await this.save()) as IGuide;
    }

    // fallback: create failure entry if mutation couldn't be applied
    const now = new Date();
    const failureEntry: ISubscriptionHistoryEntry & { _id: Types.ObjectId } = {
        _id: new Types.ObjectId(),
        startDate: now,
        endDate: now,
        amount: 0,
        currency: this.currentSubscription?.currency ?? "BDT",
        status: "failed",
        paymentProvider: undefined,
        paymentId,
        method: undefined,
        autoRenew: false,
        failureCount: 1,
        cancelledAt: undefined,
        refunded: false,
        notes: note,
        createdAt: now,
    };

    return this.addSubscriptionRecord(failureEntry);
};

// -------------------------
// Indexes
// -------------------------

GuideSchema.index({
    companyName: "text",
    bio: "text",
    "social.url": "text",
});

GuideSchema.index({ status: 1, deletedAt: 1 });
GuideSchema.index({ createdAt: -1 });

GuideSchema.index({ "currentSubscription.status": 1 });
GuideSchema.index({ "subscriptionHistory.paymentId": 1 });
GuideSchema.index({ "subscriptionHistory.createdAt": -1 });

// -------------------------
// Model export
// -------------------------

export const GuideModel = models.Guide || model<IGuide>("Guide", GuideSchema);
export default GuideModel;
