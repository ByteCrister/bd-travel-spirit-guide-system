"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  AlertCircle,
} from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";
import DenyDialog from "./DenyDialog";
import UpdatePasswordDialog from "./UpdatePasswordDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { REQUEST_STATUS } from "@/constants/employee/reset-password-request.const";

/* ─── Neumorphic style tokens ────────────────────────────────────────────── */
const N = {
  surface: "bg-[#E7E5E4] dark:bg-[#2A2A2A]",
  text: "text-[#1E2938] dark:text-white",
  textMuted: "text-[#1E2938]/70 dark:text-white/60",
  raisedLg:
    " dark:",
  raisedMd:
    " dark:",
  raisedSm:
    " dark:",
  raisedXs:
    " dark:",
  pressedMd:
    "[box-shadow:inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff] dark:[box-shadow:inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#3a3a3a]",
  pressedSm:
    "[box-shadow:inset_2px_2px_4px_#cac8c7,inset_-2px_-2px_4px_#ffffff] dark:[box-shadow:inset_2px_2px_4px_#1a1a1a,inset_-2px_-2px_4px_#3a3a3a]",
  font: "font-['Space_Mono']",
} as const;

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function NeumorphicCard({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        rounded-2xl border-0 p-4
        ${N.surface} ${N.raisedMd}
        transition-shadow duration-200 ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NeumorphicCard className={`flex items-start gap-4 ${className}`}>
      <div
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
          ${N.surface} ${N.pressedSm}
        `}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold uppercase tracking-wider ${N.textMuted}`}>
          {label}
        </p>
        <div className={`mt-1 text-sm font-medium break-words ${N.text}`}>{children}</div>
      </div>
    </NeumorphicCard>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-1.5 w-6 rounded-full bg-[#006666]" />
      <h3 className={`text-xs font-bold uppercase tracking-widest ${N.textMuted}`}>
        {children}
      </h3>
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface RequestDetailsDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  requestId: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function RequestDetailsDrawer({
  open,
  onOpenChange,
  requestId,
}: RequestDetailsDrawerProps) {
  const { fetchById, denyRequest, updatePassword, entities, isFetchingById, error } =
    useResetRequestsStore();

  const [denyOpen, setDenyOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  useEffect(() => {
    if (open) fetchById(requestId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requestId]);

  const dto = entities[requestId]?.attributes;

  /* ── Status config ── */
  const statusConfig = (() => {
    if (!dto) return null;
    switch (dto.status) {
      case REQUEST_STATUS.PENDING:
        return {
          badge: (
            <Badge className="gap-1.5 border-0 bg-[#FE9900]/15 text-[#FE9900] dark:bg-[#FE9900]/25">
              <Clock className="h-3.5 w-3.5" /> Pending Review
            </Badge>
          ),
        };
      case REQUEST_STATUS.DENIED:
        return {
          badge: (
            <Badge className="gap-1.5 border-0 bg-[#FF2157]/15 text-[#FF2157] dark:bg-[#FF2157]/25">
              <XCircle className="h-3.5 w-3.5" /> Denied
            </Badge>
          ),
        };
      default:
        return {
          badge: (
            <Badge className="gap-1.5 border-0 bg-[#00A63D]/15 text-[#00A63D] dark:bg-[#00A63D]/25">
              <CheckCircle2 className="h-3.5 w-3.5" /> Fulfilled
            </Badge>
          ),
        };
    }
  })();

  /* ── Dialog content class ── */
  const dialogContentClass = `
    ${N.font} max-h-[90vh] overflow-y-auto border-0 p-6 sm:p-8
    ${N.surface} sm:max-w-2xl
    ${N.raisedLg}
  `;

  /* ── Loading ── */
  if (isFetchingById && !dto) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={dialogContentClass}>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-[#006666]" />
              <div className="absolute inset-0 blur-2xl bg-[#006666]/20 animate-pulse rounded-full" />
            </div>
            <p className={`text-sm font-medium ${N.textMuted}`}>Loading request details…</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ── Error ── */
  if (error && !dto) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={dialogContentClass}>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className={`
                h-16 w-16 rounded-2xl flex items-center justify-center
                bg-[#FF2157]/10 dark:bg-[#FF2157]/20
              `}
            >
              <AlertCircle className="h-8 w-8 text-[#FF2157]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className={`text-lg font-semibold ${N.text}`}>Failed to fetch request</h3>
              <p className={`text-sm ${N.textMuted}`}>{error.message}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!dto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClass}>
        {/* ── Header ── */}
        <DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <DialogTitle className={`text-2xl font-bold tracking-tight ${N.text}`}>
                Request Details
              </DialogTitle>
              <p className={`text-sm ${N.textMuted}`}>
                Review and manage this password reset request
              </p>
            </div>
            {statusConfig?.badge}
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-6 space-y-8 pb-2"
        >
          {/* Requester Information */}
          <section className="space-y-4">
            <SectionTitle>Requester Information</SectionTitle>
            <div className="grid gap-3">
              <InfoCard
                icon={<Mail className="h-5 w-5 text-[#006666]" />}
                label="Email Address"
              >
                <span className="truncate block">{dto.requesterEmail}</span>
              </InfoCard>
              <InfoCard
                icon={<User className="h-5 w-5 text-[#006666]" />}
                label="Full Name"
              >
                {dto.requesterName || (
                  <span className={`italic ${N.textMuted}`}>Not provided</span>
                )}
              </InfoCard>
              <InfoCard
                icon={<Phone className="h-5 w-5 text-[#006666]" />}
                label="Mobile Number"
              >
                {dto.requesterMobile || (
                  <span className={`italic ${N.textMuted}`}>Not provided</span>
                )}
              </InfoCard>
            </div>
          </section>

          {/* Divider */}
          <Separator className="border-0 h-px bg-transparent  dark:" />

          {/* Request Details */}
          <section className="space-y-4">
            <SectionTitle>Request Details</SectionTitle>
            <div className="grid gap-3">
              <InfoCard
                icon={<Calendar className="h-5 w-5 text-[#006666]" />}
                label="Requested At"
              >
                {new Date(dto.requestedAt).toLocaleString()}
              </InfoCard>

              {dto.description && (
                <InfoCard
                  icon={<FileText className="h-5 w-5 text-[#006666]" />}
                  label="Description"
                >
                  <span className="text-sm font-normal leading-relaxed">
                    {dto.description}
                  </span>
                </InfoCard>
              )}

              {dto.reason && (
                <NeumorphicCard className="!bg-[#FF2157]/5 dark:!bg-[#FF2157]/10 border-l-4 border-[#FF2157] rounded-l-none">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF2157]/10 dark:bg-[#FF2157]/20">
                      <AlertCircle className="h-5 w-5 text-[#FF2157]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#FF2157]">
                        Denial Reason
                      </p>
                      <p className={`mt-1 text-sm font-medium leading-relaxed ${N.text}`}>
                        {dto.reason}
                      </p>
                    </div>
                  </div>
                </NeumorphicCard>
              )}
            </div>
          </section>

          {/* Divider */}
          <Separator className="border-0 h-px bg-transparent  dark:" />

          {/* Actions */}
          <section className="space-y-4">
            <SectionTitle>Actions</SectionTitle>
            <AnimatePresence mode="wait">
              {dto.status === "pending" ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-wrap gap-3"
                >
                  {/* Deny */}
                  <Button
                    variant="outline"
                    onClick={() => setDenyOpen(true)}
                    className={`
                      h-11 gap-2 rounded-xl border-none font-semibold
                      text-[#FF2157]
                      ${N.surface} ${N.raisedSm}
                      hover:${N.raisedXs} active:${N.pressedSm}
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50 focus-visible:ring-offset-2
                    `}
                  >
                    <XCircle className="h-4 w-4" />
                    Deny Request
                  </Button>

                  {/* Update Password */}
                  <Button
                    onClick={() => setUpdateOpen(true)}
                    className={`
                      h-11 gap-2 rounded-xl border-none font-semibold
                      text-[#006666]
                      ${N.surface} ${N.raisedSm}
                      hover:${N.raisedXs} active:${N.pressedSm}
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 focus-visible:ring-offset-2
                    `}
                  >
                    <Key className="h-4 w-4" />
                    Update Password
                  </Button>
                </motion.div>
              ) : dto.status === "denied" ? (
                <motion.div
                  key="denied"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Button
                    onClick={() => setUpdateOpen(true)}
                    className={`
                      h-11 gap-2 rounded-xl border-none font-semibold
                      text-[#006666]
                      ${N.surface} ${N.raisedSm}
                      hover:${N.raisedXs} active:${N.pressedSm}
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 focus-visible:ring-offset-2
                    `}
                  >
                    <Key className="h-4 w-4" />
                    Update Password
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="fulfilled"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`
                    flex items-center gap-3 rounded-2xl p-4
                    bg-[#00A63D]/10 dark:bg-[#00A63D]/20
                    ${N.pressedSm}
                  `}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00A63D]" />
                  <p className={`text-sm font-medium ${N.text}`}>
                    This request has been fulfilled.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </motion.div>

        {/* ── Child Dialogs ── */}
        <DenyDialog
          open={denyOpen}
          onOpenChange={setDenyOpen}
          onConfirm={(reason) =>
            denyRequest({ requestId: dto._id, reason }).then(() => {
              setDenyOpen(false);
              onOpenChange(false);
            })
          }
        />
        <UpdatePasswordDialog
          open={updateOpen}
          onOpenChange={setUpdateOpen}
          onConfirm={(newPassword, notify) =>
            updatePassword({
              requestId: dto._id,
              newPassword,
              notifyRequester: notify,
            }).then(() => {
              setUpdateOpen(false);
              onOpenChange(false);
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}