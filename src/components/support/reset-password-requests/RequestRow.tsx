"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ResetRequestEntity } from "@/types/employee/password-reset.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import RequestDetailsDrawer from "./RequestDetailsDrawer";
import { REQUEST_STATUS } from "@/constants/employee/reset-password-request.const";

/* ─── Neumorphic style tokens ────────────────────────────────────────────── */
const N = {
  surface: "bg-[#E7E5E4] dark:bg-[#2A2A2A]",
  text: "text-[#1E2938] dark:text-white",
  textMuted: "text-[#1E2938]/60 dark:text-white/50",
  raisedSm:
    " dark:",
  raisedXs:
    " dark:",
  pressedSm:
    "[box-shadow:inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff] dark:[box-shadow:inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#3a3a3a]",
} as const;

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface RequestRowProps {
  entity: ResetRequestEntity;
}

/* ─── Animation ──────────────────────────────────────────────────────────── */
const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { badge: React.ReactNode }
> = {
  [REQUEST_STATUS.PENDING]: {
    badge: (
      <Badge
        variant="outline"
        className={`inline-flex items-center gap-1.5 rounded-lg border-none px-3 py-1 text-xs font-semibold text-[#FE9900] ${N.surface} ${N.raisedSm}`}
      >
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    ),
  },
  [REQUEST_STATUS.DENIED]: {
    badge: (
      <Badge
        variant="outline"
        className={`inline-flex items-center gap-1.5 rounded-lg border-none px-3 py-1 text-xs font-semibold text-[#FF2157] ${N.surface} ${N.raisedSm}`}
      >
        <XCircle className="h-3 w-3" />
        Denied
      </Badge>
    ),
  },
  fulfilled: {
    badge: (
      <Badge
        variant="outline"
        className={`inline-flex items-center gap-1.5 rounded-lg border-none px-3 py-1 text-xs font-semibold text-[#00A63D] ${N.surface} ${N.raisedSm}`}
      >
        <CheckCircle2 className="h-3 w-3" />
        Fulfilled
      </Badge>
    ),
  },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function RequestRow({ entity }: RequestRowProps) {
  const { id, attributes } = entity;
  const [open, setOpen] = useState(false);

  const statusCfg =
    STATUS_CONFIG[attributes.status] ?? STATUS_CONFIG.fulfilled;

  return (
    <>
      <motion.tr
        variants={rowVariants}
        className={`
          group border-b border-[#D6D3D1] dark:border-[#3a3a3a]
          ${N.surface} transition-shadow duration-200
          hover:${N.pressedSm}
        `}
      >
        {/* Email + mobile */}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className={`truncate text-sm font-semibold ${N.text}`}>
              {attributes.requesterEmail}
            </span>
            {attributes.requesterMobile && (
              <span className={`truncate text-xs ${N.textMuted}`}>
                {attributes.requesterMobile}
              </span>
            )}
          </div>
        </td>

        {/* Name */}
        <td className="px-4 py-3">
          {attributes.requesterName ? (
            <span className={`text-sm ${N.text}`}>{attributes.requesterName}</span>
          ) : (
            <span className={`text-sm italic ${N.textMuted}`}>N/A</span>
          )}
        </td>

        {/* Status badge */}
        <td className="px-4 py-3">{statusCfg.badge}</td>

        {/* Date/time */}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className={`text-sm ${N.text}`}>
              {new Date(attributes.requestedAt).toLocaleDateString()}
            </span>
            <span className={`text-xs ${N.textMuted}`}>
              {new Date(attributes.requestedAt).toLocaleTimeString()}
            </span>
          </div>
        </td>

        {/* View button */}
        <td className="px-4 py-3 text-right">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-block"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpen(true)}
              className={`
                h-9 gap-1.5 rounded-lg border-none text-sm font-semibold text-[#006666]
                ${N.surface} ${N.raisedSm}
                hover:${N.raisedXs} active:${N.pressedSm}
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2
              `}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </motion.div>
        </td>
      </motion.tr>

      <RequestDetailsDrawer open={open} onOpenChange={setOpen} requestId={id} />
    </>
  );
}