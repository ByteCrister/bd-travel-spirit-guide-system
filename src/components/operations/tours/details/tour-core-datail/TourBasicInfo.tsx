"use client";

import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour/tour.const";
import { TourDetailDTO } from "@/types/tour/tour.types";
import {
    Building, Calendar, Eye, Heart, Share2, Star,
    Tag, Image as ImageIcon, Sparkles, TrendingUp, User, Clock
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4]  border border-white/60";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] ";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] ";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_BADGE = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#E7E5E4] text-[#1E2938] ";
const NEU_BADGE_PRIMARY = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#006666]/10 text-[#006666] ";
const ROW_ITEM = `flex items-center justify-between py-2.5`;

// ── Status helpers ────────────────────────────────────────────
const TOUR_STATUS_STYLES: Record<string, string> = {
    [TOUR_STATUS.ACTIVE]: "bg-[#00A63D]/10 text-[#00A63D] ",
    [TOUR_STATUS.SUBMITTED]: "bg-[#006666]/10 text-[#006666] ",
    [TOUR_STATUS.DRAFT]: "bg-[#1E2938]/10 text-[#1E2938]/60 ",
    [TOUR_STATUS.COMPLETED]: "bg-[#006666]/20 text-[#006666] ",
    [TOUR_STATUS.TERMINATED]: "bg-[#FF2157]/10 text-[#FF2157] ",
    [TOUR_STATUS.ARCHIVED]: "bg-[#1E2938]/5 text-[#1E2938]/40 ",
};

const MODERATION_STATUS_STYLES: Record<string, string> = {
    [MODERATION_STATUS.APPROVED]: "bg-[#00A63D]/10 text-[#00A63D] ",
    [MODERATION_STATUS.PENDING]: "bg-[#FE9900]/10 text-[#FE9900] ",
    [MODERATION_STATUS.DENIED]: "bg-[#FF2157]/10 text-[#FF2157] ",
    [MODERATION_STATUS.SUSPENDED]: "bg-[#FE9900]/20 text-[#FE9900] ",
};

const getStatusStyle = (status: string) =>
    TOUR_STATUS_STYLES[status] ?? "bg-[#1E2938]/5 text-[#1E2938]/40 ";

const getModerationStyle = (status: string) =>
    MODERATION_STATUS_STYLES[status] ?? "bg-[#1E2938]/5 text-[#1E2938]/40 ";

interface TourBasicInfoProps {
    tour: TourDetailDTO;
}

