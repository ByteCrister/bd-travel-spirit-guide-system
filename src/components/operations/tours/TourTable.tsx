"use client";

import React, { useState } from "react";
import { ChevronDown, MapPin, TrendingUp, Eye, Heart, Share2, Calendar, Clock } from "lucide-react";
import { TourListItemDTO } from "@/types/tour/tour.types";
import { useTourDetailStore } from "@/store/tour-detail.store";
import TourTableSkeleton from "./skeletons/TourTableSkeleton";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import {
  NEU_SURFACE_INSET,
  NEU_SURFACE_INSET_SM,
  NEU_CARD_SM,
  NEU_BTN_ICON,
  NEU_HEADING,
  NEU_LABEL,
  NEU_MUTED,
  NEU_MONO,
  NEU_BADGE,
  NEU_BADGE_SUCCESS,
  NEU_BADGE_WARNING,
  NEU_BADGE_DANGER,
} from "@/styles/neu.styles";

// ─── Types ────────────────────────────────────────────────────
type Props = {
  list?: {
    items: TourListItemDTO[];
    total: number;
    page: number;
    pages: number;
  } | null;
};

// ─── Difficulty badge helper ──────────────────────────────────
const difficultyBadge = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case "easy":     return NEU_BADGE_SUCCESS;
    case "moderate": return NEU_BADGE_WARNING;
    case "hard":     return NEU_BADGE_DANGER;
    default:         return NEU_BADGE;
  }
};

// ─── Column headers config ────────────────────────────────────
const HEADERS = [
  { key: "expand",     label: "" },
  { key: "title",      label: "Title" },
  { key: "type",       label: "Type" },
  { key: "division",   label: "Division" },
  { key: "difficulty", label: "Difficulty" },
  { key: "price",      label: "Price" },
  { key: "ratings",    label: "Ratings" },
  { key: "wishlist",   label: "Wishlist" },
  { key: "views",      label: "Views" },
  { key: "published",  label: "Published" },
];

