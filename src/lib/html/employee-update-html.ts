// src/lib/html/employee-update-html.ts
import { escapeHtml } from "../helpers/escape-html";

export interface EmployeeUpdateChange {
    field: string;
    before: string;
    after: string;
}

export interface EmployeeUpdateEmailData {
    name: string;
    email: string;
    changes: EmployeeUpdateChange[];
    updatedAt?: Date;
}

/**
 * Generates a branded HTML email body for employee profile update notifications.
 * Shows a diff of only the fields that actually changed.
 */
export function generateEmployeeUpdateEmail(
    data: EmployeeUpdateEmailData,
    companyName: string = "BD Travel Spirit"
): string {
    const { name, changes, updatedAt = new Date() } = data;

    const formattedDate = updatedAt.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const formattedTime = updatedAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const changesHTML = changes
        .map(
            (change) => `
        <tr>
            <td class="field-cell">${escapeHtml(change.field)}</td>
            <td class="before-cell">
                <span class="value-pill before-pill">${escapeHtml(change.before || "—")}</span>
            </td>
            <td class="arrow-cell">→</td>
            <td class="after-cell">
                <span class="value-pill after-pill">${escapeHtml(change.after || "—")}</span>
            </td>
        </tr>`
        )
        .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Profile Updated – ${companyName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }

        .email-container {
            max-width: 620px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.10);
        }

        /* ── Logo ── */
        .logo-container {
            display: flex;
            align-items: center;
            padding: 22px 30px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-bottom: 1px solid #e2e8f0;
        }

        .logo-icon {
            width: 46px;
            height: 46px;
            background: linear-gradient(135deg, #006666 0%, #008080 55%, #00b3b3 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0, 102, 102, 0.28);
            margin-right: 14px;
            flex-shrink: 0;
        }

        .logo-main {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
        }

        .logo-subtitle {
            font-size: 11px;
            color: #006666;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
            margin-top: 2px;
        }

        .logo-underline {
            height: 3px;
            width: 90px;
            background: linear-gradient(90deg, #006666 0%, #00b3b3 100%);
            margin-top: 5px;
            border-radius: 2px;
        }

        /* ── Header Banner ── */
        .header {
            background: linear-gradient(135deg, #006644 0%, #003d3d 100%);
            color: white;
            padding: 36px 30px;
            text-align: center;
        }

        .header-icon {
            font-size: 40px;
            margin-bottom: 12px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }

        .header p {
            opacity: 0.88;
            font-size: 15px;
        }

        /* ── Content ── */
        .content {
            padding: 36px 30px;
        }

        .greeting {
            font-size: 17px;
            color: #1e293b;
            margin-bottom: 6px;
            font-weight: 500;
        }

        .greeting strong {
            color: #006644;
        }

        .intro-text {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 28px;
            line-height: 1.7;
        }

        /* ── Timestamp badge ── */
        .timestamp-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 999px;
            padding: 6px 16px;
            font-size: 13px;
            color: #15803d;
            font-weight: 500;
            margin-bottom: 24px;
        }

        /* ── Changes Table ── */
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .changes-table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .changes-table thead tr {
            background: #006644;
            color: white;
        }

        .changes-table thead th {
            padding: 12px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .changes-table tbody tr {
            border-bottom: 1px solid #f1f5f9;
        }

        .changes-table tbody tr:last-child {
            border-bottom: none;
        }

        .changes-table tbody tr:nth-child(even) {
            background: #fafafa;
        }

        .field-cell {
            padding: 13px 16px;
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            white-space: nowrap;
        }

        .before-cell,
        .after-cell {
            padding: 13px 10px;
            font-size: 13px;
            color: #4b5563;
        }

        .arrow-cell {
            padding: 13px 4px;
            color: #9ca3af;
            font-size: 16px;
            text-align: center;
            white-space: nowrap;
        }

        .value-pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
            word-break: break-word;
        }

        .before-pill {
            background: #fee2e2;
            color: #991b1b;
        }

        .after-pill {
            background: #dcfce7;
            color: #166534;
        }

        /* ── Notice box ── */
        .notice-box {
            margin-top: 28px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 16px 20px;
            font-size: 13px;
            color: #78350f;
            line-height: 1.6;
        }

        .notice-box strong {
            display: block;
            margin-bottom: 4px;
            color: #92400e;
            font-size: 14px;
        }

        /* ── Footer ── */
        .footer {
            background: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.8;
        }

        .footer a {
            color: #006644;
            text-decoration: none;
            font-weight: 500;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
            .email-container {
                border-radius: 0;
                margin: 0;
            }

            .header, .content {
                padding: 24px 18px;
            }

            .changes-table thead {
                display: none;
            }

            .changes-table tbody tr {
                display: block;
                margin-bottom: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }

            .field-cell,
            .before-cell,
            .after-cell,
            .arrow-cell {
                display: block;
                padding: 8px 14px;
                text-align: left;
            }

            .arrow-cell {
                display: none;
            }

            .field-cell {
                background: #f1f5f9;
                border-bottom: 1px solid #e5e7eb;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">

        <!-- Logo -->
        <div class="logo-container">
            <div class="logo-icon">BD</div>
            <div>
                <div class="logo-main">${companyName}</div>
                <div class="logo-subtitle">Professional Guides</div>
                <div class="logo-underline"></div>
            </div>
        </div>

        <!-- Header -->
        <div class="header">
            <div class="header-icon">&#9999;&#65039;</div>
            <h1>Employee Profile Updated</h1>
            <p>Your profile information has been changed by an administrator</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="greeting">Hello, <strong>${escapeHtml(name)}</strong></p>
            <p class="intro-text">
                We're letting you know that your employee profile on the
                <strong>${companyName}</strong> platform was recently updated.
                Below is a summary of what changed. If you did not expect these changes,
                please contact your HR manager immediately.
            </p>

            <div class="timestamp-badge">
                &#128336; Updated on ${formattedDate} at ${formattedTime}
            </div>

            <div class="section-title">
                &#128203; Changes Summary
            </div>

            <table class="changes-table">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Previous Value</th>
                        <th></th>
                        <th>New Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${changesHTML}
                </tbody>
            </table>

            <div class="notice-box">
                <strong>&#9888;&#65039; Did not expect this?</strong>
                If you believe this update was made in error or without your knowledge,
                please reach out to your HR department or system administrator right away.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is an automated notification from the <strong>${companyName}</strong> HR System.</p>
            <p>Please do not reply to this email.</p>
            <p style="margin-top:8px;">&#169; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>

    </div>
</body>
</html>
`;
}

/**
 * Ready-to-use wrapper for nodemailer
 */
export function EmployeeUpdateEmail(
    data: EmployeeUpdateEmailData,
    companyName?: string
): { subject: string; html: string } {
    return {
        subject: `Your Employee Profile Has Been Updated – ${companyName ?? "BD Travel Spirit"}`,
        html: generateEmployeeUpdateEmail(data, companyName),
    };
}
