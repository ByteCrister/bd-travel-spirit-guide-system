"use client";

import { motion, Variants } from "framer-motion";
import { IEmployeeInfo } from "@/types/current-user.types";
import { PAYROLL_STATUS, PayrollStatus, SalaryPaymentMode } from "@/constants/employee/employee.const";
import {
    Calendar, Clock, CreditCard, FileText, Mail, Phone,
    User, Briefcase, AlertCircle, CheckCircle, XCircle,
    TrendingUp, History, ExternalLink, Banknote,
} from "lucide-react";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { format } from "date-fns";
import SupportEmployeeInfoSkeleton from "./skeletons/SupportEmployeeInfoSkeleton";
import { DocumentViewerDialog } from "@/components/shared/DocumentViewerDialog";
import { DocumentDTO } from "@/types/employee/employee.types";
import { useState } from "react";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const N = {
    surface: "#E7E5E4",
    primary: "#006666",
    text: "#1E2938",
    muted: "#6B7280",
    success: "#00A63D",
    warning: "#FE9900",
    danger: "#FF2157",
    info: "#0066CC",
    shadowOut: "6px 6px 12px #c4c2c1, -6px -6px 12px #ffffff",
    shadowOutSm: "3px 3px 6px #c4c2c1, -3px -3px 6px #ffffff",
    shadowIn: "inset 4px 4px 8px #c4c2c1, inset -4px -4px 8px #ffffff",
    shadowInSm: "inset 2px 2px 5px #c4c2c1, inset -2px -2px 5px #ffffff",
    fontMono: "'Space Mono', monospace",
    fontBody: "'JetBrains Mono', monospace",
};

