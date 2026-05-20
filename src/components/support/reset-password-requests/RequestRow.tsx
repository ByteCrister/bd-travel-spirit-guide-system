"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ResetRequestEntity } from "@/types/employee/password-reset.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import RequestDetailsDrawer from "./RequestDetailsDrawer";
import { REQUEST_STATUS } from "@/constants/employee/reset-password-request.const";

interface RequestRowProps {
  entity: ResetRequestEntity;
}

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export default function RequestRow({ entity }: RequestRowProps) {
  const { id, attributes } = entity;
  const [open, setOpen] = useState(false);

  const getStatusConfig = () => {
    switch (attributes.status) {
      case REQUEST_STATUS.PENDING:
        return {
          badge: (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-lg border-none bg-[#E7E5E4] px-3 py-1 text-xs font-semibold shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] text-[#FE9900]"
            >
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
          ),
          rowHoverClass:
            "hover:shadow-[inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff]",
        };
      case REQUEST_STATUS.DENIED:
        return {
          badge: (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-lg border-none bg-[#E7E5E4] px-3 py-1 text-xs font-semibold shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] text-[#FF2157]"
            >
              <XCircle className="h-3 w-3" />
              Denied
            </Badge>
          ),
          rowHoverClass:
            "hover:shadow-[inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff]",
        };
      default:
        return {
          badge: (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-lg border-none bg-[#E7E5E4] px-3 py-1 text-xs font-semibold shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] text-[#00A63D]"
            >
              <CheckCircle2 className="h-3 w-3" />
              Fulfilled
            </Badge>
          ),
          rowHoverClass:
            "hover:shadow-[inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff]",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <motion.tr
        variants={rowVariants}
        className={`group border-b border-[#D6D3D1] bg-[#E7E5E4] transition-shadow duration-200 ${statusConfig.rowHoverClass}`}
      >
        {/* Requester email & mobile */}
        <td className="px-3 py-2.5">
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium text-[#1E2938]">
              {attributes.requesterEmail}
            </span>
            {attributes.requesterMobile && (
              <span className="truncate text-xs text-[#1E2938]/60">
                {attributes.requesterMobile}
              </span>
            )}
          </div>
        </td>

        {/* Requester name */}
        <td className="px-3 py-2.5">
          {attributes.requesterName ? (
            <span className="text-sm text-[#1E2938]">
              {attributes.requesterName}
            </span>
          ) : (
            <span className="text-sm italic text-[#1E2938]/40">N/A</span>
          )}
        </td>

        {/* Status badge */}
        <td className="px-3 py-2.5">{statusConfig.badge}</td>

        {/* Request date & time */}
        <td className="px-3 py-2.5">
          <div className="flex flex-col">
            <span className="text-sm text-[#1E2938]">
              {new Date(attributes.requestedAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-[#1E2938]/60">
              {new Date(attributes.requestedAt).toLocaleTimeString()}
            </span>
          </div>
        </td>

        {/* View button */}
        <td className="px-3 py-2.5 text-right">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpen(true)}
              className="h-9 gap-2 rounded-lg border-none bg-[#E7E5E4] px-3 text-sm font-semibold text-[#006666] shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] transition-shadow duration-200 hover:shadow-[2px_2px_4px_#cac8c7,-2px_-2px_4px_#ffffff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2 active:shadow-[inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff]"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          </motion.div>
        </td>
      </motion.tr>

      <RequestDetailsDrawer open={open} onOpenChange={setOpen} requestId={id} />
    </>
  );
}