// ─── Component ────────────────────────────────────────────────
export const TourTable: React.FC<Props> = ({ list }) => {
  const router = useRouter();
  const { loading } = useTourDetailStore();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (loading["tours"]) return <TourTableSkeleton />;

  if (!list || list.items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${NEU_SURFACE_INSET} rounded-2xl py-16 text-center flex flex-col items-center gap-3`}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#E7E5E4] shadow-[5px_5px_10px_#c8c6c5,-5px_-5px_10px_#ffffff] flex items-center justify-center">
          <MapPin className="h-7 w-7 text-[#006666]/50" />
        </div>
        <p className={`${NEU_HEADING} text-base`}>No tours found</p>
        <p className={NEU_MUTED}>Try adjusting your filters to see more results.</p>
      </motion.div>
    );
  }

 const toggleRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };
    
  return (
    <div className="overflow-auto rounded-2xl">
      <table className="w-full border-collapse">
        {/* ── Header ── */}
        <thead>
          <tr className={`${NEU_SURFACE_INSET} rounded-xl`}>
            {HEADERS.map((h) => (
              <th
                key={h.key}
                className={`px-4 py-3 text-left ${NEU_LABEL} whitespace-nowrap`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {list.items.map((t, index) => {
            const isExpanded = expandedRows.has(t.id);

            return (
              <React.Fragment key={t.id}>
                {/* ── Main row ── */}
                <motion.tr
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  className={`
                    cursor-pointer group
                    border-b border-[#1E2938]/5 last:border-0
                    hover:bg-[#006666]/[0.03]
                    transition-colors duration-200
                    ${isExpanded ? "bg-[#006666]/[0.04]" : ""}
                  `}
                  onClick={() =>
                    router.push(`/operations/tours/${encodeId(t.id)}`)
                  }
                >
                  {/* Expand btn */}
                  <td className="px-4 py-3 w-12">
                    <button
                      aria-label={isExpanded ? "Collapse row" : "Expand row"}
                      aria-expanded={isExpanded}
                      onClick={(e) => toggleRow(t.id, e)}
                      className={`${NEU_BTN_ICON} ${
                        isExpanded
                          ? "!bg-[#006666]/10 !text-[#006666] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]"
                          : ""
                      }`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`${NEU_HEADING} text-sm group-hover:text-[#006666] transition-colors`}
                      >
                        {t.title}
                      </span>
                      <span className={`${NEU_MONO} text-xs text-[#1E2938]/40`}>
                        {t.slug}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={NEU_BADGE}>{t.tourType}</span>
                  </td>

                  {/* Division */}
                  <td className="px-4 py-3">
                    <span className={NEU_MUTED}>{t.division}</span>
                  </td>

                  {/* Difficulty */}
                  <td className="px-4 py-3">
                    <span className={difficultyBadge(t.difficulty)}>
                      {t.difficulty}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <div className="flex items-baseline gap-1">
                      <span className={`${NEU_HEADING} text-sm`}>
                        {t.basePrice.amount}
                      </span>
                      <span className={`${NEU_MUTED} text-xs`}>
                        {t.basePrice.currency}
                      </span>
                    </div>
                  </td>

                  {/* Ratings */}
                  <td className="px-4 py-3">
                    {t.ratings ? (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-[#FE9900]" />
                        <span className={`${NEU_HEADING} text-sm`}>
                          {t.ratings.average.toFixed(1)}
                        </span>
                        <span className={`${NEU_MUTED} text-xs`}>
                          ({t.ratings.count})
                        </span>
                      </div>
                    ) : (
                      <span className={NEU_MUTED}>—</span>
                    )}
                  </td>

                  {/* Wishlist */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-[#FF2157]/60" />
                      <span className={`${NEU_MONO} text-sm`}>{t.wishlistCount}</span>
                    </div>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-[#006666]/60" />
                      <span className={`${NEU_MONO} text-sm`}>{t.viewCount}</span>
                    </div>
                  </td>

                  {/* Published */}
                  <td className="px-4 py-3">
                    {t.publishedAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#1E2938]/40" />
                        <span className={`${NEU_MONO} text-xs`}>
                          {new Date(t.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className={NEU_MUTED}>—</span>
                    )}
                  </td>
                </motion.tr>

                {/* ── Expanded detail row ── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-0"
                    >
                      <td
                        colSpan={10}
                        className="p-0 border-b border-[#1E2938]/5"
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div
                            className={`${NEU_SURFACE_INSET_SM} grid grid-cols-2 md:grid-cols-4 gap-3 p-5 mx-4 my-3 rounded-2xl`}
                          >
                            <InfoTile icon={MapPin}    label="District"       value={t.district} />
                            <InfoTile icon={TrendingUp} label="Status"         value={t.status} />
                            <InfoTile               label="Moderation"      value={t.moderationStatus} />
                            <InfoTile               label="Featured"        value={t.featured ? "Yes" : "No"} />
                            <InfoTile icon={Clock}    label="Duration"       value={t.duration ? `${t.duration.days} days` : "—"} />
                            <InfoTile icon={Calendar} label="Next Departure" value={t.nextDeparture ?? "—"} />
                            <InfoTile icon={Heart}    label="Likes"          value={t.likeCount} />
                            <InfoTile icon={Share2}   label="Shares"         value={t.shareCount} />
                            <InfoTile               label="Occupancy"      value={t.occupancyPercentage ? `${t.occupancyPercentage}%` : "—"} />
                            <InfoTile               label="Created"        value={new Date(t.createdAt).toLocaleDateString()} />
                            <InfoTile               label="Updated"        value={new Date(t.updatedAt).toLocaleDateString()} />
                          </div>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Info tile sub-component ──────────────────────────────────
const InfoTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: React.ReactNode;
}) => (
  <div
    className={`
      ${NEU_CARD_SM} p-3 flex flex-col gap-1.5
      hover:shadow-[5px_5px_10px_#c8c6c5,-5px_-5px_10px_#ffffff]
      transition-all duration-200
    `}
  >
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3 text-[#006666]" />}
      <span className={`${NEU_LABEL} text-[10px]`}>{label}</span>
    </div>
    <span className={`${NEU_HEADING} text-sm`}>{value}</span>
  </div>
);