// ─── Reusable Neumorphic Primitives ──────────────────────────────────────────
function NeuCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl p-5 ${className}`} style={{ background: N.surface, boxShadow: N.shadowOut }}>
            {children}
        </div>
    );
}

function NeuCardHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid #c4c2c1" }}>
            <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: N.surface, boxShadow: N.shadowIn }}
            >
                <Icon className="h-5 w-5" style={{ color: N.primary }} />
            </div>
            <h3 className="font-bold" style={{ color: N.text, fontFamily: N.fontMono, fontSize: 14 }}>
                {title}
            </h3>
        </div>
    );
}

function NeuRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: N.muted, fontFamily: N.fontMono }}>{label}</span>
            <div className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>{children}</div>
        </div>
    );
}

function NeuBadge({ children, color = N.muted, bg }: { children: React.ReactNode; color?: string; bg?: string }) {
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
                fontFamily: N.fontMono,
                color,
                background: bg ?? `${color}18`,
                border: `1px solid ${color}33`,
            }}
        >
            {children}
        </span>
    );
}

function NeuDivider() {
    return <div className="h-px my-4 rounded-full" style={{ background: "linear-gradient(to right, transparent, #c4c2c1, transparent)" }} />;
}

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface SupportEmployeeInfoProps {
    employeeInfo: IEmployeeInfo | null;
    isLoading?: boolean;
}

export default function SupportEmployeeInfo({ employeeInfo, isLoading }: SupportEmployeeInfoProps) {
    const [viewerDoc, setViewerDoc] = useState<DocumentDTO | null>(null);

    if (isLoading) return <SupportEmployeeInfoSkeleton />;

    if (!employeeInfo) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <NeuCard>
                    <div className="text-center py-16">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <div
                                className="h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                                style={{ background: N.surface, boxShadow: N.shadowIn }}
                            >
                                <AlertCircle className="h-10 w-10" style={{ color: N.muted }} />
                            </div>
                        </motion.div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: N.text, fontFamily: N.fontMono }}>
                            Employee Information Not Available
                        </h3>
                        <p className="text-sm" style={{ color: N.muted, fontFamily: N.fontBody }}>
                            Your employee details could not be loaded at this time.
                        </p>
                    </div>
                </NeuCard>
            </motion.div>
        );
    }

    // ─── Badge helpers ──────────────────────────────────────────────────────────
    const getPaymentStatusBadge = (status: PayrollStatus) => {
        switch (status) {
            case PAYROLL_STATUS.PAID:
                return <NeuBadge color={N.success}><CheckCircle className="h-3 w-3" /> Paid</NeuBadge>;
            case PAYROLL_STATUS.PENDING:
                return <NeuBadge color={N.warning}><Clock className="h-3 w-3" /> Pending</NeuBadge>;
            case PAYROLL_STATUS.FAILED:
                return <NeuBadge color={N.danger}><XCircle className="h-3 w-3" /> Failed</NeuBadge>;
            default:
                return <NeuBadge>{status}</NeuBadge>;
        }
    };

    const getPaymentModeBadge = (mode: SalaryPaymentMode) => (
        <NeuBadge color={mode === "auto" ? N.info : N.muted}>
            <Banknote className="h-3 w-3" />
            {mode === "auto" ? "Auto Payment" : "Manual Payment"}
        </NeuBadge>
    );

    const formatCurrency = (amount: number, currency: string) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-6"
            style={{ fontFamily: N.fontMono }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

                {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6 w-full">

                    {/* Personal Information */}
                    <motion.div variants={itemVariants}>
                        <NeuCard>
                            <NeuCardHeader icon={User} title="Personal Information" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>
                                        Employment Type
                                    </p>
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
                                        <Briefcase className="h-4 w-4" style={{ color: N.primary }} />
                                        <span className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>
                                            {employeeInfo.employmentType || "Not specified"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>Payment Mode</p>
                                    <div className="mt-1">{getPaymentModeBadge(employeeInfo.paymentMode)}</div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>Date of Joining</p>
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
                                        <Calendar className="h-4 w-4" style={{ color: N.primary }} />
                                        <span className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>
                                            {format(new Date(employeeInfo.dateOfJoining), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Salary Hero */}
                            <div className="px-5 py-4 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase mb-1.5 flex items-center gap-1.5" style={{ color: N.muted }}>
                                            <FaBangladeshiTakaSign className="h-3.5 w-3.5" /> Monthly Salary
                                        </p>
                                        <p className="text-3xl font-bold" style={{ color: N.primary, fontFamily: N.fontMono }}>
                                            {formatCurrency(employeeInfo.salary, employeeInfo.currency)}
                                        </p>
                                    </div>
                                    <div
                                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                                        style={{ background: N.surface, boxShadow: N.shadowOut }}
                                    >
                                        <FaBangladeshiTakaSign className="h-6 w-6" style={{ color: N.primary }} />
                                    </div>
                                </div>
                            </div>

                            {employeeInfo.dateOfLeaving && (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mt-4" style={{ background: N.surface, boxShadow: N.shadowInSm, borderLeft: `3px solid ${N.warning}` }}>
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: N.warning }} />
                                    <div>
                                        <span className="text-xs font-bold" style={{ color: N.warning }}>Employment Ended</span>
                                        <p className="text-xs mt-0.5" style={{ color: N.muted, fontFamily: N.fontBody }}>
                                            Left on {format(new Date(employeeInfo.dateOfLeaving), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {employeeInfo.notes && (
                                <>
                                    <NeuDivider />
                                    <p className="text-xs font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: N.muted }}>
                                        <FileText className="h-3.5 w-3.5" /> Notes
                                    </p>
                                    <p className="text-xs px-4 py-3 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowIn, color: N.text, fontFamily: N.fontBody }}>
                                        {employeeInfo.notes}
                                    </p>
                                </>
                            )}
                        </NeuCard>
                    </motion.div>

                    {/* Contact Information */}
                    {employeeInfo.contactInfo && (
                        <motion.div variants={itemVariants}>
                            <NeuCard>
                                <NeuCardHeader icon={Phone} title="Contact Information" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: N.muted }}>Primary Contact</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
                                                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: N.primary }} />
                                                <span className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>{employeeInfo.contactInfo.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
                                                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: N.primary }} />
                                                <span className="text-xs font-bold break-all" style={{ color: N.text, fontFamily: N.fontBody }}>{employeeInfo.contactInfo.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: N.muted }}>Emergency Contact</p>
                                        {employeeInfo.contactInfo.emergencyContact && (
                                            <div className="px-4 py-3 rounded-xl space-y-2" style={{ background: N.surface, boxShadow: N.shadowInSm, borderLeft: `3px solid ${N.danger}` }}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold" style={{ color: N.danger }}>
                                                        {employeeInfo.contactInfo.emergencyContact.name}
                                                    </span>
                                                    <NeuBadge color={N.danger}>{employeeInfo.contactInfo.emergencyContact.relation}</NeuBadge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5" style={{ color: N.danger }} />
                                                    <span className="text-xs font-bold" style={{ color: N.danger, fontFamily: N.fontBody }}>
                                                        {employeeInfo.contactInfo.emergencyContact.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </NeuCard>
                        </motion.div>
                    )}

                    {/* Documents */}
                    {employeeInfo.documents && employeeInfo.documents.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <NeuCard>
                                <NeuCardHeader icon={FileText} title="Documents" />
                                <div className="space-y-3">
                                    {employeeInfo.documents.map((doc, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.07 }}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 rounded-xl gap-3"
                                            style={{ background: N.surface, boxShadow: N.shadowInSm }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: N.surface, boxShadow: N.shadowOut }}>
                                                    <FileText className="h-5 w-5" style={{ color: N.primary }} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold" style={{ color: N.text }}>{doc.name || doc.type}</p>
                                                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: N.muted, fontFamily: N.fontBody }}>
                                                        <Calendar className="h-3 w-3" />
                                                        Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setViewerDoc(doc)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold"
                                                style={{ color: N.primary, fontFamily: N.fontMono }}
                                            >
                                                View <ExternalLink className="h-3.5 w-3.5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                                {viewerDoc && (
                                  <DocumentViewerDialog
                                    open={!!viewerDoc}
                                    onClose={() => setViewerDoc(null)}
                                    url={viewerDoc.url}
                                    filename={viewerDoc.name || viewerDoc.type}
                                    type={viewerDoc.type}
                                    uploadedAt={viewerDoc.uploadedAt}
                                  />
                                )}
                            </NeuCard>
                        </motion.div>
                    )}

                    {/* Metadata */}
                    <motion.div variants={itemVariants}>
                        <NeuCard>
                            <NeuCardHeader icon={Calendar} title="Metadata" />
                            <div className="space-y-2">
                                <NeuRow label="Created">
                                    {format(new Date(employeeInfo.createdAt), "MMM d, yyyy")}
                                </NeuRow>
                                <NeuRow label="Last Updated">
                                    {format(new Date(employeeInfo.updatedAt), "MMM d, yyyy")}
                                </NeuRow>
                                {employeeInfo.lastLogin && (
                                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm, borderLeft: `3px solid ${N.success}` }}>
                                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: N.success, fontFamily: N.fontMono }}>Last Login</span>
                                        <span className="text-xs font-bold" style={{ color: N.success, fontFamily: N.fontBody }}>
                                            {format(new Date(employeeInfo.lastLogin), "MMM d, yyyy HH:mm")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </NeuCard>
                    </motion.div>

                    {/* Salary History */}
                    {employeeInfo.salaryHistory && employeeInfo.salaryHistory.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <NeuCard>
                                <NeuCardHeader icon={History} title="Salary History" />
                                <div className="space-y-3">
                                    {employeeInfo.salaryHistory.map((history, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.07 }}
                                            className="px-4 py-3 rounded-xl"
                                            style={{ background: N.surface, boxShadow: N.shadowInSm }}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" style={{ color: N.primary }} />
                                                    <span className="text-sm font-bold" style={{ color: N.text, fontFamily: N.fontMono }}>
                                                        {formatCurrency(history.amount, history.currency)}
                                                    </span>
                                                </div>
                                                {index === 0 && <NeuBadge color={N.success}>Current</NeuBadge>}
                                            </div>
                                            <p className="text-xs" style={{ color: N.muted, fontFamily: N.fontBody }}>
                                                Effective from {format(new Date(history.effectiveFrom), "MMM d, yyyy")}
                                                {history.effectiveTo && <> to {format(new Date(history.effectiveTo), "MMM d, yyyy")}</>}
                                            </p>
                                            {history.reason && (
                                                <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: N.surface, boxShadow: N.shadowInSm, color: N.muted, fontFamily: N.fontBody }}>
                                                    {history.reason}
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </NeuCard>
                        </motion.div>
                    )}
                </div>

                {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
                <div className="space-y-6 w-full">

                    {/* Current Month Payment */}
                    {employeeInfo.currentMonthPayment && (
                        <motion.div variants={itemVariants}>
                            <NeuCard>
                                <NeuCardHeader icon={CreditCard} title="Current Month Payment" />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: N.muted }}>Status</span>
                                        {getPaymentStatusBadge(employeeInfo.currentMonthPayment.status)}
                                    </div>

                                    <div className="px-4 py-4 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                                        <span className="text-xs font-bold tracking-widest uppercase block mb-1" style={{ color: N.primary }}>Amount</span>
                                        <span className="text-xl font-bold" style={{ color: N.primary, fontFamily: N.fontMono }}>
                                            {formatCurrency(employeeInfo.currentMonthPayment.amount, employeeInfo.currentMonthPayment.currency)}
                                        </span>
                                    </div>

                                    {employeeInfo.currentMonthPayment.dueDate && (
                                        <NeuRow label="Due Date">
                                            {format(new Date(employeeInfo.currentMonthPayment.dueDate), "MMM d, yyyy")}
                                        </NeuRow>
                                    )}

                                    {employeeInfo.currentMonthPayment.paidAt && (
                                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm, borderLeft: `3px solid ${N.success}` }}>
                                            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: N.success }}>Paid Date</span>
                                            <span className="text-xs font-bold" style={{ color: N.success, fontFamily: N.fontBody }}>
                                                {format(new Date(employeeInfo.currentMonthPayment.paidAt), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    )}

                                    {employeeInfo.currentMonthPayment.transactionRef && (
                                        <div>
                                            <p className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: N.muted }}>Transaction Ref</p>
                                            <p className="text-xs px-3 py-2 rounded-xl break-all" style={{ background: N.surface, boxShadow: N.shadowInSm, color: N.text, fontFamily: N.fontBody }}>
                                                {employeeInfo.currentMonthPayment.transactionRef}
                                            </p>
                                        </div>
                                    )}

                                    {employeeInfo.currentMonthPayment.failureReason && (
                                        <div className="px-4 py-3 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm, borderLeft: `3px solid ${N.danger}` }}>
                                            <p className="text-xs font-bold mb-1" style={{ color: N.danger }}>Failure Reason</p>
                                            <p className="text-xs" style={{ color: N.danger, fontFamily: N.fontBody }}>{employeeInfo.currentMonthPayment.failureReason}</p>
                                        </div>
                                    )}
                                </div>
                            </NeuCard>
                        </motion.div>
                    )}

                    {/* Shift Information */}
                    {employeeInfo.shifts && employeeInfo.shifts.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <NeuCard>
                                <NeuCardHeader icon={Clock} title="Shift Schedule" />
                                <div className="space-y-3">
                                    {employeeInfo.shifts.map((shift, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="px-4 py-3 rounded-xl"
                                            style={{ background: N.surface, boxShadow: N.shadowIn }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontMono }}>
                                                    {shift.startTime} – {shift.endTime}
                                                </span>
                                                <NeuBadge color={N.primary}>{shift.days.length} days</NeuBadge>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {shift.days.map((day) => (
                                                    <span
                                                        key={day}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                                        style={{
                                                            background: N.surface,
                                                            boxShadow: N.shadowOutSm,
                                                            color: N.primary,
                                                            fontFamily: N.fontMono,
                                                        }}
                                                    >
                                                        {day}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </NeuCard>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}