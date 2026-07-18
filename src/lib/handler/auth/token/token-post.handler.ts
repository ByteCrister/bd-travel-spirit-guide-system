// api/auth/token/v1

import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import {
    EMAIL_VERIFICATION_PURPOSE,
    EMAIL_VERIFICATION_PURPOSE_VALUES,
    EmailVerificationPurpose,
} from '@/constants/common/email-verification-purpose.const';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { EmailVerificationToken } from '@/models/email-verification-token.model';
import ApplicationTokenHtml from '@/lib/html/application-token-html';
import { EmployeeVerificationHtml } from '@/lib/html/employee-verification-html';
import ConnectDB from '@/config/db';
import GuideModel from '@/models/guide/guide.model';
import { GUIDE_STATUS } from '@/constants/guide/guide.const';
import UserModel from '@/models/user.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { mailer } from '@/config/node-mailer';

const DISALLOWED_ROLES: USER_ROLE[] = [
    USER_ROLE.TRAVELER,
    USER_ROLE.SUPPORT,
    USER_ROLE.ASSISTANT,
    USER_ROLE.ADMIN,
];

const ROLE_FRIENDLY_MESSAGE: Partial<Record<USER_ROLE, string>> = {
    [USER_ROLE.TRAVELER]: "A Traveler account already exists for this email.",
    [USER_ROLE.SUPPORT]: "This email belongs to a Support account.",
    [USER_ROLE.ASSISTANT]: "This email belongs to an Assistant account.",
    [USER_ROLE.ADMIN]: "This email belongs to an Admin account.",
};

type MailConfig = {
    subject: string;
    html: (token: string, email: string) => string;
};

const MAIL_CONFIG: Record<EmailVerificationPurpose, MailConfig> = {
    [EMAIL_VERIFICATION_PURPOSE.GUIDE_APPLICATION]: {
        subject: "Guide Application Email Verification",
        html: (token, email) => ApplicationTokenHtml(token, email),
    },

    [EMAIL_VERIFICATION_PURPOSE.EMPLOYEE_VERIFICATION]: {
        subject: "Employee Email Verification",
        html: (token, email) => EmployeeVerificationHtml(token, email),
    },

    [EMAIL_VERIFICATION_PURPOSE.PASSWORD_RESET]: {
        subject: "Reset Your Password",
        html: (token, email) => `
            <h2>Password Reset Request</h2>
            <p>Hello ${email},</p>
            <p>Your password reset token is:</p>
            <h3>${token}</h3>
            <p>If you did not request this, please ignore this email.</p>
        `,
    },

    [EMAIL_VERIFICATION_PURPOSE.EMAIL_CHANGE]: {
        subject: "Email Change Verification",
        html: (token, email) => `
            <h2>Email Change Verification</h2>
            <p>Hello ${email},</p>
            <p>Please verify your email change using this token:</p>
            <h3>${token}</h3>
        `,
    },
};

/**
 * Token generation logic wrapped in transaction
 */
async function generateEmailVerificationToken(
    email: string,
    purpose: EmailVerificationPurpose,
    session?: mongoose.ClientSession
): Promise<string> {
    // Check for existing valid token
    const existingToken = await EmailVerificationToken.findOne({
        email,
        purpose,
        usedAt: null,
        expiresAt: { $gt: new Date() },
    }).session(session || null);

    if (existingToken) {
        throw new ApiError(
            'A verification token has already been sent recently. Please check your email or try again later.',
            429
        );
    }

    // Generate new token
    const plainToken = await EmailVerificationToken.generateToken(
        email,
        purpose,
        session
    );

    return plainToken;
}

/**
 * Main handler function for token generation
 */
export default async function GuideAppTokenPostHandler(
    req: NextRequest
) {
    const body = (await req.json()) as { email: string; purpose: EmailVerificationPurpose };
    const email = body.email?.toLowerCase().trim();

    // Read purpose from the request body (not hardcoded)
    const purpose = body.purpose?.toLowerCase().trim() as EmailVerificationPurpose;

    /* =======================
       Basic Validation
    ======================= */
    if (!email) {
        throw new ApiError('Email is required', 400);
    }

    if (!purpose || !Object.values(EMAIL_VERIFICATION_PURPOSE_VALUES).includes(purpose as EMAIL_VERIFICATION_PURPOSE)) {
        throw new ApiError('Invalid or missing verification purpose', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError('Invalid email format', 400);
    }

    /* =======================
       Generate Token (in transaction)
    ======================= */
    let plainToken: string = '';

    await ConnectDB();

    // Use withTransaction helper
    plainToken = await withTransaction(
        async (session) => {

            const user = await UserModel.findOne({ email })
                .select("+password")
                .session(session);

            if (user && DISALLOWED_ROLES.includes(user.role as USER_ROLE)) {
                throw new ApiError(
                    ROLE_FRIENDLY_MESSAGE[user.role] ?? "Account exists with this email.",
                    409
                );
            }

            // Only run guide-specific checks for guide_application purpose
            if (user && purpose === EMAIL_VERIFICATION_PURPOSE.GUIDE_APPLICATION) {
                const existingGuide = await GuideModel.findOne({
                    "owner.user": user._id,
                })
                    .select("+accessToken")
                    .session(session);

                if (existingGuide?.status === GUIDE_STATUS.PENDING) {
                    throw new ApiError("Guide application already pending", 409);
                }

                if (existingGuide?.status === GUIDE_STATUS.APPROVED) {
                    throw new ApiError("User is already an approved guide", 409);
                }
            }

            return await generateEmailVerificationToken(email, purpose, session);
        }
    );

    /* =======================
       Send Email (outside transaction)
    ======================= */
    if (!plainToken) {
        throw new ApiError('Failed to generate verification token', 500);
    }

    const mailConfig = MAIL_CONFIG[purpose];

    if (!mailConfig) {
        throw new ApiError('Invalid email verification purpose', 400);
    }

    await mailer(email, mailConfig.subject, mailConfig.html(plainToken, email));

    return {
        data: {
            success: true,
            message: 'Verification token sent successfully',
        },
        status: 200,
    };
}