const TourBasicInfo = ({ tour }: TourBasicInfoProps) => {
    return (
        <div className={`${NEU_CARD} p-1 overflow-hidden`}>
            {/* ── Header ── */}
            <div className="px-6 py-5 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Title block */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`${NEU_HEADING} text-2xl md:text-3xl`}
                            >
                                {tour.title}
                            </motion.h1>
                            {tour.featured && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#FE9900]/10 text-[#FE9900] "
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Featured
                                </motion.span>
                            )}
                        </div>
                        <p className={`${NEU_MUTED} leading-relaxed`}>{tour.summary}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 bg-[#E7E5E4] ">
                            {tour.slug}
                        </span>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 ${getStatusStyle(tour.status)}`}>
                            {tour.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 ${getModerationStyle(tour.moderationStatus)}`}>
                            {tour.moderationStatus}
                        </span>
                    </div>
                </div>
                <div className={`mt-5 border-t ${NEU_DIVIDER}`} />
            </div>

            <div className="px-6 pb-6 space-y-8">
                {/* ── Hero Image ── */}
                {tour.heroImage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-[#006666]" />
                            <span className={NEU_LABEL}>Hero Image</span>
                        </div>
                        <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden  group">
                            <Image
                                src={tour.heroImage}
                                alt={`${tour.title} hero image`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E2938]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                )}

                {/* ── Gallery ── */}
                {tour.gallery && tour.gallery.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-[#006666]" />
                                <span className={NEU_LABEL}>Gallery</span>
                                <span className={NEU_BADGE_PRIMARY}>{tour.gallery.length}</span>
                            </div>
                            {tour.gallery.length > 4 && (
                                <span className={NEU_BADGE}>+{tour.gallery.length - 4} more</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tour.gallery.slice(0, 4).map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                    className="relative aspect-square rounded-xl overflow-hidden  hover: hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                                >
                                    <Image
                                        src={image}
                                        alt={`${tour.title} gallery ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                    {index === 3 && (tour.gallery ?? []).length > 4 && (
                                        <div className="absolute inset-0 bg-[#1E2938]/70 flex items-center justify-center backdrop-blur-sm">
                                            <span className="font-[family-name:var(--font-space-mono)] text-white font-bold text-lg">
                                                +{(tour.gallery ?? []).length - 4}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E2938]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div className={`border-t ${NEU_DIVIDER}`} />

                {/* ── Info Grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Organisation */}
                    <div className={`${NEU_CARD_SM} p-5 space-y-5`}>
                        <div className="flex items-center gap-2">
                            <div className={NEU_ICON_WELL}>
                                <Building className="h-4 w-4 text-[#006666]" />
                            </div>
                            <span className={`${NEU_HEADING} text-base`}>Organisation</span>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />

                        {/* Company */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <Building className="h-3 w-3 text-[#006666]" />
                                <span className={NEU_LABEL}>Company</span>
                            </div>
                            <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 space-y-2`}>
                                <div className={ROW_ITEM}>
                                    <span className={NEU_MUTED}>Name</span>
                                    <span className={`${NEU_MONO} text-sm font-semibold`}>{tour.companyInfo?.name || "N/A"}</span>
                                </div>
                                {tour.companyInfo?.createdAt && (
                                    <div className={`${ROW_ITEM} border-t ${NEU_DIVIDER}`}>
                                        <span className={NEU_MUTED}>Since</span>
                                        <span className={`${NEU_MONO} text-xs`}>
                                            {new Date(tour.companyInfo.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Author */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3 text-[#006666]" />
                                <span className={NEU_LABEL}>Author</span>
                            </div>
                            <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 space-y-2`}>
                                <div className={ROW_ITEM}>
                                    <span className={NEU_MUTED}>Name</span>
                                    <span className={`${NEU_MONO} text-sm font-semibold`}>{tour.authorInfo?.name || "N/A"}</span>
                                </div>
                                <div className={`${ROW_ITEM} border-t ${NEU_DIVIDER}`}>
                                    <span className={NEU_MUTED}>Email</span>
                                    <span className={`${NEU_MONO} text-xs truncate ml-2 max-w-[130px] text-right`}>{tour.authorInfo?.email || "N/A"}</span>
                                </div>
                                {tour.authorInfo?.avatarUrl && (
                                    <div className={`${ROW_ITEM} border-t ${NEU_DIVIDER}`}>
                                        <span className={NEU_MUTED}>Avatar</span>
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden ">
                                            <Image
                                                src={tour.authorInfo.avatarUrl}
                                                alt={tour.authorInfo.name}
                                                fill
                                                sizes="32px"
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Categories */}
                        {tour.categories && tour.categories.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="h-3 w-3 text-[#006666]" />
                                    <span className={NEU_LABEL}>Categories</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tour.categories.map((cat) => (
                                        <span key={cat} className={NEU_BADGE_PRIMARY}>{cat}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
                        <div className="flex items-center gap-2">
                            <div className={NEU_ICON_WELL}>
                                <Calendar className="h-4 w-4 text-[#006666]" />
                            </div>
                            <span className={`${NEU_HEADING} text-base`}>Timeline</span>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />

                        <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 space-y-2`}>
                            <div className={ROW_ITEM}>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3 text-[#1E2938]/40" />
                                    <span className={NEU_MUTED}>Created</span>
                                </div>
                                <span className={`${NEU_MONO} text-xs`}>
                                    {new Date(tour.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className={`${ROW_ITEM} border-t ${NEU_DIVIDER}`}>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3 text-[#1E2938]/40" />
                                    <span className={NEU_MUTED}>Updated</span>
                                </div>
                                <span className={`${NEU_MONO} text-xs`}>
                                    {new Date(tour.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            {tour.publishedAt && (
                                <div className={`${ROW_ITEM} border-t ${NEU_DIVIDER}`}>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-[#00A63D]" />
                                        <span className={NEU_MUTED}>Published</span>
                                    </div>
                                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#00A63D] font-semibold">
                                        {new Date(tour.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {tour.completedAt && (
                                <div className={`${ROW_ITEM} border-t ${NEU_DIVIDER}`}>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-[#006666]" />
                                        <span className={NEU_MUTED}>Completed</span>
                                    </div>
                                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#006666] font-semibold">
                                        {new Date(tour.completedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Engagement */}
                    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
                        <div className="flex items-center gap-2">
                            <div className={NEU_ICON_WELL}>
                                <TrendingUp className="h-4 w-4 text-[#006666]" />
                            </div>
                            <span className={`${NEU_HEADING} text-base`}>Engagement</span>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />

                        <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 space-y-2`}>
                            {[
                                { icon: <Eye className="h-3.5 w-3.5 text-[#006666]" />, label: "Views", value: tour.viewCount.toLocaleString() },
                                { icon: <Heart className="h-3.5 w-3.5 text-[#FF2157]" />, label: "Likes", value: tour.likeCount.toLocaleString() },
                                { icon: <Heart className="h-3.5 w-3.5 text-[#1E2938]/40" />, label: "Wishlists", value: tour.wishlistCount.toLocaleString() },
                                { icon: <Share2 className="h-3.5 w-3.5 text-[#1E2938]/40" />, label: "Shares", value: tour.shareCount.toLocaleString() },
                            ].map(({ icon, label, value }, i, arr) => (
                                <div key={label} className={`${ROW_ITEM} ${i < arr.length - 1 ? `border-b ${NEU_DIVIDER}` : ""}`}>
                                    <div className="flex items-center gap-2">
                                        {icon}
                                        <span className={NEU_MUTED}>{label}</span>
                                    </div>
                                    <span className={`${NEU_MONO} text-sm font-semibold`}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Rating */}
                        <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-[#FE9900] fill-[#FE9900]" />
                                <span className={NEU_LABEL}>Rating</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-[family-name:var(--font-space-mono)] text-lg font-bold text-[#FE9900]">
                                    {tour.ratings?.average?.toFixed(1) || "0.0"}
                                </span>
                                <span className={NEU_MUTED}>({tour.ratings?.count || 0})</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TourBasicInfo;